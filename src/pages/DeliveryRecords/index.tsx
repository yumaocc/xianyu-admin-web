import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Button,
  Statistic,
  Row,
  Col,
  message,
  Tooltip,
  Typography,
} from 'antd';
import {
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getDeliveryRecords,
  getDeliveryStats,
  type DeliveryRecord,
  type DeliveryStats,
} from '@/services/delivery';
import dayjs from 'dayjs';

const { Search } = Input;
const { Text } = Typography;

const DeliveryRecords: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [searchItemId, setSearchItemId] = useState('');
  const [searchBuyerId, setSearchBuyerId] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 加载发货记录
      const params: any = { limit: 100 };
      if (searchItemId) params.item_id = searchItemId;
      if (searchBuyerId) params.buyer_id = searchBuyerId;

      const recordsRes = await getDeliveryRecords(params);
      if (recordsRes.status === 'success') {
        setRecords(recordsRes.data || []);
      }

      // 加载统计信息
      const statsRes = await getDeliveryStats();
      if (statsRes.status === 'success') {
        setStats(statsRes.data);
      }
    } catch (error: any) {
      message.error('加载数据失败：' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 表格列定义
  const columns: ColumnsType<DeliveryRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '商品ID',
      dataIndex: 'item_id',
      key: 'item_id',
      width: 150,
      render: (text) => (
        <Tooltip title="点击复制">
          <Text
            copyable
            style={{ cursor: 'pointer' }}
          >
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '买家ID',
      dataIndex: 'buyer_id',
      key: 'buyer_id',
      width: 150,
      render: (text) => (
        <Tooltip title="点击复制">
          <Text
            copyable
            style={{ cursor: 'pointer' }}
          >
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '发货类型',
      dataIndex: 'delivery_type',
      key: 'delivery_type',
      width: 100,
      render: (type) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          netdisk: { text: '网盘', color: 'blue' },
          cardkey: { text: '卡密', color: 'green' },
          text: { text: '文本', color: 'orange' },
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '发货内容',
      dataIndex: 'delivery_content',
      key: 'delivery_content',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 300 }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '发货时间',
      dataIndex: 'delivery_time',
      key: 'delivery_time',
      width: 180,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.delivery_time).unix() - dayjs(b.delivery_time).unix(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '成功', value: 'success' },
        { text: '失败', value: 'failed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        if (status === 'success') {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              成功
            </Tag>
          );
        }
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            失败
          </Tag>
        );
      },
    },
    {
      title: '错误信息',
      dataIndex: 'error_message',
      key: 'error_message',
      ellipsis: true,
      render: (text) => {
        if (!text) return '-';
        return (
          <Tooltip title={text}>
            <Text type="danger" ellipsis>
              {text}
            </Text>
          </Tooltip>
        );
      },
    },
  ];

  // 过滤数据
  const filteredRecords = records.filter((record) => {
    if (statusFilter === 'all') return true;
    return record.status === statusFilter;
  });

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="发货配置数"
                value={stats.total_configs}
                prefix={<RocketOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="已启用配置"
                value={stats.enabled_configs}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总发货次数"
                value={stats.total_deliveries}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="发货成功率"
                value={stats.success_rate}
                precision={2}
                suffix="%"
                valueStyle={{ color: stats.success_rate >= 95 ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 主表格 */}
      <Card
        title="发货记录"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        }
      >
        {/* 筛选区域 */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索商品ID"
            allowClear
            style={{ width: 200 }}
            value={searchItemId}
            onChange={(e) => setSearchItemId(e.target.value)}
            onSearch={loadData}
          />
          <Search
            placeholder="搜索买家ID"
            allowClear
            style={{ width: 200 }}
            value={searchBuyerId}
            onChange={(e) => setSearchBuyerId(e.target.value)}
            onSearch={loadData}
          />
          <Select
            style={{ width: 120 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '全部状态', value: 'all' },
              { label: '成功', value: 'success' },
              { label: '失败', value: 'failed' },
            ]}
          />
          <Button type="primary" onClick={loadData}>
            查询
          </Button>
        </Space>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            defaultPageSize: 20,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default DeliveryRecords;
