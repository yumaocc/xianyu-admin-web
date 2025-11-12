import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Alert,
  Typography,
  Divider,
  Row,
  Col,
  Statistic,
  Tag,
  Collapse,
  Steps,
  List,
  Tooltip,
} from "antd";
import {
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  ExperimentOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  getCookieConfig,
  updateCookieConfig,
  testCookieConnection,
  type CookieConfig,
  type CookieTestResult,
} from "@/services/cookies";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

export default function CookieConfig() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<CookieConfig | null>(null);
  const [testResult, setTestResult] = useState<CookieTestResult | null>(null);
  const [showCookie, setShowCookie] = useState(false);

  // 加载Cookie配置
  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await getCookieConfig();
      if (response.success) {
        setConfig(response.data);
      } else {
        message.error("加载配置失败");
      }
    } catch (error) {
      message.error("网络错误");
      console.error("Failed to load config:", error);
    } finally {
      setLoading(false);
    }
  };

  // 测试Cookie连接
  const handleTest = async (cookiesStr?: string) => {
    setTesting(true);
    try {
      const response = await testCookieConnection(
        cookiesStr ? { cookiesStr } : undefined
      );

      if (response.success) {
        setTestResult(response.data);
        if (response.data.connected) {
          message.success("Cookie 连接测试成功");
        } else {
          message.error(response.data.message);
        }
      } else {
        message.error(response.message || "测试连接失败");
        setTestResult(null);
      }
    } catch (error) {
      message.error("测试连接时发生错误");
      console.error("Connection test failed:", error);
      setTestResult(null);
    } finally {
      setTesting(false);
    }
  };

  // 保存Cookie配置
  const handleSave = async (values: { cookiesStr: string }) => {
    setSaving(true);
    try {
      const response = await updateCookieConfig({
        cookiesStr: values.cookiesStr.trim(),
      });

      if (response.success) {
        message.success("Cookie 配置保存成功");
        loadConfig(); // 重新加载配置
        setTestResult(null); // 清除之前的测试结果
      } else {
        message.error(response.message || "保存失败");
      }
    } catch (error) {
      message.error("保存时发生错误");
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  // 测试当前输入的Cookie
  const handleTestCurrent = () => {
    const cookiesStr = form.getFieldValue("cookiesStr");
    if (!cookiesStr?.trim()) {
      message.warning("请先输入Cookie内容");
      return;
    }
    handleTest(cookiesStr.trim());
  };

  // Cookie获取步骤
  const cookieSteps = [
    {
      title: "打开闲鱼网站",
      description: "在浏览器中访问 www.goofish.com 并登录您的账号",
    },
    {
      title: "打开开发者工具",
      description: '按 F12 或右键选择"检查"打开开发者工具',
    },
    {
      title: "进入网络面板",
      description: "点击 Network（网络）标签页",
    },
    {
      title: "刷新页面",
      description: "按 F5 刷新页面，观察网络请求",
    },
    {
      title: "查找请求",
      description: "找到任意一个对 goofish.com 的请求",
    },
    {
      title: "复制Cookie",
      description: "在请求头中找到 Cookie 字段，复制其完整值",
    },
  ];

  // 初始加载
  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, marginBottom: 16 }}>
            <SettingOutlined style={{ marginRight: 8 }} />
            闲鱼 Cookie 配置
          </Title>

          <Alert
            message="重要说明"
            description="Cookie 是访问闲鱼服务的必要凭证，请确保来源可信。配置后系统将能够自动获取您的闲鱼商品信息。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </div>

        <Row gutter={24}>
          <Col span={16}>
            <Card title="Cookie 配置" size="small">
              {/* 当前配置状态 */}
              {config && (
                <div style={{ marginBottom: 24 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="配置状态"
                        value={config.hasCookies ? "已配置" : "未配置"}
                        prefix={
                          config.hasCookies ? (
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          ) : (
                            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                          )
                        }
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="最后更新"
                        value={
                          config.lastUpdated
                            ? new Date(config.lastUpdated).toLocaleString()
                            : "从未"
                        }
                      />
                    </Col>
                    <Col span={8}>
                      <Button
                        icon={<ExperimentOutlined />}
                        onClick={() => handleTest()}
                        loading={testing}
                        disabled={!config.hasCookies}
                      >
                        测试连接
                      </Button>
                    </Col>
                  </Row>

                  {/* 显示Cookie预览 */}
                  {config.hasCookies && (
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Cookie 预览:</Text>
                      <div style={{ marginTop: 8 }}>
                        {Object.entries(config.cookiePreview).map(
                          ([key, value]) => (
                            <Tag key={key} style={{ marginBottom: 4 }}>
                              {key}: {value}
                            </Tag>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 测试结果 */}
              {testResult && (
                <Alert
                  message={testResult.connected ? "连接成功" : "连接失败"}
                  description={
                    <div>
                      <div>{testResult.message}</div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        测试时间:{" "}
                        {new Date(testResult.testTime).toLocaleString()}
                      </div>
                    </div>
                  }
                  type={testResult.connected ? "success" : "error"}
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              {/* Cookie表单 */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{ cookiesStr: "" }}
              >
                <Form.Item
                  name="cookiesStr"
                  label={
                    <Space>
                      Cookie 内容
                      <Tooltip title="点击查看/隐藏Cookie内容">
                        <Button
                          type="link"
                          size="small"
                          icon={
                            showCookie ? (
                              <EyeInvisibleOutlined />
                            ) : (
                              <EyeOutlined />
                            )
                          }
                          onClick={() => setShowCookie(!showCookie)}
                        />
                      </Tooltip>
                    </Space>
                  }
                  rules={[
                    { required: true, message: "请输入Cookie内容" },
                    { min: 50, message: "Cookie内容过短，请检查是否完整" },
                  ]}
                >
                  <TextArea
                    rows={8}
                    placeholder="请粘贴从浏览器开发者工具中获取的完整Cookie内容..."
                    style={{
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                    {...(showCookie
                      ? {}
                      : {
                          style: {
                            fontFamily: "monospace",
                            fontSize: "12px",
                            WebkitTextSecurity: "disc",
                          } as React.CSSProperties,
                        })}
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={saving}
                      icon={<SettingOutlined />}
                    >
                      保存配置
                    </Button>
                    <Button onClick={handleTestCurrent} loading={testing}>
                      测试当前输入
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={loadConfig}
                      loading={loading}
                    >
                      刷新状态
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="获取指南" size="small">
              <Steps
                direction="vertical"
                size="small"
                current={-1}
                style={{ marginBottom: 16 }}
              >
                {cookieSteps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </Steps>

              <Divider />

              <Collapse size="small" ghost>
                <Collapse.Panel
                  header={
                    <Space>
                      <InfoCircleOutlined />
                      <Text strong>详细说明</Text>
                    </Space>
                  }
                  key="details"
                >
                  <List size="small">
                    <List.Item>
                      <Text>• Cookie 包含您的登录凭证，请妥善保管</Text>
                    </List.Item>
                    <List.Item>
                      <Text>• 建议定期更新 Cookie 以保持连接有效</Text>
                    </List.Item>
                    <List.Item>
                      <Text>• 如遇连接问题，请尝试重新获取 Cookie</Text>
                    </List.Item>
                    <List.Item>
                      <Text>• Cookie 仅在本地存储，不会上传到其他服务器</Text>
                    </List.Item>
                  </List>
                </Collapse.Panel>

                <Collapse.Panel
                  header={
                    <Space>
                      <WarningOutlined />
                      <Text strong>注意事项</Text>
                    </Space>
                  }
                  key="warnings"
                >
                  <List size="small">
                    <List.Item>
                      <Text type="warning">• 不要与他人分享您的 Cookie</Text>
                    </List.Item>
                    <List.Item>
                      <Text type="warning">
                        • 退出闲鱼账号会导致 Cookie 失效
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text type="warning">• 长时间不使用可能需要重新获取</Text>
                    </List.Item>
                    <List.Item>
                      <Text type="warning">• 请在安全的网络环境下操作</Text>
                    </List.Item>
                  </List>
                </Collapse.Panel>

                <Collapse.Panel
                  header={
                    <Space>
                      <CheckCircleOutlined />
                      <Text strong>验证方法</Text>
                    </Space>
                  }
                  key="validation"
                >
                  <Paragraph style={{ fontSize: "12px" }}>
                    有效的 Cookie 应该包含以下关键字段：
                  </Paragraph>
                  <List size="small">
                    <List.Item>
                      <Text code>unb</Text>: 用户唯一标识
                    </List.Item>
                    <List.Item>
                      <Text code>cookie2</Text>: 会话验证
                    </List.Item>
                    <List.Item>
                      <Text code>_m_h5_tk</Text>: 移动端令牌
                    </List.Item>
                    <List.Item>
                      <Text code>cna</Text>: 客户端标识
                    </List.Item>
                  </List>
                </Collapse.Panel>
              </Collapse>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
