import { db } from './CourseNotesDB';

// 数据库初始化函数
export async function initializeDatabase(): Promise<void> {
  try {
    // 打开数据库
    await db.open();
    console.log('CourseNotesDB initialized successfully');
    
    // 检查是否需要数据迁移
    await checkAndRunMigrations();
    
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// 数据库迁移逻辑
async function checkAndRunMigrations(): Promise<void> {
  // 获取当前数据库版本
  const dbVersion = db.verno;
  
  // 版本1的初始化数据（如果有的话）
  if (dbVersion === 1) {
    console.log('Running initial database setup...');
    
    // 可以在这里添加默认数据
    const bookCount = await db.books.count();
    if (bookCount === 0) {
      // 添加一个示例书籍
      await db.books.add({
        id: 'default-book',
        title: '示例课程',
        author: '系统默认',
        description: '这是一个示例课程，您可以删除它并创建自己的课程',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: 0
      });
    }
  }
}

// 数据库清理函数（用于测试或重置）
export async function resetDatabase(): Promise<void> {
  try {
    await db.delete();
    console.log('Database deleted');
    await initializeDatabase();
    console.log('Database recreated');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}

// 数据库备份函数
export async function exportDatabase(): Promise<string> {
  try {
    const data = {
      knowledgeCards: await db.knowledgeCards.toArray(),
      books: await db.books.toArray(),
      treeNodes: await db.treeNodes.toArray(),
      reviewData: await db.reviewData.toArray(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export database:', error);
    throw error;
  }
}

// 数据库恢复函数
export async function importDatabase(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    
    // 清空现有数据
    await db.knowledgeCards.clear();
    await db.books.clear();
    await db.treeNodes.clear();
    await db.reviewData.clear();
    
    // 导入数据
    if (data.knowledgeCards) {
      await db.knowledgeCards.bulkAdd(data.knowledgeCards);
    }
    if (data.books) {
      await db.books.bulkAdd(data.books);
    }
    if (data.treeNodes) {
      await db.treeNodes.bulkAdd(data.treeNodes);
    }
    if (data.reviewData) {
      await db.reviewData.bulkAdd(data.reviewData);
    }
    
    console.log('Database imported successfully');
  } catch (error) {
    console.error('Failed to import database:', error);
    throw error;
  }
}