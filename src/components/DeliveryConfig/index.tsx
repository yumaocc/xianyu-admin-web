import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Radio,
  Switch,
  InputNumber,
  Button,
  Card,
  Space,
  message,
  Alert,
  Divider,
  Spin,
} from 'antd';
import { SaveOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  getDeliveryConfig,
  saveDeliveryConfig,
  deleteDeliveryConfig,
  type DeliveryConfig as DeliveryConfigType,
} from '@/services/delivery';

const { TextArea } = Input;

interface DeliveryConfigProps {
  itemId: string;
  onSuccess?: () => void;
}

const DeliveryConfig: React.FC<DeliveryConfigProps> = ({ itemId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [deliveryType, setDeliveryType] = useState<string>('netdisk');

  // 加载配置
  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await getDeliveryConfig(itemId);
      if (res.status === 'success' && res.data) {
        form.setFieldsValue(res.data);
        setDeliveryType(res.data.delivery_type);
        setHasConfig(true);
      } else {
        // 没有配置，使用默认值
        form.setFieldsValue({
          delivery_type: 'netdisk',
          is_enabled: true,
          stock_count: -1,
        });
        setHasConfig(false);
      }
    } catch (error: any) {
      // 404表示没有配置，不显示错误
      if (error.status !== 404) {
        message.error('加载发货配置失败');
      }
      form.setFieldsValue({
        delivery_type: 'netdisk',
        is_enabled: true,
        stock_count: -1,
      });
      setHasConfig(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [itemId]);

  // 保存配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      await saveDeliveryConfig(itemId, values);
      message.success('发货配置保存成功');
      setHasConfig(true);
      onSuccess?.();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        message.error('请检查表单填写');
      } else {
        message.error('保存失败：' + (error.message || '未知错误'));
      }
    } finally {
      setSaving(false);
    }
  };

  // 删除配置
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDeliveryConfig(itemId);
      message.success('发货配置已删除');
      form.resetFields();
      form.setFieldsValue({
        delivery_type: 'netdisk',
        is_enabled: true,
        stock_count: -1,
      });
      setHasConfig(false);
      onSuccess?.();
    } catch (error: any) {
      message.error('删除失败：' + (error.message || '未知错误'));
    } finally {
      setDeleting(false);
    }
  };

  // 重新加载
  const handleReload = () => {
    loadConfig();
    message.info('配置已重新加载');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <Card
      title="自动发货配置"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReload}>
            重新加载
          </Button>
          {hasConfig && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleting}
            >
              删除配置
            </Button>
          )}
        </Space>
      }
    >
      <Alert
        message="虚拟商品自动发货"
        description="配置后，买家付款成功后系统将自动发送商品信息（网盘链接、卡密等）。适用于虚拟商品销售场景。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          delivery_type: 'netdisk',
          is_enabled: true,
          stock_count: -1,
        }}
      >
        {/* 启用开关 */}
        <Form.Item
          label="启用自动发货"
          name="is_enabled"
          valuePropName="checked"
          extra="关闭后该商品不会自动发货"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Divider />

        {/* 发货类型 */}
        <Form.Item
          label="发货类型"
          name="delivery_type"
          rules={[{ required: true, message: '请选择发货类型' }]}
        >
          <Radio.Group onChange={(e) => setDeliveryType(e.target.value)}>
            <Radio.Button value="netdisk">网盘链接</Radio.Button>
            <Radio.Button value="cardkey">卡密</Radio.Button>
            <Radio.Button value="text">自定义文本</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* 发货内容 */}
        {deliveryType === 'netdisk' && (
          <>
            <Form.Item
              label="网盘链接"
              name="delivery_content"
              rules={[
                { required: true, message: '请输入网盘链接' },
                { type: 'url', message: '请输入有效的网盘链接' },
              ]}
              extra="支持百度网盘、阿里云盘等，建议使用永久有效链接"
            >
              <Input
                placeholder="https://pan.baidu.com/s/xxxxx"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="提取码"
              name="extraction_code"
              extra="如果网盘需要提取码，请填写"
            >
              <Input placeholder="abcd" maxLength={10} />
            </Form.Item>
          </>
        )}

        {deliveryType === 'cardkey' && (
          <Form.Item
            label="卡密"
            name="delivery_content"
            rules={[{ required: true, message: '请输入卡密' }]}
            extra="输入卡密信息，买家付款后会自动发送"
          >
            <TextArea
              placeholder="XXXX-XXXX-XXXX-XXXX"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        )}

        {deliveryType === 'text' && (
          <Form.Item
            label="发货内容"
            name="delivery_content"
            rules={[{ required: true, message: '请输入发货内容' }]}
            extra="自定义发货文本内容"
          >
            <TextArea
              placeholder="输入发货内容"
              rows={6}
              maxLength={1000}
              showCount
            />
          </Form.Item>
        )}

        <Divider />

        {/* 库存管理 */}
        <Form.Item
          label="库存数量"
          name="stock_count"
          rules={[{ required: true, message: '请设置库存数量' }]}
          extra="-1 表示无限库存，其他数字表示有限库存（发货后自动减少）"
        >
          <InputNumber
            min={-1}
            max={999999}
            style={{ width: 200 }}
            placeholder="输入库存数量"
          />
        </Form.Item>

        <Divider />

        {/* 自定义消息模板 */}
        <Form.Item
          label="自定义消息模板（可选）"
          name="custom_message"
          extra={
            <div>
              <div>留空则使用默认模板。支持变量：</div>
              <div>• {'{content}'} - 发货内容（网盘链接/卡密等）</div>
              <div>• {'{code}'} - 提取码</div>
              <div>• {'{title}'} - 商品标题</div>
              <div>• {'{price}'} - 商品价格</div>
            </div>
          }
        >
          <TextArea
            placeholder={`示例：
亲爱的客户，您购买的【{title}】已发货！

📦 网盘链接：{content}
🔑 提取码：{code}
💰 实付：{price}元

感谢支持，祝您使用愉快！`}
            rows={8}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              size="large"
            >
              保存配置
            </Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 预览区域 */}
      <Card
        title="发货消息预览"
        size="small"
        style={{ marginTop: 24, background: '#f5f5f5' }}
      >
        <div style={{ whiteSpace: 'pre-wrap', color: '#666' }}>
          {deliveryType === 'netdisk' && !form.getFieldValue('custom_message') && (
            <>
              您好！感谢购买，以下是商品资源：
              <br />
              <br />
              📦 网盘链接：{form.getFieldValue('delivery_content') || '（网盘链接）'}
              <br />
              🔑 提取码：{form.getFieldValue('extraction_code') || '（提取码）'}
              <br />
              <br />
              请及时保存，如有问题请随时联系我。祝您使用愉快！
            </>
          )}
          {deliveryType === 'cardkey' && !form.getFieldValue('custom_message') && (
            <>
              您好！感谢购买，以下是您的卡密信息：
              <br />
              <br />
              🎟️ 卡密：{form.getFieldValue('delivery_content') || '（卡密）'}
              <br />
              <br />
              请妥善保管，如有问题请随时联系我。
            </>
          )}
          {deliveryType === 'text' && !form.getFieldValue('custom_message') && (
            <>{form.getFieldValue('delivery_content') || '（自定义内容）'}</>
          )}
          {form.getFieldValue('custom_message') && (
            <>{form.getFieldValue('custom_message')}</>
          )}
        </div>
      </Card>
    </Card>
  );
};

export default DeliveryConfig;
