import { db } from '../CourseNotesDB';
import { KnowledgeCard } from '../CourseNotesDB';

// 创建知识卡片
export async function createKnowledgeCard(data: Omit<KnowledgeCard, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'isDeleted'>): Promise<string> {
  const now = new Date();
  const id = crypto.randomUUID();
  
  const card: KnowledgeCard = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
      isDeleted: 0,
      easeFactor: 2.5, // 默认记忆难度系数
      interval: 1 // 默认复习间隔1天
    };
  
  await db.knowledgeCards.add(card);
  return id;
}

// 获取知识卡片（排除已删除的）
export async function getKnowledgeCard(id: string): Promise<KnowledgeCard | undefined> {
  return await db.knowledgeCards.get(id);
}

// 获取所有知识卡片（排除已删除的）
export async function getAllKnowledgeCards(): Promise<KnowledgeCard[]> {
  return await db.knowledgeCards
    .where('isDeleted')
    .equals(0)
    .toArray();
}

// 按书籍获取知识卡片
export async function getKnowledgeCardsByBook(bookId: string): Promise<KnowledgeCard[]> {
  return await db.knowledgeCards
    .where('isDeleted')
    .equals(0)
    .filter(card => card.tags.includes(bookId))
    .toArray();
}

// 获取需要复习的卡片
export async function getCardsForReview(): Promise<KnowledgeCard[]> {
  const now = new Date();
  return await db.knowledgeCards
    .where('isDeleted')
    .equals(0)
    .and(card => card.nextReviewAt ? card.nextReviewAt <= now : true)
    .toArray();
}

// 更新知识卡片
export async function updateKnowledgeCard(id: string, updates: Partial<Omit<KnowledgeCard, 'id' | 'createdAt'>>): Promise<void> {
  const card = await getKnowledgeCard(id);
  if (!card) {
    throw new Error('Knowledge card not found');
  }
  
  await db.knowledgeCards.update(id, {
    ...updates,
    updatedAt: new Date()
  });
}

// 软删除知识卡片
export async function deleteKnowledgeCard(id: string): Promise<void> {
  await updateKnowledgeCard(id, { isDeleted: 1 });
}

// 恢复知识卡片
export async function restoreKnowledgeCard(id: string): Promise<void> {
  await updateKnowledgeCard(id, { isDeleted: 0 });
}

// 永久删除知识卡片
export async function permanentlyDeleteKnowledgeCard(id: string): Promise<void> {
  await db.knowledgeCards.delete(id);
}

// 搜索知识卡片
export async function searchKnowledgeCards(query: string): Promise<KnowledgeCard[]> {
  const lowerQuery = query.toLowerCase();
  return await db.knowledgeCards
    .where('isDeleted')
    .equals(0)
    .filter(card => 
      card.title.toLowerCase().includes(lowerQuery) ||
      card.description?.toLowerCase().includes(lowerQuery) ||
      card.content.toLowerCase().includes(lowerQuery) ||
      card.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
    .toArray();
}