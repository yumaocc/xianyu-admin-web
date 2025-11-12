import { get, post, put, del } from './request';
import type { 
  Product, 
  PaginationParams, 
  PaginatedResponse, 
  ApiResponse,
  ProductSettings
} from '@/types';

// 获取商品列表
export function getProductList(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Product>>> {
  return get('/api/products', params);
}

// 获取商品详情
export function getProduct(id: string): Promise<ApiResponse<Product>> {
  return get(`/api/products/${id}`);
}

// 创建商品
export function createProduct(data: {
  itemId: string;
  title: string;
  desc: string;
  price: number;
  category?: string;
  settings?: ProductSettings;
}): Promise<ApiResponse<Product>> {
  return post('/api/products', data);
}

// 更新商品
export function updateProduct(
  id: string, 
  data: Partial<Product>
): Promise<ApiResponse<Product>> {
  return put(`/api/products/${id}`, data);
}

// 删除商品
export function deleteProduct(id: string): Promise<ApiResponse<void>> {
  return del(`/api/products/${id}`);
}

// 批量删除商品
export function batchDeleteProducts(ids: string[]): Promise<ApiResponse<void>> {
  return post('/api/products/batch-delete', { ids });
}

// 批量更新商品状态
export function batchUpdateProductStatus(
  ids: string[], 
  status: Product['status']
): Promise<ApiResponse<void>> {
  return post('/api/products/batch-update-status', { ids, status });
}

// 获取商品统计信息
export function getProductStats(): Promise<ApiResponse<{
  total: number;
  active: number;
  inactive: number;
  draft: number;
  totalValue: number;
  avgPrice: number;
}>> {
  return get('/api/products/stats');
}

// 搜索商品
export function searchProducts(keyword: string): Promise<ApiResponse<Product[]>> {
  return get('/api/products/search', { keyword });
}

// 获取商品分类列表
export function getProductCategories(): Promise<ApiResponse<string[]>> {
  return get('/api/products/categories');
}

// 导出商品数据
export function exportProducts(
  params: PaginationParams & {
    format: 'json' | 'csv' | 'excel';
  }
): Promise<ApiResponse<{ downloadUrl: string }>> {
  return post('/api/products/export', params);
}

// 导入商品数据
export function importProducts(file: File): Promise<ApiResponse<{
  success: number;
  failed: number;
  errors?: string[];
}>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return post('/api/products/import', formData);
}

// 复制商品
export function copyProduct(id: string): Promise<ApiResponse<Product>> {
  return post(`/api/products/${id}/copy`);
}

// 获取商品历史记录
export function getProductHistory(id: string): Promise<ApiResponse<{
  id: string;
  action: string;
  changes: Record<string, any>;
  userId: string;
  userName: string;
  timestamp: string;
}[]>> {
  return get(`/api/products/${id}/history`);
}