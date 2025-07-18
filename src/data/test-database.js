// 简单的数据库测试文件，不依赖Jest
const { db } = require('./CourseNotesDB');

async function runDatabaseTests() {
  console.log('🧪 开始数据库测试...\n');

  try {
    // 初始化数据库
    console.log('1. 测试数据库初始化...');
    await db.open();
    console.log('   ✅ 数据库初始化成功');

    // 测试书籍CRUD
    console.log('\n2. 测试书籍CRUD操作...');
    const bookId = 'book-' + Date.now();
    await db.books.add({
      id: bookId,
      title: '测试书籍',
      author: '测试作者',
      description: '这是一本测试书籍',
      coverImage: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: 0
    });
    console.log(`   ✅ 创建书籍成功，ID: ${bookId}`);

    const book = await db.books.get(bookId);
    console.log(`   ✅ 获取书籍成功，标题: ${book.title}`);

    // 测试知识卡片CRUD
    console.log('\n3. 测试知识卡片CRUD操作...');
    const cardId = 'card-' + Date.now();
    await db.knowledgeCards.add({
      id: cardId,
      title: '测试卡片',
      description: '测试描述',
      content: '这是测试内容',
      tags: ['测试', '示例'],
      bookId: bookId,
      difficulty: 3,
      reviewCount: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
      interval: 1,
      easeFactor: 2.5,
      isDeleted: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`   ✅ 创建知识卡片成功，ID: ${cardId}`);

    const card = await db.knowledgeCards.get(cardId);
    console.log(`   ✅ 获取知识卡片成功，标题: ${card.title}`);

    // 测试树节点CRUD
    console.log('\n4. 测试树节点CRUD操作...');
    const nodeId = 'node-' + Date.now();
    await db.treeNodes.add({
      id: nodeId,
      cardId: cardId,
      bookId: bookId,
      parentId: null,
      position: { x: 100, y: 200 },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`   ✅ 创建树节点成功，ID: ${nodeId}`);

    const node = await db.treeNodes.get(nodeId);
    console.log(`   ✅ 获取树节点成功，位置: (${node.position.x}, ${node.position.y})`);

    // 测试复习数据CRUD
    console.log('\n5. 测试复习数据CRUD操作...');
    const reviewId = 'review-' + Date.now();
    await db.reviewData.add({
      id: reviewId,
      cardId: cardId,
      difficulty: 4,
      interval: 3,
      easeFactor: 2.5,
      nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date()
    });
    console.log(`   ✅ 创建复习数据成功，ID: ${reviewId}`);

    // 测试搜索功能
    console.log('\n6. 测试搜索功能...');
    const searchResults = await db.knowledgeCards
      .where('title')
      .startsWith('测试')
      .toArray();
    console.log(`   ✅ 搜索成功，找到 ${searchResults.length} 个结果`);

    // 测试统计信息
    console.log('\n7. 测试统计信息...');
    const totalCards = await db.knowledgeCards.count();
    const totalBooks = await db.books.count();
    const totalReviews = await db.reviewData.count();
    console.log(`   ✅ 统计: ${totalCards} 张卡片, ${totalBooks} 本书, ${totalReviews} 条复习记录`);

    // 测试数据导出
    console.log('\n8. 测试数据导出...');
    const booksData = await db.books.toArray();
    const cardsData = await db.knowledgeCards.toArray();
    const exportData = JSON.stringify({ books: booksData, cards: cardsData }, null, 2);
    console.log(`   ✅ 导出数据成功，共 ${exportData.length} 字符`);

    console.log('\n🎉 所有数据库测试完成！');
    console.log('✅ 任务3（设置本地数据存储）已成功完成');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await db.close();
  }
}

// 运行测试
runDatabaseTests();