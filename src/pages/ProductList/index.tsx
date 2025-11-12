import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Space, 
  Pagination, 
  Modal, 
  message 
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  DeleteOutlined, 
  SyncOutlined 
} from '@ant-design/icons';
import { ProductCard } from '@/components';
import { useProductModel } from '@/models';
import { history } from '@umijs/max';
import type { Product } from '@/types';

const { Search } = Input;
const { Option } = Select;

const ProductList: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const {
    list,
    loading,
    pagination,
    filters,
    selectedIds,
    fetchList,
    deleteProduct,
    batchDelete,
    batchUpdateStatus,
    setSelected,
    setFilters,
  } = useProductModel();

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSearch = (keyword: string) => {
    setFilters({ ...filters, keyword });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    fetchList({ page, pageSize });
  };

  const handleProductSelect = (product: Product, selected: boolean) => {
    const newSelected = selected 
      ? [...selectedIds, product.id]
      : selectedIds.filter(id => id !== product.id);
    setSelected(newSelected);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      message.warning('请选择要删除的商品');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedIds.length} 个商品吗？`,
      onOk: async () => {
        await batchDelete(selectedIds);
      },
    });
  };

  const handleBatchSync = () => {
    if (selectedIds.length === 0) {
      message.warning('请选择要同步的商品');
      return;
    }
    // 触发批量同步
    message.info(`正在同步 ${selectedIds.length} 个商品...`);
  };

  const renderFilters = () => (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Search
            placeholder="搜索商品名称或ID"
            onSearch={handleSearch}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select
            placeholder="商品状态"
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value="active">上架</Option>
            <Option value="inactive">下架</Option>
            <Option value="draft">草稿</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Select
            placeholder="商品分类"
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => handleFilterChange('category', value)}
          >
            <Option value="电子产品">电子产品</Option>
            <Option value="服装">服装</Option>
            <Option value="家居">家居</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchList()}
            loading={loading}
          >
            刷新
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const renderActions = () => (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => history.push('/products/create')}
        >
          添加商品
        </Button>
        {selectedIds.length > 0 && (
          <>
            <Button 
              icon={<SyncOutlined />}
              onClick={handleBatchSync}
            >
              批量同步 ({selectedIds.length})
            </Button>
            <Button 
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              批量删除 ({selectedIds.length})
            </Button>
          </>
        )}
      </Space>
    </Card>
  );

  const renderProductCards = () => (
    <Row gutter={[16, 16]}>
      {list.map((product) => (
        <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
          <ProductCard
            product={product}
            selected={selectedIds.includes(product.id)}
            onSelect={handleProductSelect}
            onEdit={(product) => history.push(`/products/edit/${product.id}`)}
            onDelete={(product) => {
              Modal.confirm({
                title: '确认删除',
                content: `确定要删除商品"${product.title}"吗？`,
                onOk: () => deleteProduct(product.id),
              });
            }}
            onView={(product) => history.push(`/products/edit/${product.id}`)}
            loading={loading}
          />
        </Col>
      ))}
    </Row>
  );

  const renderPagination = () => (
    <Row justify="end" style={{ marginTop: 16 }}>
      <Col>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => 
            `第 ${range[0]}-${range[1]} 项，共 ${total} 项`
          }
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
          pageSizeOptions={['20', '50', '100']}
        />
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: 24 }}>
      {renderFilters()}
      {renderActions()}
      
      {list.length > 0 ? (
        <>
          {renderProductCards()}
          {renderPagination()}
        </>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}>
              📦
            </div>
            <h3>暂无商品</h3>
            <p style={{ color: '#999' }}>
              {filters.keyword || filters.status || filters.category 
                ? '没有找到符合条件的商品' 
                : '还没有添加任何商品'
              }
            </p>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => history.push('/products/create')}
            >
              添加第一个商品
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductList;