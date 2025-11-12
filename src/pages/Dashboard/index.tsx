import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Space } from 'antd';
import { PlusOutlined, SyncOutlined, DownloadOutlined, SettingOutlined } from '@ant-design/icons';
import { StatCard, SyncStatus } from '@/components';
import { useGlobalModel, useProductModel } from '@/models';
import { history } from '@umijs/max';

const Dashboard: React.FC = () => {
  const { stats, fetchStats } = useGlobalModel();
  const { fetchList } = useProductModel();

  useEffect(() => {
    fetchStats();
    fetchList({ page: 1, pageSize: 5 }); // 获取最新商品
  }, [fetchStats, fetchList]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add':
        history.push('/products/create');
        break;
      case 'list':
        history.push('/products/list');
        break;
      case 'sync':
        // 触发同步
        break;
      case 'settings':
        history.push('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="商品总数"
            value={stats?.totalProducts || 0}
            icon={<PlusOutlined />}
            trend={{ value: 5.2, isPositive: true }}
            color="#1890ff"
            onClick={() => handleQuickAction('list')}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="商品总价值"
            value={stats?.totalValue || 0}
            prefix="¥"
            precision={2}
            icon={<DownloadOutlined />}
            trend={{ value: 2.8, isPositive: true }}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="AI配置完成度"
            value={stats?.aiConfigRate || 0}
            suffix="%"
            precision={1}
            icon={<SettingOutlined />}
            progress={{ percent: stats?.aiConfigRate || 0, status: 'active' }}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="今日同步数量"
            value={stats?.todaySyncCount || 0}
            icon={<SyncOutlined />}
            trend={{ value: 12.5, isPositive: true }}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* 快速操作面板 */}
      <Card title="快速操作" style={{ marginBottom: 24 }}>
        <Space wrap size={16}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => handleQuickAction('add')}
          >
            添加商品
          </Button>
          <Button 
            icon={<SyncOutlined />} 
            size="large"
            onClick={() => handleQuickAction('sync')}
          >
            批量同步
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            size="large"
          >
            导出数据
          </Button>
          <Button 
            icon={<SettingOutlined />} 
            size="large"
            onClick={() => handleQuickAction('settings')}
          >
            系统设置
          </Button>
        </Space>
      </Card>

      {/* 同步状态面板 */}
      <Row gutter={16}>
        <Col span={24}>
          <SyncStatus autoRefresh={true} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;