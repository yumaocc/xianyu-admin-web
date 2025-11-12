import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Modal,
  Progress,
  Tag,
  Input,
  Select,
  Divider,
  Alert,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  SyncOutlined,
  ReloadOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getXianyuItems, syncFromXianyu, type XianyuItem, type SyncResult } from '@/services/xianyu';
import { getCookieConfig } from '@/services/cookies';
import { history } from '@umijs/max';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function XianyuSync() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [xianyuItems, setXianyuItems] = useState<XianyuItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: 'ALL',
    keyword: '',
  });
  
  // 同步结果
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  
  // Cookie 配置状态
  const [cookieConfigured, setCookieConfigured] = useState(true);

  // 加载闲鱼商品列表
  const loadXianyuItems = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const response = await getXianyuItems({
        page,
        pageSize,
        status: filters.status as 'ALL' | 'ON_SALE' | 'SOLD_OUT',
      });
      
      if (response.success) {
        setXianyuItems(response.data.list);
        setPagination({
          current: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
        });
        setCookieConfigured(true);
      } else {
        message.error(response.message || '获取闲鱼商品列表失败');
        // 如果是Cookie相关错误，检查Cookie配置
        if (response.message?.includes('Cookie') || response.message?.includes('登录')) {
          setCookieConfigured(false);
        }
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('Failed to load xianyu items:', error);
    } finally {
      setLoading(false);
    }
  };

  // 同步选中商品
  const handleSyncSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要同步的商品');
      return;
    }

    setSyncing(true);
    setSyncProgress(0);
    setSyncModalVisible(true);

    try {
      const response = await syncFromXianyu({
        itemIds: selectedRowKeys as string[],
        syncAll: false,
      });

      if (response.success) {
        setSyncResult(response.data);
        setSyncProgress(100);
        message.success(`同步完成！成功 ${response.data.syncedCount} 个，失败 ${response.data.failedCount} 个`);
        setSelectedRowKeys([]);
      } else {
        message.error(response.message || '同步失败');
        setSyncModalVisible(false);
      }
    } catch (error) {
      message.error('同步过程中发生错误');
      console.error('Sync failed:', error);
      setSyncModalVisible(false);
    } finally {
      setSyncing(false);
    }
  };

  // 同步所有商品
  const handleSyncAll = async () => {
    Modal.confirm({
      title: '确认同步所有商品',
      content: '这将同步您在闲鱼上的所有商品到本地，可能需要较长时间，确定继续吗？',
      onOk: async () => {
        setSyncing(true);
        setSyncProgress(0);
        setSyncModalVisible(true);

        try {
          const response = await syncFromXianyu({
            syncAll: true,
          });

          if (response.success) {
            setSyncResult(response.data);
            setSyncProgress(100);
            message.success(`同步完成！成功 ${response.data.syncedCount} 个，失败 ${response.data.failedCount} 个`);
          } else {
            message.error(response.message || '同步失败');
            setSyncModalVisible(false);
          }
        } catch (error) {
          message.error('同步过程中发生错误');
          console.error('Sync all failed:', error);
          setSyncModalVisible(false);
        } finally {
          setSyncing(false);
        }
      },
    });
  };

  // 表格列定义
  const columns: ColumnsType<XianyuItem> = [
    {
      title: '商品信息',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: XianyuItem) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{title}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>ID: {record.itemId}</div>
        </div>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number, record: XianyuItem) => (
        <div>
          <div style={{ color: '#ff4d4f', fontWeight: 500 }}>¥{price}</div>
          {record.originalPrice && record.originalPrice !== price && (
            <div style={{ color: '#999', fontSize: '12px', textDecoration: 'line-through' }}>
              ¥{record.originalPrice}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          'ON_SALE': { color: 'success', text: '在售' },
          'SOLD_OUT': { color: 'default', text: '已售' },
          'OFFLINE': { color: 'warning', text: '下架' },
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '浏览/点赞',
      key: 'stats',
      width: 100,
      render: (_, record: XianyuItem) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>浏览: {record.viewCount}</div>
          <div>点赞: {record.likeCount}</div>
        </div>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 120,
      render: (publishTime: string) => {
        if (!publishTime) return '-';
        try {
          return new Date(publishTime).toLocaleDateString();
        } catch {
          return publishTime;
        }
      },
    },
    {
      title: '分类/位置',
      key: 'info',
      width: 120,
      render: (_, record: XianyuItem) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>{record.category || '未分类'}</div>
          <div>{record.location || '未知位置'}</div>
        </div>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // 检查Cookie配置
  const checkCookieConfig = async () => {
    try {
      const response = await getCookieConfig();
      if (response.success) {
        setCookieConfigured(response.data.hasCookies && response.data.status === 'configured');
      }
    } catch (error) {
      console.error('Failed to check cookie config:', error);
    }
  };

  // 跳转到Cookie配置页面
  const goToCookieConfig = () => {
    history.push('/settings/cookies');
  };

  // 初始加载
  useEffect(() => {
    checkCookieConfig();
    loadXianyuItems();
  }, [filters.status]);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, marginBottom: 16 }}>
            <ImportOutlined style={{ marginRight: 8 }} />
            闲鱼商品同步
          </Title>
          
          {!cookieConfigured && (
            <Alert
              message="Cookie 未配置"
              description={
                <div>
                  系统未检测到有效的闲鱼 Cookie 配置，无法获取商品信息。
                  <Button 
                    type="link" 
                    style={{ padding: 0, marginLeft: 8 }}
                    onClick={goToCookieConfig}
                  >
                    点击前往配置 →
                  </Button>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Alert
            message="功能说明"
            description="从您的闲鱼账户拉取商品信息并同步到本地管理系统，支持批量同步和增量更新。同步后可以为商品配置AI提示词。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Search
                placeholder="搜索商品标题"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                onSearch={() => loadXianyuItems(1)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
              >
                <Option value="ALL">全部状态</Option>
                <Option value="ON_SALE">在售中</Option>
                <Option value="SOLD_OUT">已售出</Option>
              </Select>
            </Col>
            <Col span={10}>
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => loadXianyuItems(pagination.current)}
                  loading={loading}
                >
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={handleSyncSelected}
                  loading={syncing}
                  disabled={selectedRowKeys.length === 0 || !cookieConfigured}
                >
                  同步选中 ({selectedRowKeys.length})
                </Button>
                <Button
                  icon={<ImportOutlined />}
                  onClick={handleSyncAll}
                  loading={syncing}
                  disabled={!cookieConfigured}
                >
                  同步全部
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={xianyuItems}
          rowKey="itemId"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => {
              loadXianyuItems(page, pageSize);
            },
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 同步进度弹窗 */}
      <Modal
        title="同步进度"
        visible={syncModalVisible}
        onCancel={() => {
          if (!syncing) {
            setSyncModalVisible(false);
            setSyncResult(null);
          }
        }}
        footer={
          syncResult ? [
            <Button key="close" onClick={() => {
              setSyncModalVisible(false);
              setSyncResult(null);
              loadXianyuItems(pagination.current); // 刷新列表
            }}>
              关闭
            </Button>
          ] : null
        }
      >
        {syncing && (
          <div>
            <Progress percent={syncProgress} status="active" />
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
              正在同步商品信息，请稍候...
            </Text>
          </div>
        )}

        {syncResult && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 48 }} />
              <Title level={4} style={{ marginTop: 8 }}>同步完成</Title>
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="同步成功"
                  value={syncResult.syncedCount}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="同步失败"
                  value={syncResult.failedCount}
                  prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                />
              </Col>
            </Row>

            {syncResult.message && (
              <Alert
                message={syncResult.message}
                type={syncResult.failedCount > 0 ? 'warning' : 'success'}
                style={{ marginTop: 16 }}
              />
            )}

            {syncResult.failedItems.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>失败的商品ID:</Text>
                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {syncResult.failedItems.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}