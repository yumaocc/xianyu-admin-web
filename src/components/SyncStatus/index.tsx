import React, { useEffect, useState } from 'react';
import { Card, Progress, Button, Space, Typography, Tag, Timeline, Modal, Alert, List } from 'antd';
import { 
  SyncOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useSyncModel } from '@/models';
import type { SyncStatus as SyncStatusType } from '@/types';
import './index.less';

const { Text, Title } = Typography;

interface SyncStatusProps {
  productIds?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
  showLogs?: boolean;
}

const SyncStatus: React.FC<SyncStatusProps> = ({
  productIds,
  autoRefresh = true,
  refreshInterval = 5000,
  compact = false,
  showLogs = true,
}) => {
  const [logsVisible, setLogsVisible] = useState(false);
  const [selectedSyncId, setSelectedSyncId] = useState<string>('');
  
  const {
    status,
    history,
    loading,
    logs,
    fetchStatus,
    triggerSync,
    fetchHistory,
    fetchLogs,
    cancelSync,
    retrySync,
    testConnection,
  } = useSyncModel();

  // 自动刷新状态
  useEffect(() => {
    fetchStatus();
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, autoRefresh, refreshInterval]);

  // 获取历史记录
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 获取状态颜色
  const getStatusColor = (syncStatus: SyncStatusType['status']) => {
    switch (syncStatus) {
      case 'completed':
        return 'success';
      case 'running':
        return 'processing';
      case 'error':
        return 'error';
      case 'pending':
      default:
        return 'default';
    }
  };

  // 获取状态图标
  const getStatusIcon = (syncStatus: SyncStatusType['status']) => {
    switch (syncStatus) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'running':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'pending':
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  // 处理手动同步
  const handleManualSync = async () => {
    await triggerSync(productIds);
  };

  // 处理取消同步
  const handleCancelSync = async () => {
    if (status?.id) {
      await cancelSync(status.id);
    }
  };

  // 处理重试同步
  const handleRetrySync = async () => {
    if (status?.id) {
      await retrySync(status.id);
    }
  };

  // 查看日志
  const handleViewLogs = async (syncId: string) => {
    setSelectedSyncId(syncId);
    await fetchLogs(syncId);
    setLogsVisible(true);
  };

  // 测试连接
  const handleTestConnection = async () => {
    await testConnection();
  };

  // 渲染紧凑模式
  if (compact) {
    return (
      <Card size="small" className="sync-status-compact">
        <Space>
          {status && getStatusIcon(status.status)}
          <Text strong>
            {status ? 
              `同步${status.status === 'running' ? '进行中' : status.status === 'completed' ? '完成' : status.status === 'error' ? '失败' : '待处理'}` :
              '未知状态'
            }
          </Text>
          {status?.status === 'running' && (
            <Progress 
              type="circle" 
              size={20} 
              percent={status.progress} 
              format={() => ''}
            />
          )}
          <Button 
            size="small" 
            icon={<SyncOutlined />}
            loading={loading || status?.status === 'running'}
            onClick={handleManualSync}
          >
            同步
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <div className="sync-status">
      <Card 
        title="同步状态"
        extra={
          <Space>
            <Button 
              size="small" 
              icon={<ReloadOutlined />}
              onClick={fetchStatus}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              size="small"
              onClick={handleTestConnection}
              loading={loading}
            >
              测试连接
            </Button>
          </Space>
        }
      >
        {status ? (
          <div className="current-sync">
            <div className="sync-header">
              <Space>
                {getStatusIcon(status.status)}
                <Title level={5} style={{ margin: 0 }}>
                  同步任务 #{status.id.slice(-8)}
                </Title>
                <Tag color={getStatusColor(status.status)}>
                  {status.status === 'running' ? '进行中' : 
                   status.status === 'completed' ? '已完成' : 
                   status.status === 'error' ? '失败' : '待处理'}
                </Tag>
              </Space>
            </div>

            {status.status === 'running' && (
              <div className="sync-progress">
                <Progress 
                  percent={status.progress} 
                  status="active"
                  showInfo
                />
                <div className="progress-info">
                  <Text type="secondary">
                    已处理 {Math.floor(status.progress * status.affectedItems / 100)} / {status.affectedItems} 项
                  </Text>
                </div>
              </div>
            )}

            <div className="sync-info">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>开始时间: </Text>
                  <Text>{new Date(status.startTime).toLocaleString()}</Text>
                </div>
                {status.endTime && (
                  <div>
                    <Text strong>结束时间: </Text>
                    <Text>{new Date(status.endTime).toLocaleString()}</Text>
                  </div>
                )}
                <div>
                  <Text strong>涉及商品: </Text>
                  <Text>{status.affectedItems} 个</Text>
                </div>
                {status.message && (
                  <Alert 
                    message={status.message}
                    type={status.status === 'error' ? 'error' : 'info'}
                    showIcon
                    size="small"
                  />
                )}
              </Space>
            </div>

            <div className="sync-actions">
              <Space>
                {status.status === 'running' && (
                  <Button 
                    icon={<PauseCircleOutlined />}
                    onClick={handleCancelSync}
                    loading={loading}
                  >
                    取消同步
                  </Button>
                )}
                {status.status === 'error' && (
                  <Button 
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRetrySync}
                    loading={loading}
                  >
                    重试
                  </Button>
                )}
                {showLogs && (
                  <Button 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewLogs(status.id)}
                  >
                    查看日志
                  </Button>
                )}
                {status.status !== 'running' && (
                  <Button 
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleManualSync}
                    loading={loading}
                  >
                    重新同步
                  </Button>
                )}
              </Space>
            </div>
          </div>
        ) : (
          <div className="no-sync">
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
              <SyncOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <Text type="secondary">暂无同步任务</Text>
              <Button 
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleManualSync}
                loading={loading}
              >
                开始同步
              </Button>
            </Space>
          </div>
        )}

        {history.length > 0 && (
          <div className="sync-history">
            <Title level={5}>最近同步记录</Title>
            <Timeline
              size="small"
              items={history.slice(0, 5).map(item => ({
                dot: getStatusIcon(item.status),
                children: (
                  <div>
                    <div>
                      <Text strong>#{item.id.slice(-8)}</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {new Date(item.startTime).toLocaleString()}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">
                        {item.affectedItems} 个商品，
                        {item.endTime ? `耗时 ${Math.round((new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / 1000)}秒` : '进行中'}
                      </Text>
                      {showLogs && (
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => handleViewLogs(item.id)}
                        >
                          查看日志
                        </Button>
                      )}
                    </div>
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </Card>

      {/* 日志模态框 */}
      <Modal
        title={`同步日志 - ${selectedSyncId.slice(-8)}`}
        open={logsVisible}
        onCancel={() => setLogsVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <List
          dataSource={logs}
          renderItem={(log) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  log.level === 'error' ? 
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> :
                    log.level === 'warning' ?
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} /> :
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                }
                title={
                  <Space>
                    <Tag color={log.level === 'error' ? 'red' : log.level === 'warning' ? 'orange' : 'green'}>
                      {log.level.toUpperCase()}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                  </Space>
                }
                description={log.message}
              />
            </List.Item>
          )}
          style={{ maxHeight: 400, overflow: 'auto' }}
        />
      </Modal>
    </div>
  );
};

export default SyncStatus;