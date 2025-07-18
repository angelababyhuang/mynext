import { db } from '../CourseNotesDB';
import { Book } from '../CourseNotesDB';

// 创建书籍
export async function createBook(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<string> {
  const now = new Date();
  const id = crypto.randomUUID();
  
  const book: Book = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
      isDeleted: 0
    };
  
  await db.books.add(book);
  return id;
}

// 获取书籍
export async function getBook(id: string): Promise<Book | undefined> {
  return await db.books.get(id);
}

// 获取所有书籍（排除已删除的）
export async function getAllBooks(): Promise<Book[]> {
  return await db.books
    .where('isDeleted')
    .equals(0)
    .toArray();
}

// 更新书籍
export async function updateBook(id: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>): Promise<void> {
  const book = await getBook(id);
  if (!book) {
    throw new Error('Book not found');
  }
  
  await db.books.update(id, {
    ...updates,
    updatedAt: new Date()
  });
}

// 软删除书籍
export async function deleteBook(id: string): Promise<void> {
  await updateBook(id, { isDeleted: 1 });
}

// 恢复书籍
export async function restoreBook(id: string): Promise<void> {
  await updateBook(id, { isDeleted: 0 });
}

// 永久删除书籍
export async function permanentlyDeleteBook(id: string): Promise<void> {
  // 注意：删除书籍时，应该考虑相关的知识卡片和树节点
  await db.books.delete(id);
}

// 搜索书籍
export async function searchBooks(query: string): Promise<Book[]> {
  const lowerQuery = query.toLowerCase();
  return await db.books
    .where('isDeleted')
    .equals(0)
    .filter(book => 
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.description?.toLowerCase().includes(lowerQuery)
    )
    .toArray();
}