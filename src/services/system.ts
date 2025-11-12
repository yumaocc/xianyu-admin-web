import { get, post } from './request';
import type { SystemStats, ApiResponse, NotificationMessage } from '@/types';

// 获取系统统计信息
export function getSystemStats(): Promise<ApiResponse<SystemStats>> {
  return get('/api/system/stats');
}

// 获取系统健康状态
export function getSystemHealth(): Promise<ApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime: number;
    message?: string;
  }>;
  uptime: number; // 秒
  version: string;
}>> {
  return get('/api/system/health');
}

// 获取系统配置
export function getSystemConfig(): Promise<ApiResponse<{
  appName: string;
  version: string;
  environment: string;
  features: Record<string, boolean>;
  limits: {
    maxProducts: number;
    maxFileSize: number; // MB
    sessionTimeout: number; // 分钟
  };
}>> {
  return get('/api/system/config');
}

// 获取通知消息
export function getNotifications(params: {
  page: number;
  pageSize: number;
  read?: boolean;
}): Promise<ApiResponse<{
  list: NotificationMessage[];
  total: number;
  unreadCount: number;
}>> {
  return get('/api/system/notifications', params);
}

// 标记通知为已读
export function markNotificationRead(id: string): Promise<ApiResponse<void>> {
  return post(`/api/system/notifications/${id}/read`);
}

// 批量标记通知为已读
export function batchMarkNotificationsRead(ids: string[]): Promise<ApiResponse<void>> {
  return post('/api/system/notifications/batch-read', { ids });
}

// 删除通知
export function deleteNotification(id: string): Promise<ApiResponse<void>> {
  return post(`/api/system/notifications/${id}/delete`);
}

// 获取操作日志
export function getOperationLogs(params: {
  page: number;
  pageSize: number;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<{
  list: Array<{
    id: string;
    action: string;
    target: string;
    targetId: string;
    userId: string;
    userName: string;
    ip: string;
    userAgent: string;
    timestamp: string;
    details?: Record<string, any>;
  }>;
  total: number;
}>> {
  return get('/api/system/logs', params);
}

// 获取系统设置
export function getSystemSettings(): Promise<ApiResponse<{
  autoSync: {
    enabled: boolean;
    interval: number;
  };
  notification: {
    email: boolean;
    browser: boolean;
    webhook?: string;
  };
  security: {
    sessionTimeout: number;
    passwordComplexity: boolean;
    twoFactor: boolean;
  };
  backup: {
    enabled: boolean;
    interval: number;
    retention: number;
  };
}>> {
  return get('/api/system/settings');
}

// 更新系统设置
export function updateSystemSettings(settings: {
  autoSync?: {
    enabled: boolean;
    interval: number;
  };
  notification?: {
    email: boolean;
    browser: boolean;
    webhook?: string;
  };
  security?: {
    sessionTimeout: number;
    passwordComplexity: boolean;
    twoFactor: boolean;
  };
  backup?: {
    enabled: boolean;
    interval: number;
    retention: number;
  };
}): Promise<ApiResponse<void>> {
  return post('/api/system/settings', settings);
}

// 创建系统备份
export function createBackup(): Promise<ApiResponse<{
  backupId: string;
  size: number;
  createdAt: string;
}>> {
  return post('/api/system/backup');
}

// 获取备份列表
export function getBackupList(): Promise<ApiResponse<Array<{
  id: string;
  size: number;
  createdAt: string;
  status: 'completed' | 'failed' | 'in_progress';
}>>> {
  return get('/api/system/backups');
}

// 恢复备份
export function restoreBackup(backupId: string): Promise<ApiResponse<{
  restoreId: string;
  message: string;
}>> {
  return post(`/api/system/backups/${backupId}/restore`);
}

// 删除备份
export function deleteBackup(backupId: string): Promise<ApiResponse<void>> {
  return post(`/api/system/backups/${backupId}/delete`);
}

// 获取系统监控数据
export function getSystemMonitoring(timeRange: '1h' | '6h' | '24h' | '7d'): Promise<ApiResponse<{
  cpu: Array<{
    timestamp: string;
    usage: number;
  }>;
  memory: Array<{
    timestamp: string;
    used: number;
    total: number;
  }>;
  disk: Array<{
    timestamp: string;
    used: number;
    total: number;
  }>;
  network: Array<{
    timestamp: string;
    inbound: number;
    outbound: number;
  }>;
}>> {
  return get('/api/system/monitoring', { timeRange });
}