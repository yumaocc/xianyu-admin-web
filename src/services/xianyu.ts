import { get, post } from './request';
import type { ApiResponse } from '@/types';

export interface XianyuItem {
  itemId: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  status: string;
  publishTime: string;
  viewCount: number;
  likeCount: number;
  images: string[];
  category: string;
  location: string;
  tags?: string[];
  condition?: string;
}

export interface XianyuItemsResponse {
  list: XianyuItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SyncResult {
  syncedItems: string[];
  failedItems: string[];
  syncedCount: number;
  failedCount: number;
  message: string;
}

// 获取闲鱼商品列表
export function getXianyuItems(params: {
  page?: number;
  pageSize?: number;
  status?: 'ALL' | 'ON_SALE' | 'SOLD_OUT';
}): Promise<ApiResponse<XianyuItemsResponse>> {
  return get('/api/xianyu/items', params);
}

// 获取单个闲鱼商品详情
export function getXianyuItem(itemId: string): Promise<ApiResponse<XianyuItem>> {
  return get(`/api/xianyu/items/${itemId}`);
}

// 从闲鱼同步商品到本地
export function syncFromXianyu(data: {
  itemIds?: string[];
  syncAll?: boolean;
}): Promise<ApiResponse<SyncResult>> {
  return post('/api/xianyu/sync', data);
}