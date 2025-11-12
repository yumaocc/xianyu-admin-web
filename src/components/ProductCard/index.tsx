import React from 'react';
import { Card, Tag, Button, Space, Typography, Tooltip, Avatar, Dropdown } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  SyncOutlined, 
  EyeOutlined,
  CopyOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { Product } from '@/types';
import './index.less';

const { Text, Title } = Typography;

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onSync?: (product: Product) => void;
  onView?: (product: Product) => void;
  onCopy?: (product: Product) => void;
  loading?: boolean;
  selected?: boolean;
  onSelect?: (product: Product, selected: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onSync,
  onView,
  onCopy,
  loading = false,
  selected = false,
  onSelect,
}) => {
  
  // 状态颜色映射
  const getStatusColor = (status: Product['status']) => {
    const colorMap = {
      active: 'success',
      inactive: 'default',
      draft: 'warning',
    };
    return colorMap[status] || 'default';
  };

  // 同步状态图标
  const getSyncStatusIcon = (syncStatus: Product['syncStatus']) => {
    switch (syncStatus) {
      case 'synced':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'syncing':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'pending':
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  // 同步状态文本
  const getSyncStatusText = (syncStatus: Product['syncStatus']) => {
    const textMap = {
      synced: '已同步',
      syncing: '同步中',
      error: '同步失败',
      pending: '待同步',
    };
    return textMap[syncStatus] || '未知';
  };

  // 更多操作菜单
  const moreActions = [
    {
      key: 'view',
      label: '查看详情',
      icon: <EyeOutlined />,
      onClick: () => onView?.(product),
    },
    {
      key: 'copy',
      label: '复制商品',
      icon: <CopyOutlined />,
      onClick: () => onCopy?.(product),
    },
    {
      key: 'sync',
      label: '手动同步',
      icon: <SyncOutlined />,
      onClick: () => onSync?.(product),
      disabled: product.syncStatus === 'syncing',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      label: '删除商品',
      icon: <DeleteOutlined />,
      onClick: () => onDelete?.(product),
      danger: true,
    },
  ];

  // 格式化价格
  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  // 处理卡片点击
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮或其他交互元素，不触发选择
    const target = e.target as HTMLElement;
    if (target.closest('.ant-btn') || target.closest('.ant-dropdown') || target.closest('.ant-tag')) {
      return;
    }
    
    onSelect?.(product, !selected);
  };

  return (
    <Card
      className={`product-card ${selected ? 'selected' : ''} ${loading ? 'loading' : ''}`}
      hoverable
      onClick={handleCardClick}
      actions={[
        <Tooltip title="编辑" key="edit">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit?.(product)}
            loading={loading}
          />
        </Tooltip>,
        <Tooltip title="同步状态" key="sync">
          <Button 
            type="text" 
            icon={getSyncStatusIcon(product.syncStatus)}
            onClick={() => onSync?.(product)}
            loading={loading || product.syncStatus === 'syncing'}
          />
        </Tooltip>,
        <Dropdown 
          menu={{ items: moreActions }} 
          trigger={['click']}
          key="more"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            loading={loading}
          />
        </Dropdown>,
      ]}
    >
      <div className="card-header">
        <div className="product-avatar">
          <Avatar size="large" shape="square">
            {product.title.charAt(0).toUpperCase()}
          </Avatar>
        </div>
        <div className="product-info">
          <Title level={5} className="product-title" ellipsis={{ rows: 1 }}>
            {product.title}
          </Title>
          <Text type="secondary" className="product-id">
            ID: {product.itemId}
          </Text>
        </div>
      </div>

      <div className="card-content">
        <div className="price-section">
          <div className="current-price">
            <Text strong>{formatPrice(product.price)}</Text>
          </div>
          {product.soldPrice && product.soldPrice !== product.price && (
            <div className="sold-price">
              <Text delete type="secondary">
                {formatPrice(product.soldPrice)}
              </Text>
            </div>
          )}
        </div>

        <div className="description">
          <Text ellipsis={{ rows: 2 }} className="desc-text">
            {product.desc || '暂无描述'}
          </Text>
        </div>

        <div className="tags-section">
          <Space wrap>
            <Tag color={getStatusColor(product.status)}>
              {product.status === 'active' ? '上架' : product.status === 'inactive' ? '下架' : '草稿'}
            </Tag>
            {product.category && (
              <Tag>{product.category}</Tag>
            )}
            {product.hasCustomPrompts && (
              <Tag color="blue">自定义提示词</Tag>
            )}
          </Space>
        </div>

        <div className="sync-status">
          <Space>
            {getSyncStatusIcon(product.syncStatus)}
            <Text type="secondary" className="sync-text">
              {getSyncStatusText(product.syncStatus)}
            </Text>
          </Space>
        </div>

        <div className="card-footer">
          <Text type="secondary" className="update-time">
            更新于 {new Date(product.updatedAt).toLocaleString()}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;