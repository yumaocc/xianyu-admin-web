import React, { useEffect, useState } from 'react';
import { useParams } from '@umijs/max';
import { Tabs, Card, Form, Input, Button, Space, message, Spin, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { PromptEditor } from '@/components';
import DeliveryConfig from '@/components/DeliveryConfig';
import { useProductModel } from '@/models';
import { history } from '@umijs/max';

const { TextArea } = Input;

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const {
    current: product,
    loading,
    fetchProduct,
    updateProduct,
  } = useProductModel();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id, fetchProduct]);

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        title: product.title,
        desc: product.desc,
        price: product.price,
        itemId: product.itemId,
        category: product.category,
      });
    }
  }, [product, form]);

  const handleSave = async (values: any) => {
    if (!id) return;
    
    setSaving(true);
    try {
      await updateProduct(id, values);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePromptSave = async (type: any, content: string) => {
    message.success(`${type}提示词保存成功`);
  };

  if (loading || !product) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              label="商品ID"
              name="itemId"
              rules={[{ required: true, message: '请输入商品ID' }]}
            >
              <Input placeholder="请输入商品ID" disabled />
            </Form.Item>

            <Form.Item
              label="商品名称"
              name="title"
              rules={[{ required: true, message: '请输入商品名称' }]}
            >
              <Input placeholder="请输入商品名称" size="large" />
            </Form.Item>

            <Form.Item
              label="商品价格"
              name="price"
              rules={[{ required: true, message: '请输入商品价格' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入商品价格"
                min={0}
                precision={2}
                size="large"
                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              label="商品分类"
              name="category"
            >
              <Input placeholder="请输入商品分类" />
            </Form.Item>

            <Form.Item
              label="商品描述"
              name="desc"
              rules={[{ required: true, message: '请输入商品描述' }]}
            >
              <TextArea
                rows={6}
                placeholder="请输入商品描述"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  htmlType="submit"
                  size="large"
                >
                  保存
                </Button>
                <Button onClick={() => form.resetFields()}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'prompts',
      label: 'AI提示词',
      children: (
        <PromptEditor
          productId={product.id}
          productInfo={{
            itemId: product.itemId,
            title: product.title,
            desc: product.desc,
            price: product.price,
          }}
          height={700}
          onSave={handlePromptSave}
        />
      ),
    },
    {
      key: 'delivery',
      label: '自动发货',
      children: (
        <DeliveryConfig
          itemId={product.itemId}
          onSuccess={() => {
            message.success('操作成功');
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => history.back()}
            >
              返回
            </Button>
            编辑商品 - {product.title}
          </Space>
        }
      >
        <Tabs defaultActiveKey="basic" items={tabItems} />
      </Card>
    </div>
  );
};

export default ProductEdit;