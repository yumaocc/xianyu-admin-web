import { get, post } from './request';
import type { SyncStatus, ApiResponse } from '@/types';

// 获取同步状态
export function getSyncStatus(): Promise<ApiResponse<SyncStatus>> {
  return get('/api/sync/status');
}

// 手动触发同步
export function triggerManualSync(itemIds?: string[]): Promise<ApiResponse<{
  syncId: string;
  message: string;
}>> {
  return post('/api/sync/manual', { itemIds });
}

// 获取自动同步设置
export function getAutoSyncSettings(): Promise<ApiResponse<{
  enabled: boolean;
  interval: number; // 分钟
  lastSync: string;
  nextSync: string;
}>> {
  return get('/api/sync/auto');
}

// 更新自动同步设置
export function updateAutoSyncSettings(settings: {
  enabled: boolean;
  interval: number;
}): Promise<ApiResponse<void>> {
  return post('/api/sync/auto', settings);
}

// 获取同步历史记录
export function getSyncHistory(params: {
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<{
  list: SyncStatus[];
  total: number;
  page: number;
  pageSize: number;
}>> {
  return get('/api/sync/history', params);
}

// 获取同步日志
export function getSyncLogs(
  syncId: string,
  params?: {
    level?: 'info' | 'warning' | 'error';
    page?: number;
    pageSize?: number;
  }
): Promise<ApiResponse<{
  list: Array<{
    id: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    details?: Record<string, any>;
  }>;
  total: number;
}>> {
  return get(`/api/sync/${syncId}/logs`, params);
}

// 取消同步任务
export function cancelSync(syncId: string): Promise<ApiResponse<void>> {
  return post(`/api/sync/${syncId}/cancel`);
}

// 重试失败的同步任务
export function retrySync(syncId: string): Promise<ApiResponse<{
  newSyncId: string;
  message: string;
}>> {
  return post(`/api/sync/${syncId}/retry`);
}

// 获取同步统计信息
export function getSyncStats(timeRange?: '24h' | '7d' | '30d'): Promise<ApiResponse<{
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  successRate: number;
  avgDuration: number; // 秒
  syncTrend: Array<{
    date: string;
    success: number;
    failed: number;
  }>;
}>> {
  return get('/api/sync/stats', { timeRange });
}

// 测试连接
export function testConnection(): Promise<ApiResponse<{
  connected: boolean;
  latency: number; // 毫秒
  version: string;
  message: string;
}>> {
  return post('/api/sync/test-connection');
}

// 获取同步配置
export function getSyncConfig(): Promise<ApiResponse<{
  batchSize: number;
  timeout: number; // 秒
  retryCount: number;
  retryDelay: number; // 秒
  concurrency: number;
}>> {
  return get('/api/sync/config');
}

// 更新同步配置
export function updateSyncConfig(config: {
  batchSize?: number;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  concurrency?: number;
}): Promise<ApiResponse<void>> {
  return post('/api/sync/config', config);
}

// 清理同步历史
export function cleanSyncHistory(beforeDate: string): Promise<ApiResponse<{
  deletedCount: number;
}>> {
  return post('/api/sync/cleanup', { beforeDate });
}

// 导出同步报告
export function exportSyncReport(params: {
  startDate: string;
  endDate: string;
  format: 'json' | 'csv' | 'excel';
}): Promise<ApiResponse<{ downloadUrl: string }>> {
  return post('/api/sync/export-report', params);
}