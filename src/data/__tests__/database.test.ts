import { db } from '../CourseNotesDB';
import { initializeDatabase } from '../database';
import * as crud from '../crud';

// 测试数据库设置
describe('Database Tests', () => {
  beforeEach(async () => {
    // 清除所有表数据但不删除数据库
    await db.knowledgeCards.clear();
    await db.books.clear();
    await db.treeNodes.clear();
    await db.reviewData.clear();
    await initializeDatabase();
  });

  afterAll(async () => {
    // 测试完成后关闭数据库
    await db.close();
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      await expect(initializeDatabase()).resolves.not.toThrow();
    });

    it('should create default book on first initialization', async () => {
      await initializeDatabase();
      const books = await crud.getAllBooks();
      expect(books).toHaveLength(1);
      expect(books[0].title).toBe('示例课程');
    });
  });

  describe('Knowledge Cards CRUD', () => {
    it('should create and retrieve a knowledge card', async () => {
      const bookId = await crud.createBook({
        title: 'Test Book',
        author: 'Test Author'
      });

      const cardId = await crud.createKnowledgeCard({
        title: 'Test Card',
        content: 'Test content',
        tags: [bookId, 'test'],
        difficulty: 3
      });

      const retrievedCard = await crud.getKnowledgeCard(cardId);
      expect(retrievedCard).toBeDefined();
      expect(retrievedCard?.title).toBe('Test Card');
      expect(retrievedCard?.reviewCount).toBe(0);
    });

    it('should update a knowledge card', async () => {
      const cardId = await crud.createKnowledgeCard({
        title: 'Original Title',
        content: 'Original content',
        tags: ['test'],
        difficulty: 2
      });

      await crud.updateKnowledgeCard(cardId, {
        title: 'Updated Title',
        difficulty: 4
      });

      const updatedCard = await crud.getKnowledgeCard(cardId);
      expect(updatedCard?.title).toBe('Updated Title');
      expect(updatedCard?.difficulty).toBe(4);
    });

    it('should soft delete a knowledge card', async () => {
      const cardId = await crud.createKnowledgeCard({
        title: 'To Delete',
        content: 'Content',
        tags: ['test'],
        difficulty: 1
      });

      await crud.deleteKnowledgeCard(cardId);
      const cards = await crud.getAllKnowledgeCards();
      expect(cards).toHaveLength(0);

      const allCards = await db.knowledgeCards.toArray();
      expect(allCards).toHaveLength(1);
      expect(allCards[0].isDeleted).toBe(1);
    });
  });

  describe('Books CRUD', () => {
    it('should create and retrieve a book', async () => {
      const bookId = await crud.createBook({
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description'
      });

      const book = await crud.getBook(bookId);
      expect(book).toBeDefined();
      expect(book?.title).toBe('Test Book');
      expect(book?.author).toBe('Test Author');
    });

    it('should search books', async () => {
      await crud.createBook({
        title: 'JavaScript Guide',
        author: 'John Doe',
        description: 'Complete JavaScript tutorial'
      });

      await crud.createBook({
        title: 'React Handbook',
        author: 'Jane Smith',
        description: 'React development guide'
      });

      const results = await crud.searchBooks('JavaScript');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('JavaScript Guide');
    });
  });

  describe('Tree Nodes CRUD', () => {
    it('should create and retrieve tree nodes', async () => {
      const bookId = await crud.createBook({
        title: 'Test Book',
        author: 'Test Author'
      });

      const cardId = await crud.createKnowledgeCard({
        title: 'Test Card',
        content: 'Test content',
        tags: [bookId],
        difficulty: 2
      });

      const nodeId = await crud.createTreeNode({
        cardId,
        bookId,
        position: { x: 100, y: 200 }
      });

      const node = await crud.getTreeNode(nodeId);
      expect(node).toBeDefined();
      expect(node?.position.x).toBe(100);
      expect(node?.position.y).toBe(200);
    });

    it('should handle parent-child relationships', async () => {
      const bookId = await crud.createBook({
        title: 'Test Book',
        author: 'Test Author'
      });

      const cardId = await crud.createKnowledgeCard({
        title: 'Test Card',
        content: 'Test content',
        tags: [bookId],
        difficulty: 2
      });

      const parentId = await crud.createTreeNode({
        cardId,
        bookId,
        position: { x: 0, y: 0 }
      });

      const childId = await crud.createTreeNode({
        cardId,
        bookId,
        parentId,
        position: { x: 100, y: 100 }
      });

      const children = await crud.getChildNodes(parentId);
      expect(children).toHaveLength(1);
      expect(children[0].id).toBe(childId);
    });
  });

  describe('Review Data CRUD', () => {
    it('should create review data and update card', async () => {
      const cardId = await crud.createKnowledgeCard({
        title: 'Test Card',
        content: 'Test content',
        tags: ['test'],
        difficulty: 3
      });

      await crud.createReviewData({
        cardId,
        difficulty: 4,
        interval: 3,
        easeFactor: 2.6,
        nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      });

      const reviews = await crud.getReviewDataByCard(cardId);
      expect(reviews).toHaveLength(1);
      expect(reviews[0].difficulty).toBe(4);

      const card = await crud.getKnowledgeCard(cardId);
      expect(card?.reviewCount).toBe(1);
    });

    it('should calculate SM-2 algorithm correctly', () => {
      const result = crud.calculateSM2(5, 1, 2.5);
      expect(result.interval).toBe(6);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('should record review with SM-2 calculation', async () => {
      const cardId = await crud.createKnowledgeCard({
        title: 'Test Card',
        content: 'Test content',
        tags: ['test'],
        difficulty: 2
      });

      await crud.recordReview(cardId, 4);

      const reviews = await crud.getReviewDataByCard(cardId);
      expect(reviews).toHaveLength(1);
      expect(reviews[0].difficulty).toBe(4);

      const card = await crud.getKnowledgeCard(cardId);
      expect(card?.reviewCount).toBe(1);
      expect(card?.nextReviewAt).toBeDefined();
    });
  });

  describe('Search Functionality', () => {
    it('should search knowledge cards by title and content', async () => {
      await crud.createKnowledgeCard({
        title: 'JavaScript Basics',
        content: 'Learn JavaScript fundamentals',
        tags: ['javascript', 'basics'],
        difficulty: 2
      });

      await crud.createKnowledgeCard({
        title: 'React Components',
        content: 'Understanding React component lifecycle',
        tags: ['react', 'components'],
        difficulty: 3
      });

      const results = await crud.searchKnowledgeCards('JavaScript');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('JavaScript Basics');
    });
  });

  describe('Database Export/Import', () => {
    it('should export and import database correctly', async () => {
      const { exportDatabase, importDatabase } = await import('../database');
      
      // 创建测试数据
      const bookId = await crud.createBook({
        title: 'Export Test Book',
        author: 'Test Author'
      });

      const cardId = await crud.createKnowledgeCard({
        title: 'Export Test Card',
        content: 'Test content for export',
        tags: [bookId],
        difficulty: 2
      });

      // 导出数据
      const exportedData = await exportDatabase();
      expect(exportedData).toContain('Export Test Book');
      expect(exportedData).toContain('Export Test Card');

      // 清除数据
      await db.knowledgeCards.clear();
      await db.books.clear();
      await db.treeNodes.clear();
      await db.reviewData.clear();

      // 导入数据
      await importDatabase(exportedData);

      // 验证数据已恢复
      const books = await crud.getAllBooks();
      expect(books.some(book => book.title === 'Export Test Book')).toBe(true);
    });
  });
});