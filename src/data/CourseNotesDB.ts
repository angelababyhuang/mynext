import Dexie, { Table } from 'dexie';

// 定义数据库表结构
export interface KnowledgeCard {
  id: string;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  difficulty: number; // 1-5
  reviewCount: number;
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  interval?: number; // 复习间隔（天）
  easeFactor?: number; // 记忆难度系数
  isDeleted: number; // 0: 正常, 1: 已删除
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: number; // 0: 正常, 1: 已删除
}

export interface TreeNode {
  id: string;
  cardId: string;
  bookId: string;
  parentId?: string;
  position: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewData {
  id: string;
  cardId: string;
  difficulty: number; // 1-5
  interval: number;
  easeFactor: number;
  nextReview: Date;
  reviewedAt: Date;
}

// 定义数据库类
export class CourseNotesDB extends Dexie {
  public knowledgeCards!: Table<KnowledgeCard, string>;
  public books!: Table<Book, string>;
  public treeNodes!: Table<TreeNode, string>;
  public reviewData!: Table<ReviewData, string>;

  constructor() {
    super('CourseNotesDB');
    
    // 定义数据库版本和表结构
    this.version(1).stores({
      knowledgeCards: 'id, title, createdAt, updatedAt, difficulty, reviewCount, nextReviewAt, isDeleted',
      books: 'id, title, author, createdAt, updatedAt, isDeleted',
      treeNodes: 'id, cardId, bookId, parentId, position',
      reviewData: 'id, cardId, difficulty, nextReview, reviewedAt'
    });
  }
}

// 创建数据库实例
export const db = new CourseNotesDB();