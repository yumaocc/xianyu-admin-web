import React, { useState } from 'react';
import { 
  Card, 
  Steps, 
  Form, 
  Input, 
  Button, 
  Space, 
  InputNumber, 
  Select,
  message,
  Row,
  Col
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useProductModel } from '@/models';
import { history } from '@umijs/max';

const { TextArea } = Input;
const { Option } = Select;

const ProductCreate: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [productData, setProductData] = useState<any>({});

  const { createProduct, loading } = useProductModel();

  const steps = [
    { title: '基本信息', description: '填写商品基本信息' },
    { title: '销售策略', description: '设置销售相关配置' },
    { title: '确认创建', description: '确认信息并创建' },
  ];

  const next = async () => {
    try {
      const values = await form.validateFields();
      setProductData({ ...productData, ...values });
      setCurrent(current + 1);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const finalData = { ...productData, ...values };
      
      const result = await createProduct(finalData);
      if (result) {
        message.success('商品创建成功');
        history.push('/products/list');
      }
    } catch (error) {
      console.error('创建商品失败:', error);
    }
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="商品ID"
                name="itemId"
                rules={[
                  { required: true, message: '请输入商品ID' },
                  { pattern: /^[a-zA-Z0-9_-]+$/, message: '商品ID只能包含字母、数字、下划线和横线' }
                ]}
              >
                <Input placeholder="请输入唯一商品ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="商品名称"
                name="title"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="商品分类"
                name="category"
              >
                <Select placeholder="请选择商品分类">
                  <Option value="电子产品">电子产品</Option>
                  <Option value="服装">服装</Option>
                  <Option value="家居">家居</Option>
                  <Option value="运动">运动</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="商品描述"
                name="desc"
                rules={[{ required: true, message: '请输入商品描述' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请详细描述商品特点、规格等信息"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>
        );

      case 1:
        return (
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="最大折扣"
                name="maxDiscount"
                initialValue={10}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="最大折扣百分比"
                  min={0}
                  max={50}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value!.replace('%', '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="紧急程度"
                name="urgencyLevel"
                initialValue="medium"
              >
                <Select placeholder="请选择紧急程度">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="核心卖点"
                name="sellingPoints"
              >
                <TextArea
                  rows={3}
                  placeholder="请输入商品的核心卖点，用逗号分隔"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="目标客户"
                name="targetCustomers"
              >
                <TextArea
                  rows={2}
                  placeholder="描述目标客户群体"
                />
              </Form.Item>
            </Col>
          </Row>
        );

      case 2:
        return (
          <div>
            <h4>请确认以下信息：</h4>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>商品ID：</strong>{productData.itemId}</p>
                <p><strong>商品名称：</strong>{productData.title}</p>
                <p><strong>商品价格：</strong>¥{productData.price}</p>
                <p><strong>商品分类：</strong>{productData.category || '未设置'}</p>
              </Col>
              <Col span={12}>
                <p><strong>最大折扣：</strong>{productData.maxDiscount || 10}%</p>
                <p><strong>紧急程度：</strong>{productData.urgencyLevel || 'medium'}</p>
              </Col>
            </Row>
            <div>
              <p><strong>商品描述：</strong></p>
              <p style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                {productData.desc}
              </p>
            </div>
            {productData.sellingPoints && (
              <div>
                <p><strong>核心卖点：</strong></p>
                <p style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                  {productData.sellingPoints}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderActions = () => {
    return (
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Space>
          <Button onClick={() => history.back()}>
            <ArrowLeftOutlined /> 取消
          </Button>
          {current > 0 && (
            <Button onClick={prev}>
              上一步
            </Button>
          )}
          {current < steps.length - 1 ? (
            <Button type="primary" onClick={next}>
              下一步
            </Button>
          ) : (
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleFinish}
            >
              创建商品
            </Button>
          )}
        </Space>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="创建商品">
        <Steps current={current} items={steps} style={{ marginBottom: 24 }} />
        
        <Form
          form={form}
          layout="vertical"
          style={{ marginBottom: 24 }}
        >
          {renderStepContent()}
        </Form>

        {renderActions()}
      </Card>
    </div>
  );
};

export default ProductCreate;