import { db } from '../CourseNotesDB';
import { TreeNode } from '../CourseNotesDB';

// 创建树节点
export async function createTreeNode(data: Omit<TreeNode, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date();
  const id = crypto.randomUUID();
  
  const node: TreeNode = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  await db.treeNodes.add(node);
  return id;
}

// 获取树节点
export async function getTreeNode(id: string): Promise<TreeNode | undefined> {
  return await db.treeNodes.get(id);
}

// 获取书籍的所有树节点
export async function getTreeNodesByBook(bookId: string): Promise<TreeNode[]> {
  return await db.treeNodes
    .where('bookId')
    .equals(bookId)
    .toArray();
}

// 获取卡片的所有树节点
export async function getTreeNodesByCard(cardId: string): Promise<TreeNode[]> {
  return await db.treeNodes
    .where('cardId')
    .equals(cardId)
    .toArray();
}

// 获取父节点的所有子节点
export async function getChildNodes(parentId: string): Promise<TreeNode[]> {
  return await db.treeNodes
    .where('parentId')
    .equals(parentId)
    .toArray();
}

// 更新树节点
export async function updateTreeNode(id: string, updates: Partial<Omit<TreeNode, 'id' | 'createdAt'>>): Promise<void> {
  const node = await getTreeNode(id);
  if (!node) {
    throw new Error('Tree node not found');
  }
  
  await db.treeNodes.update(id, {
    ...updates,
    updatedAt: new Date()
  });
}

// 删除树节点
export async function deleteTreeNode(id: string): Promise<void> {
  await db.treeNodes.delete(id);
}

// 删除节点及其所有子节点（递归）
export async function deleteTreeNodeWithChildren(id: string): Promise<void> {
  const childNodes = await getChildNodes(id);
  
  // 递归删除所有子节点
  for (const child of childNodes) {
    await deleteTreeNodeWithChildren(child.id);
  }
  
  // 删除当前节点
  await deleteTreeNode(id);
}

// 移动节点到新位置
export async function moveTreeNode(id: string, newParentId?: string, newPosition?: { x: number; y: number }): Promise<void> {
  const updates: Partial<TreeNode> = {};
  
  if (newParentId !== undefined) {
    updates.parentId = newParentId;
  }
  
  if (newPosition) {
    updates.position = newPosition;
  }
  
  if (Object.keys(updates).length > 0) {
    await updateTreeNode(id, updates);
  }
}