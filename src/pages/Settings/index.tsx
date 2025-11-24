import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Switch, 
  Button, 
  Space, 
  Divider,
  InputNumber,
  message,
  Row,
  Col
} from 'antd';
import { SaveOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useSyncModel } from '@/models';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  const { 
    autoSyncSettings, 
    fetchAutoSyncSettings, 
    updateAutoSyncSettings,
    testConnection 
  } = useSyncModel();

  React.useEffect(() => {
    fetchAutoSyncSettings();
  }, [fetchAutoSyncSettings]);

  React.useEffect(() => {
    if (autoSyncSettings) {
      form.setFieldsValue(autoSyncSettings);
    }
  }, [autoSyncSettings, form]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      await updateAutoSyncSettings(values);
      message.success('设置保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      await testConnection();
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'sync',
      label: '同步设置',
      children: (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              enabled: true,
              interval: 60,
            }}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="启用自动同步"
                  name="enabled"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="同步间隔(分钟)"
                  name="interval"
                  rules={[{ required: true, message: '请输入同步间隔' }]}
                >
                  <InputNumber
                    min={5}
                    max={1440}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loading}
              >
                保存设置
              </Button>
              <Button 
                icon={<ExperimentOutlined />}
                onClick={handleTestConnection}
                loading={loading}
              >
                测试连接
              </Button>
            </Space>
          </Form>
        </Card>
      ),
    },
    {
      key: 'system',
      label: '系统设置',
      children: (
        <Card>
          <Form layout="vertical">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="系统名称">
                  <Input defaultValue="XianyuAutoAgent 管理端" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="版本号">
                  <Input defaultValue="1.0.0" disabled />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item label="API地址">
              <Input defaultValue="http://localhost:5000" />
            </Form.Item>

            <Form.Item label="启用调试模式" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Space>
              <Button type="primary" icon={<SaveOutlined />}>
                保存设置
              </Button>
            </Space>
          </Form>
        </Card>
      ),
    },
    {
      key: 'about',
      label: '关于',
      children: (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ 
              fontSize: 48, 
              marginBottom: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🛒
            </div>
            <h2>XianyuAutoAgent 管理端</h2>
            <p style={{ color: '#666', fontSize: 16, marginBottom: 24 }}>
              智能商品提示词管理系统
            </p>
            <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, textAlign: 'left' }}>
              <h4>系统信息：</h4>
              <p>版本：v1.0.0</p>
              <p>构建时间：{new Date().toLocaleString()}</p>
              <p>技术栈：React 18 + Umi 4 + Ant Design 5</p>
              <p>License：MIT</p>
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="系统设置">
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default Settings;