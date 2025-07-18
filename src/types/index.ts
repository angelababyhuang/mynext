// 核心数据模型接口定义

// 知识卡片
export interface KnowledgeCard {
  id: string;
  title: string;
  content: string; // Markdown内容
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  reviewData?: ReviewData;
}

// 书籍
export interface Book {
  id: string;
  title: string;
  description?: string;
  chapters: Chapter[];
  createdAt: Date;
  updatedAt: Date;
}

// 章节
export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  order: number;
  cards: string[]; // KnowledgeCard IDs
}

// 知识树节点
export interface TreeNode {
  id: string;
  cardId: string;
  position: { x: number; y: number };
  connections: string[]; // 连接的其他节点ID
}

// 复习数据
export interface ReviewData {
  difficulty: number; // 1-5
  interval: number; // 复习间隔（天）
  nextReview: Date;
  reviewCount: number;
}

// 导出模板
export interface ExportTemplate {
  id: string;
  name: string;
  layout: 'academic' | 'summary' | 'flashcard';
  styles: React.CSSProperties;
}

// 应用状态
export interface AppState {
  // 当前选中的内容
  selectedBook: Book | null;
  selectedChapter: Chapter | null;
  selectedCard: KnowledgeCard | null;
  
  // UI状态
  currentView: 'hierarchy' | 'editor' | 'tree' | 'review';
  isLoading: boolean;
  
  // 数据
  books: Book[];
  cards: KnowledgeCard[];
  treeNodes: TreeNode[];
  
  // 操作方法
  actions: {
    createBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateBook: (book: Book) => void;
    deleteBook: (bookId: string) => void;
    createChapter: (bookId: string, chapter: Omit<Chapter, 'id'>) => void;
    updateChapter: (chapter: Chapter) => void;
    deleteChapter: (chapterId: string) => void;
    createCard: (card: Omit<KnowledgeCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateCard: (card: KnowledgeCard) => void;
    deleteCard: (cardId: string) => void;
    createTreeNode: (node: Omit<TreeNode, 'id'>) => void;
    updateTreeNode: (node: TreeNode) => void;
    deleteTreeNode: (nodeId: string) => void;
  };
}

// 错误类型
export enum ErrorType {
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EXPORT_ERROR = 'EXPORT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: unknown;
  timestamp: Date;
}

// 创建新实体的类型（不包含自动生成的字段）
export type CreateBookData = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateChapterData = Omit<Chapter, 'id'>;
export type CreateCardData = Omit<KnowledgeCard, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateTreeNodeData = Omit<TreeNode, 'id'>; 