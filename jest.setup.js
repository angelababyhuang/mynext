require('@testing-library/jest-dom');

// 设置IndexedDB用于测试环境
const { indexedDB, IDBKeyRange } = require('fake-indexeddb');
Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: indexedDB,
});
Object.defineProperty(window, 'IDBKeyRange', {
  writable: true,
  value: IDBKeyRange,
});

// 设置crypto用于测试环境
Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
});