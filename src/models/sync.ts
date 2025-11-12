import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { SyncStatus } from '@/types';
import * as syncService from '@/services/sync';

export interface SyncModel {
  // 状态
  status: SyncStatus | null;
  history: SyncStatus[];
  autoSyncSettings: {
    enabled: boolean;
    interval: number;
    lastSync: string;
    nextSync: string;
  } | null;
  loading: boolean;
  logs: Array<{
    id: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    details?: Record<string, any>;
  }>;
  
  // 操作
  fetchStatus: () => Promise<void>;
  triggerSync: (itemIds?: string[]) => Promise<void>;
  fetchAutoSyncSettings: () => Promise<void>;
  updateAutoSyncSettings: (settings: { enabled: boolean; interval: number }) => Promise<void>;
  fetchHistory: (params?: any) => Promise<void>;
  fetchLogs: (syncId: string, params?: any) => Promise<void>;
  cancelSync: (syncId: string) => Promise<void>;
  retrySync: (syncId: string) => Promise<void>;
  testConnection: () => Promise<any>;
  reset: () => void;
}

export default function useSyncModel(): SyncModel {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [history, setHistory] = useState<SyncStatus[]>([]);
  const [autoSyncSettings, setAutoSyncSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // 获取同步状态
  const fetchStatus = useCallback(async () => {
    try {
      const response = await syncService.getSyncStatus();
      if (response.success && response.data) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  }, []);

  // 触发手动同步
  const triggerSync = useCallback(async (itemIds?: string[]) => {
    setLoading(true);
    try {
      const response = await syncService.triggerManualSync(itemIds);
      if (response.success && response.data) {
        message.success(response.data.message || '同步任务已启动');
        await fetchStatus();
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      message.error('启动同步失败');
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // 获取自动同步设置
  const fetchAutoSyncSettings = useCallback(async () => {
    try {
      const response = await syncService.getAutoSyncSettings();
      if (response.success && response.data) {
        setAutoSyncSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch auto sync settings:', error);
    }
  }, []);

  // 更新自动同步设置
  const updateAutoSyncSettings = useCallback(async (settings: { enabled: boolean; interval: number }) => {
    setLoading(true);
    try {
      const response = await syncService.updateAutoSyncSettings(settings);
      if (response.success) {
        message.success('自动同步设置已更新');
        await fetchAutoSyncSettings();
      }
    } catch (error) {
      console.error('Failed to update auto sync settings:', error);
      message.error('更新自动同步设置失败');
    } finally {
      setLoading(false);
    }
  }, [fetchAutoSyncSettings]);

  // 获取同步历史
  const fetchHistory = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const response = await syncService.getSyncHistory({
        page: 1,
        pageSize: 10,
        ...params,
      });
      if (response.success && response.data) {
        setHistory(response.data.list);
      }
    } catch (error) {
      console.error('Failed to fetch sync history:', error);
      message.error('获取同步历史失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取同步日志
  const fetchLogs = useCallback(async (syncId: string, params?: any) => {
    setLoading(true);
    try {
      const response = await syncService.getSyncLogs(syncId, params);
      if (response.success && response.data) {
        setLogs(response.data.list);
      }
    } catch (error) {
      console.error('Failed to fetch sync logs:', error);
      message.error('获取同步日志失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 取消同步
  const cancelSync = useCallback(async (syncId: string) => {
    setLoading(true);
    try {
      const response = await syncService.cancelSync(syncId);
      if (response.success) {
        message.success('同步任务已取消');
        await fetchStatus();
      }
    } catch (error) {
      console.error('Failed to cancel sync:', error);
      message.error('取消同步失败');
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // 重试同步
  const retrySync = useCallback(async (syncId: string) => {
    setLoading(true);
    try {
      const response = await syncService.retrySync(syncId);
      if (response.success && response.data) {
        message.success(response.data.message || '同步任务已重试');
        await fetchStatus();
      }
    } catch (error) {
      console.error('Failed to retry sync:', error);
      message.error('重试同步失败');
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // 测试连接
  const testConnection = useCallback(async () => {
    setLoading(true);
    try {
      const response = await syncService.testConnection();
      if (response.success && response.data) {
        const { connected, latency, message: msg } = response.data;
        if (connected) {
          message.success(`连接成功，延迟: ${latency}ms`);
        } else {
          message.error(`连接失败: ${msg}`);
        }
        return response.data;
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      message.error('测试连接失败');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setStatus(null);
    setHistory([]);
    setAutoSyncSettings(null);
    setLogs([]);
  }, []);

  return {
    // 状态
    status,
    history,
    autoSyncSettings,
    loading,
    logs,
    
    // 操作
    fetchStatus,
    triggerSync,
    fetchAutoSyncSettings,
    updateAutoSyncSettings,
    fetchHistory,
    fetchLogs,
    cancelSync,
    retrySync,
    testConnection,
    reset,
  };
}