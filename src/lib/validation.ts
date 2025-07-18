import { 
  KnowledgeCard, 
  Book, 
  Chapter, 
  TreeNode, 
  ReviewData,
  CreateBookData,
  CreateChapterData,
  CreateCardData,
  CreateTreeNodeData
} from '@/types';

// 验证错误类型
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// 通用验证函数
export const validateRequired = (value: unknown, fieldName: string): ValidationError[] => {
  if (value === null || value === undefined || value === '') {
    return [{ field: fieldName, message: `${fieldName} is required` }];
  }
  return [];
};

export const validateStringLength = (value: string, fieldName: string, min: number, max: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (value.length < min) {
    errors.push({ field: fieldName, message: `${fieldName} must be at least ${min} characters long` });
  }
  if (value.length > max) {
    errors.push({ field: fieldName, message: `${fieldName} must be no more than ${max} characters long` });
  }
  return errors;
};

export const validateNumberRange = (value: number, fieldName: string, min: number, max: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (value < min || value > max) {
    errors.push({ field: fieldName, message: `${fieldName} must be between ${min} and ${max}` });
  }
  return errors;
};

// 知识卡片验证
export const validateKnowledgeCard = (card: CreateCardData): ValidationResult => {
  const errors: ValidationError[] = [];

  // 验证标题
  errors.push(...validateRequired(card.title, 'title'));
  if (card.title) {
    errors.push(...validateStringLength(card.title, 'title', 1, 200));
  }

  // 验证内容
  errors.push(...validateRequired(card.content, 'content'));
  if (card.content) {
    errors.push(...validateStringLength(card.content, 'content', 1, 10000));
  }

  // 验证标签
  if (card.tags) {
    if (!Array.isArray(card.tags)) {
      errors.push({ field: 'tags', message: 'tags must be an array' });
    } else {
      card.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push({ field: `tags[${index}]`, message: 'each tag must be a string' });
        } else if (tag.length > 50) {
          errors.push({ field: `tags[${index}]`, message: 'each tag must be no more than 50 characters' });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 书籍验证
export const validateBook = (book: CreateBookData): ValidationResult => {
  const errors: ValidationError[] = [];

  // 验证标题
  errors.push(...validateRequired(book.title, 'title'));
  if (book.title) {
    errors.push(...validateStringLength(book.title, 'title', 1, 200));
  }

  // 验证描述（可选）
  if (book.description) {
    errors.push(...validateStringLength(book.description, 'description', 0, 1000));
  }

  // 验证章节数组
  if (book.chapters) {
    if (!Array.isArray(book.chapters)) {
      errors.push({ field: 'chapters', message: 'chapters must be an array' });
    } else {
      book.chapters.forEach((chapter, index) => {
        const chapterErrors = validateChapter(chapter);
        chapterErrors.errors.forEach(error => {
          errors.push({ 
            field: `chapters[${index}].${error.field}`, 
            message: error.message 
          });
        });
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 章节验证
export const validateChapter = (chapter: CreateChapterData): ValidationResult => {
  const errors: ValidationError[] = [];

  // 验证书籍ID
  errors.push(...validateRequired(chapter.bookId, 'bookId'));
  if (chapter.bookId) {
    errors.push(...validateStringLength(chapter.bookId, 'bookId', 1, 100));
  }

  // 验证标题
  errors.push(...validateRequired(chapter.title, 'title'));
  if (chapter.title) {
    errors.push(...validateStringLength(chapter.title, 'title', 1, 200));
  }

  // 验证顺序
  if (typeof chapter.order !== 'number') {
    errors.push({ field: 'order', message: 'order must be a number' });
  } else {
    errors.push(...validateNumberRange(chapter.order, 'order', 0, 10000));
  }

  // 验证卡片数组
  if (chapter.cards) {
    if (!Array.isArray(chapter.cards)) {
      errors.push({ field: 'cards', message: 'cards must be an array' });
    } else {
      chapter.cards.forEach((cardId, index) => {
        if (typeof cardId !== 'string') {
          errors.push({ field: `cards[${index}]`, message: 'each card ID must be a string' });
        } else if (cardId.length === 0) {
          errors.push({ field: `cards[${index}]`, message: 'card ID cannot be empty' });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 树节点验证
export const validateTreeNode = (node: CreateTreeNodeData): ValidationResult => {
  const errors: ValidationError[] = [];

  // 验证卡片ID
  errors.push(...validateRequired(node.cardId, 'cardId'));
  if (node.cardId) {
    errors.push(...validateStringLength(node.cardId, 'cardId', 1, 100));
  }

  // 验证位置
  if (!node.position) {
    errors.push({ field: 'position', message: 'position is required' });
  } else {
    if (typeof node.position.x !== 'number') {
      errors.push({ field: 'position.x', message: 'position.x must be a number' });
    }
    if (typeof node.position.y !== 'number') {
      errors.push({ field: 'position.y', message: 'position.y must be a number' });
    }
  }

  // 验证连接数组
  if (node.connections) {
    if (!Array.isArray(node.connections)) {
      errors.push({ field: 'connections', message: 'connections must be an array' });
    } else {
      node.connections.forEach((connectionId, index) => {
        if (typeof connectionId !== 'string') {
          errors.push({ field: `connections[${index}]`, message: 'each connection ID must be a string' });
        } else if (connectionId.length === 0) {
          errors.push({ field: `connections[${index}]`, message: 'connection ID cannot be empty' });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 复习数据验证
export const validateReviewData = (reviewData: ReviewData): ValidationResult => {
  const errors: ValidationError[] = [];

  // 验证难度
  if (typeof reviewData.difficulty !== 'number') {
    errors.push({ field: 'difficulty', message: 'difficulty must be a number' });
  } else {
    errors.push(...validateNumberRange(reviewData.difficulty, 'difficulty', 1, 5));
  }

  // 验证间隔
  if (typeof reviewData.interval !== 'number') {
    errors.push({ field: 'interval', message: 'interval must be a number' });
  } else {
    errors.push(...validateNumberRange(reviewData.interval, 'interval', 0, 365));
  }

  // 验证下次复习时间
  if (!(reviewData.nextReview instanceof Date)) {
    errors.push({ field: 'nextReview', message: 'nextReview must be a valid Date' });
  }

  // 验证复习次数
  if (typeof reviewData.reviewCount !== 'number') {
    errors.push({ field: 'reviewCount', message: 'reviewCount must be a number' });
  } else {
    errors.push(...validateNumberRange(reviewData.reviewCount, 'reviewCount', 0, 10000));
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 完整知识卡片验证（包含复习数据）
export const validateCompleteKnowledgeCard = (card: KnowledgeCard): ValidationResult => {
  const baseValidation = validateKnowledgeCard(card);
  const errors = [...baseValidation.errors];

  // 验证ID
  errors.push(...validateRequired(card.id, 'id'));
  if (card.id) {
    errors.push(...validateStringLength(card.id, 'id', 1, 100));
  }

  // 验证创建时间
  if (!(card.createdAt instanceof Date)) {
    errors.push({ field: 'createdAt', message: 'createdAt must be a valid Date' });
  }

  // 验证更新时间
  if (!(card.updatedAt instanceof Date)) {
    errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid Date' });
  }

  // 验证复习数据（如果存在）
  if (card.reviewData) {
    const reviewValidation = validateReviewData(card.reviewData);
    reviewValidation.errors.forEach(error => {
      errors.push({ field: `reviewData.${error.field}`, message: error.message });
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 