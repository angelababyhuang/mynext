import {
  validateKnowledgeCard,
  validateBook,
  validateChapter,
  validateTreeNode,
  validateReviewData,
  validateCompleteKnowledgeCard,
  validateRequired,
  validateStringLength,
  validateNumberRange,
  ValidationResult
} from '../validation';
import { CreateCardData, CreateBookData, CreateChapterData, CreateTreeNodeData, ReviewData, KnowledgeCard } from '@/types';

describe('Validation Functions', () => {
  describe('validateRequired', () => {
    it('should return error for null value', () => {
      const result = validateRequired(null, 'test');
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('test');
      expect(result[0].message).toBe('test is required');
    });

    it('should return error for undefined value', () => {
      const result = validateRequired(undefined, 'test');
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('test');
    });

    it('should return error for empty string', () => {
      const result = validateRequired('', 'test');
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('test');
    });

    it('should return no errors for valid value', () => {
      const result = validateRequired('valid', 'test');
      expect(result).toHaveLength(0);
    });
  });

  describe('validateStringLength', () => {
    it('should return error for string too short', () => {
      const result = validateStringLength('ab', 'test', 3, 10);
      expect(result).toHaveLength(1);
      expect(result[0].message).toContain('at least 3 characters');
    });

    it('should return error for string too long', () => {
      const result = validateStringLength('abcdefghijk', 'test', 3, 10);
      expect(result).toHaveLength(1);
      expect(result[0].message).toContain('no more than 10 characters');
    });

    it('should return no errors for valid length', () => {
      const result = validateStringLength('valid', 'test', 3, 10);
      expect(result).toHaveLength(0);
    });
  });

  describe('validateNumberRange', () => {
    it('should return error for number too small', () => {
      const result = validateNumberRange(0, 'test', 1, 10);
      expect(result).toHaveLength(1);
      expect(result[0].message).toContain('between 1 and 10');
    });

    it('should return error for number too large', () => {
      const result = validateNumberRange(15, 'test', 1, 10);
      expect(result).toHaveLength(1);
      expect(result[0].message).toContain('between 1 and 10');
    });

    it('should return no errors for valid range', () => {
      const result = validateNumberRange(5, 'test', 1, 10);
      expect(result).toHaveLength(0);
    });
  });

  describe('validateKnowledgeCard', () => {
    const validCard: CreateCardData = {
      title: 'Test Card',
      content: 'This is test content',
      tags: ['test', 'example']
    };

    it('should validate a correct card', () => {
      const result = validateKnowledgeCard(validCard);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing title', () => {
      const invalidCard = { ...validCard, title: '' };
      const result = validateKnowledgeCard(invalidCard);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    it('should return error for missing content', () => {
      const invalidCard = { ...validCard, content: '' };
      const result = validateKnowledgeCard(invalidCard);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'content')).toBe(true);
    });

    it('should return error for invalid tags', () => {
      const invalidCard = { ...validCard, tags: ['test', 123 as unknown as string] };
      const result = validateKnowledgeCard(invalidCard);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'tags[1]')).toBe(true);
    });

    it('should return error for tag too long', () => {
      const longTag = 'a'.repeat(51);
      const invalidCard = { ...validCard, tags: [longTag] };
      const result = validateKnowledgeCard(invalidCard);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'tags[0]')).toBe(true);
    });
  });

  describe('validateChapter', () => {
    const validChapter: CreateChapterData = {
      bookId: 'book-1',
      title: 'Test Chapter',
      order: 1,
      cards: ['card-1', 'card-2']
    };

    it('should validate a correct chapter', () => {
      const result = validateChapter(validChapter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing bookId', () => {
      const invalidChapter = { ...validChapter, bookId: '' };
      const result = validateChapter(invalidChapter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'bookId')).toBe(true);
    });

    it('should return error for missing title', () => {
      const invalidChapter = { ...validChapter, title: '' };
      const result = validateChapter(invalidChapter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    it('should return error for invalid order', () => {
      const invalidChapter = { ...validChapter, order: -1 };
      const result = validateChapter(invalidChapter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'order')).toBe(true);
    });

    it('should return error for invalid cards array', () => {
      const invalidChapter = { ...validChapter, cards: ['card-1', ''] };
      const result = validateChapter(invalidChapter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'cards[1]')).toBe(true);
    });
  });

  describe('validateBook', () => {
    const validBook: CreateBookData = {
      title: 'Test Book',
      description: 'Test description',
      chapters: []
    };

    it('should validate a correct book', () => {
      const result = validateBook(validBook);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing title', () => {
      const invalidBook = { ...validBook, title: '' };
      const result = validateBook(invalidBook);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    it('should return error for description too long', () => {
      const longDescription = 'a'.repeat(1001);
      const invalidBook = { ...validBook, description: longDescription };
      const result = validateBook(invalidBook);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'description')).toBe(true);
    });
  });

  describe('validateTreeNode', () => {
    const validNode: CreateTreeNodeData = {
      cardId: 'card-1',
      position: { x: 100, y: 200 },
      connections: ['node-1', 'node-2']
    };

    it('should validate a correct tree node', () => {
      const result = validateTreeNode(validNode);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing cardId', () => {
      const invalidNode = { ...validNode, cardId: '' };
      const result = validateTreeNode(invalidNode);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'cardId')).toBe(true);
    });

    it('should return error for missing position', () => {
      const invalidNode = { ...validNode, position: undefined as unknown as { x: number; y: number } };
      const result = validateTreeNode(invalidNode);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'position')).toBe(true);
    });

    it('should return error for invalid position coordinates', () => {
      const invalidNode = { ...validNode, position: { x: 'invalid' as unknown as number, y: 200 } };
      const result = validateTreeNode(invalidNode);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'position.x')).toBe(true);
    });
  });

  describe('validateReviewData', () => {
    const validReviewData: ReviewData = {
      difficulty: 3,
      interval: 7,
      nextReview: new Date(),
      reviewCount: 5
    };

    it('should validate correct review data', () => {
      const result = validateReviewData(validReviewData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for difficulty out of range', () => {
      const invalidReviewData = { ...validReviewData, difficulty: 6 };
      const result = validateReviewData(invalidReviewData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'difficulty')).toBe(true);
    });

    it('should return error for interval out of range', () => {
      const invalidReviewData = { ...validReviewData, interval: 400 };
      const result = validateReviewData(invalidReviewData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'interval')).toBe(true);
    });

    it('should return error for invalid nextReview', () => {
      const invalidReviewData = { ...validReviewData, nextReview: 'invalid' as unknown as Date };
      const result = validateReviewData(invalidReviewData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'nextReview')).toBe(true);
    });
  });

  describe('validateCompleteKnowledgeCard', () => {
    const validCard: KnowledgeCard = {
      id: 'card-1',
      title: 'Test Card',
      content: 'Test content',
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date(),
      reviewData: {
        difficulty: 3,
        interval: 7,
        nextReview: new Date(),
        reviewCount: 5
      }
    };

    it('should validate a complete knowledge card', () => {
      const result = validateCompleteKnowledgeCard(validCard);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing id', () => {
      const invalidCard = { ...validCard, id: '' };
      const result = validateCompleteKnowledgeCard(invalidCard);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'id')).toBe(true);
    });

    it('should return error for invalid createdAt', () => {
      const invalidCard = { ...validCard, createdAt: 'invalid' as unknown as Date };
      const result = validateCompleteKnowledgeCard(invalidCard);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'createdAt')).toBe(true);
    });

    it('should return error for invalid reviewData', () => {
      const invalidCard = { 
        ...validCard, 
        reviewData: { 
          ...validCard.reviewData!, 
          difficulty: 6 
        } 
      };
      const result = validateCompleteKnowledgeCard(invalidCard);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'reviewData.difficulty')).toBe(true);
    });
  });
}); 