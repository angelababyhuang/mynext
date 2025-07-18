// 兼容Node.js的数据库初始化和管理
const { db } = require('./CourseNotesDB');

// 初始化数据库
async function initializeDatabase() {
  try {
    await db.open();
    console.log('数据库已初始化');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 重置数据库（仅用于测试）
async function resetDatabase() {
  try {
    await db.delete();
    await initializeDatabase();
    console.log('数据库已重置');
  } catch (error) {
    console.error('数据库重置失败:', error);
    throw error;
  }
}

// 导出数据库实例
module.exports = {
  db,
  initializeDatabase,
  resetDatabase
};