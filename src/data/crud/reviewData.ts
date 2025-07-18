import { db } from '../CourseNotesDB';
import { ReviewData } from '../CourseNotesDB';
import { updateKnowledgeCard } from './knowledgeCards';

// 创建复习记录
export async function createReviewData(data: Omit<ReviewData, 'id' | 'reviewedAt'>): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();
  
  const review: ReviewData = {
    id,
    ...data,
    reviewedAt: now
  };
  
  await db.reviewData.add(review);
  
  // 更新知识卡片的复习信息
  await updateKnowledgeCard(data.cardId, {
    lastReviewedAt: now,
    nextReviewAt: data.nextReview,
    reviewCount: (await getReviewCountByCard(data.cardId)) + 1,
    interval: data.interval,
    easeFactor: data.easeFactor
  });
  
  return id;
}

// 获取复习记录
export async function getReviewData(id: string): Promise<ReviewData | undefined> {
  return await db.reviewData.get(id);
}

// 获取卡片的所有复习记录
export async function getReviewDataByCard(cardId: string): Promise<ReviewData[]> {
  return await db.reviewData
    .where('cardId')
    .equals(cardId)
    .reverse()
    .toArray();
}

// 获取复习记录数量
export async function getReviewCountByCard(cardId: string): Promise<number> {
  return await db.reviewData
    .where('cardId')
    .equals(cardId)
    .count();
}

// 获取指定时间范围内的复习记录
export async function getReviewDataByDateRange(startDate: Date, endDate: Date): Promise<ReviewData[]> {
  return await db.reviewData
    .where('reviewedAt')
    .between(startDate, endDate, true, true)
    .toArray();
}

// 获取最近的复习记录
export async function getRecentReviewData(limit: number = 10): Promise<ReviewData[]> {
  return await db.reviewData
    .orderBy('reviewedAt')
    .reverse()
    .limit(limit)
    .toArray();
}

// 计算SM-2算法参数
export function calculateSM2(
  quality: number, // 回忆质量 0-5
  previousInterval: number = 1,
  previousEaseFactor: number = 2.5
): { interval: number; easeFactor: number; nextReview: Date } {
  let newEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // 确保easeFactor不小于1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }
  
  let newInterval: number;
  
  if (quality < 3) {
    // 如果回忆质量差，重置间隔为1天
    newInterval = 1;
  } else if (previousInterval === 1) {
    // 第一次复习
    newInterval = 6;
  } else {
    // 后续复习
    newInterval = Math.round(previousInterval * newEaseFactor);
  }
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  
  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReview
  };
}

// 创建复习记录并计算下一次复习时间
export async function recordReview(
  cardId: string,
  quality: number // 回忆质量 0-5
): Promise<string> {
  // 获取卡片当前信息
  const card = await db.knowledgeCards.get(cardId);
  if (!card) {
    throw new Error('Knowledge card not found');
  }
  
  // 计算新的复习参数
  const { interval, easeFactor, nextReview } = calculateSM2(
    quality,
    card.interval || 1,
    card.easeFactor || 2.5
  );
  
  // 创建复习记录
  return await createReviewData({
    cardId,
    difficulty: quality,
    interval,
    easeFactor,
    nextReview
  });
}

// 获取复习统计信息
export async function getReviewStatistics(): Promise<{
  totalReviews: number;
  averageQuality: number;
  cardsReviewedToday: number;
  cardsDueTomorrow: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  
  const totalReviews = await db.reviewData.count();
  
  const allReviews = await db.reviewData.toArray();
  const averageQuality = allReviews.length > 0 
    ? allReviews.reduce((sum, review) => sum + review.difficulty, 0) / allReviews.length 
    : 0;
  
  const cardsReviewedToday = await db.reviewData
    .where('reviewedAt')
    .between(today, tomorrow, true, false)
    .count();
  
  const cardsDueTomorrow = await db.knowledgeCards
    .where('nextReviewAt')
    .between(tomorrow, dayAfterTomorrow, true, false)
    .count();
  
  return {
    totalReviews,
    averageQuality: Math.round(averageQuality * 100) / 100,
    cardsReviewedToday,
    cardsDueTomorrow
  };
}