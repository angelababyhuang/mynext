// 兼容Node.js的CommonJS版本
const Dexie = require('dexie');

// 定义数据库表结构
// KnowledgeCard - 知识卡片表
const KnowledgeCard = {
  id: String,
  title: String,
  description: String,
  content: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
  difficulty: Number, // 1-5
  reviewCount: Number,
  lastReviewedAt: Date,
  nextReviewAt: Date,
  interval: Number, // 复习间隔（天）
  easeFactor: Number, // 记忆难度系数
  isDeleted: Boolean
};

// Book - 书籍表
const Book = {
  id: String,
  title: String,
  author: String,
  description: String,
  coverImage: String,
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean
};

// TreeNode - 树节点表
const TreeNode = {
  id: String,
  cardId: String,
  bookId: String,
  parentId: String,
  position: Object,
  createdAt: Date,
  updatedAt: Date
};

// ReviewData - 复习数据表
const ReviewData = {
  id: String,
  cardId: String,
  difficulty: Number, // 1-5
  interval: Number,
  easeFactor: Number,
  nextReview: Date,
  reviewedAt: Date
};

// 课程笔记数据库类
class CourseNotesDB extends Dexie {
  constructor() {
    super('CourseNotesDB');
    
    // 定义数据库版本和表结构
    this.version(1).stores({
      knowledgeCards: 'id, title, bookId, difficulty, reviewCount, nextReviewAt, isDeleted, createdAt',
      books: 'id, title, author, isDeleted, createdAt',
      treeNodes: 'id, cardId, bookId, parentId, createdAt',
      reviewData: 'id, cardId, nextReview, reviewedAt'
    });

    // 定义表
    this.knowledgeCards = this.table('knowledgeCards');
    this.books = this.table('books');
    this.treeNodes = this.table('treeNodes');
    this.reviewData = this.table('reviewData');
  }
}

// 在Node.js环境中配置fake-indexeddb
if (typeof window === 'undefined') {
  const { indexedDB, IDBKeyRange } = require('fake-indexeddb');
  Dexie.dependencies.indexedDB = indexedDB;
  Dexie.dependencies.IDBKeyRange = IDBKeyRange;
}

// 创建数据库实例
const db = new CourseNotesDB();

// 导出
module.exports = {
  CourseNotesDB,
  db
};