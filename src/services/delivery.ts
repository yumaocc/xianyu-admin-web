import { get, post, put, del } from './request';
import type { ApiResponse } from '@/types';

// 发货配置类型
export interface DeliveryConfig {
  item_id: string;
  delivery_type: 'netdisk' | 'cardkey' | 'text';
  delivery_content: string;
  extraction_code?: string;
  custom_message?: string;
  is_enabled: boolean;
  stock_count: number;
  created_at?: string;
  updated_at?: string;
}

// 发货记录类型
export interface DeliveryRecord {
  id: number;
  order_id?: string;
  item_id: string;
  buyer_id: string;
  chat_id: string;
  delivery_type: string;
  delivery_content: string;
  delivery_time: string;
  status: 'success' | 'failed';
  error_message?: string;
}

// 发货统计类型
export interface DeliveryStats {
  total_configs: number;
  enabled_configs: number;
  total_deliveries: number;
  success_deliveries: number;
  success_rate: number;
}

// 获取所有发货配置
export function getDeliveryConfigs(params?: {
  enabled_only?: boolean;
}): Promise<ApiResponse<DeliveryConfig[]>> {
  return get('/api/delivery/configs', params);
}

// 获取单个商品的发货配置
export function getDeliveryConfig(itemId: string): Promise<ApiResponse<DeliveryConfig>> {
  return get(`/api/delivery/configs/${itemId}`);
}

// 保存发货配置
export function saveDeliveryConfig(
  itemId: string,
  data: Partial<DeliveryConfig>
): Promise<ApiResponse<void>> {
  return post(`/api/delivery/configs/${itemId}`, data);
}

// 更新发货配置
export function updateDeliveryConfig(
  itemId: string,
  data: Partial<DeliveryConfig>
): Promise<ApiResponse<void>> {
  return put(`/api/delivery/configs/${itemId}`, data);
}

// 删除发货配置
export function deleteDeliveryConfig(itemId: string): Promise<ApiResponse<void>> {
  return del(`/api/delivery/configs/${itemId}`);
}

// 获取发货记录
export function getDeliveryRecords(params?: {
  item_id?: string;
  buyer_id?: string;
  limit?: number;
}): Promise<ApiResponse<DeliveryRecord[]>> {
  return get('/api/delivery/records', params);
}

// 获取发货统计
export function getDeliveryStats(): Promise<ApiResponse<DeliveryStats>> {
  return get('/api/delivery/stats');
}
