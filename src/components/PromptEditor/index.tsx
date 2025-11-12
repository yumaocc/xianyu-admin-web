import React, { useRef, useEffect, useState } from 'react';
import { Card, Tabs, Button, Space, message, Tooltip, Modal } from 'antd';
import { 
  PlayCircleOutlined, 
  SaveOutlined, 
  EyeOutlined, 
  BulbOutlined,
  FullscreenOutlined,
  CompressOutlined 
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import type { PromptType, Product, EditorConfig } from '@/types';
import { usePromptModel } from '@/models';
import './index.less';

interface PromptEditorProps {
  productId: string;
  productInfo: Pick<Product, 'title' | 'desc' | 'price' | 'itemId'>;
  height?: number;
  readOnly?: boolean;
  onSave?: (type: PromptType, content: string) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  productId,
  productInfo,
  height = 400,
  readOnly = false,
  onSave,
}) => {
  const editorRef = useRef<any>(null);
  const [activeType, setActiveType] = useState<PromptType>('default');
  const [editorContent, setEditorContent] = useState<Record<PromptType, string>>({
    price: '',
    tech: '',
    default: '',
    classify: '',
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  
  const { 
    prompts, 
    loading, 
    previewResult, 
    fetchPrompts, 
    updatePrompt, 
    previewPrompt, 
    validatePrompt,
    clearPreview 
  } = usePromptModel();

  // 编辑器配置
  const editorConfig: EditorConfig = {
    theme: 'vs',
    language: 'plaintext',
    readOnly,
    wordWrap: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  };

  // 获取提示词数据
  useEffect(() => {
    if (productId) {
      fetchPrompts(productId);
    }
  }, [productId, fetchPrompts]);

  // 更新编辑器内容
  useEffect(() => {
    if (prompts) {
      setEditorContent(prompts);
    }
  }, [prompts]);

  // 编辑器挂载事件
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // 配置编辑器
    editor.updateOptions(editorConfig);
    
    // 添加快捷键
    editor.addAction({
      id: 'save-prompt',
      label: 'Save Prompt',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => handleSave(),
    });
    
    editor.addAction({
      id: 'preview-prompt',
      label: 'Preview Prompt',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
      run: () => handlePreview(),
    });
  };

  // 内容变化处理
  const handleContentChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(prev => ({
        ...prev,
        [activeType]: value,
      }));
    }
  };

  // 保存提示词
  const handleSave = async () => {
    const content = editorContent[activeType];
    if (!content.trim()) {
      message.warning('提示词内容不能为空');
      return;
    }

    // 验证提示词
    const validation = await validatePrompt(content, activeType);
    if (validation && !validation.valid) {
      Modal.confirm({
        title: '提示词验证失败',
        content: (
          <div>
            <p>发现以下问题：</p>
            <ul>
              {validation.errors?.map((error: string, index: number) => (
                <li key={index} style={{ color: '#ff4d4f' }}>{error}</li>
              ))}
            </ul>
            <p>是否仍要保存？</p>
          </div>
        ),
        onOk: () => savePrompt(content),
      });
    } else {
      await savePrompt(content);
    }
  };

  const savePrompt = async (content: string) => {
    try {
      await updatePrompt(productId, activeType, content);
      onSave?.(activeType, content);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  // 预览提示词
  const handlePreview = async () => {
    const content = editorContent[activeType];
    if (!content.trim()) {
      message.warning('提示词内容不能为空');
      return;
    }

    await previewPrompt(activeType, content, productInfo);
    setPreviewVisible(true);
  };

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 插入变量
  const insertVariable = (variable: string) => {
    const editor = editorRef.current;
    if (editor) {
      const position = editor.getPosition();
      editor.executeEdits('', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: `{${variable}}`,
      }]);
      editor.focus();
    }
  };

  // 标签页配置
  const tabItems = [
    {
      key: 'default' as PromptType,
      label: '通用提示词',
      children: null,
    },
    {
      key: 'price' as PromptType,
      label: '价格提示词',
      children: null,
    },
    {
      key: 'tech' as PromptType,
      label: '技术提示词',
      children: null,
    },
    {
      key: 'classify' as PromptType,
      label: '分类提示词',
      children: null,
    },
  ];

  // 常用变量列表
  const commonVariables = [
    { key: 'title', label: '商品名称' },
    { key: 'price', label: '商品价格' },
    { key: 'desc', label: '商品描述' },
    { key: 'itemId', label: '商品ID' },
    { key: 'category', label: '商品分类' },
    { key: 'sellingPoints', label: '卖点' },
  ];

  return (
    <div className={`prompt-editor ${isFullscreen ? 'fullscreen' : ''}`}>
      <Card
        title={`提示词编辑器 - ${productInfo.title}`}
        extra={
          <Space>
            <Tooltip title="插入变量">
              <Button
                icon={<BulbOutlined />}
                type="text"
                onClick={() => {
                  const variables = commonVariables.map(v => (
                    <Button 
                      key={v.key} 
                      type="link" 
                      size="small"
                      onClick={() => insertVariable(v.key)}
                    >
                      {v.label}
                    </Button>
                  ));
                  
                  Modal.info({
                    title: '选择变量插入',
                    content: <Space wrap>{variables}</Space>,
                    width: 600,
                  });
                }}
              />
            </Tooltip>
            <Tooltip title="预览效果">
              <Button
                icon={<EyeOutlined />}
                type="text"
                onClick={handlePreview}
                loading={loading}
              />
            </Tooltip>
            <Tooltip title="保存">
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={handleSave}
                loading={loading}
                disabled={readOnly}
              />
            </Tooltip>
            <Tooltip title={isFullscreen ? '退出全屏' : '全屏编辑'}>
              <Button
                icon={isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />}
                type="text"
                onClick={toggleFullscreen}
              />
            </Tooltip>
          </Space>
        }
        className="editor-card"
      >
        <Tabs
          activeKey={activeType}
          onChange={(key) => setActiveType(key as PromptType)}
          items={tabItems}
          className="editor-tabs"
        />
        
        <div className="monaco-editor-container">
          <Editor
            height={isFullscreen ? '70vh' : height}
            value={editorContent[activeType]}
            onChange={handleContentChange}
            onMount={handleEditorDidMount}
            loading={<div>编辑器加载中...</div>}
            options={editorConfig}
          />
        </div>
      </Card>

      {/* 预览模态框 */}
      <Modal
        title="提示词预览"
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          clearPreview();
        }}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {previewResult && (
          <div className="preview-content">
            <div className="preview-stats">
              <Space>
                <span>字数统计: {previewResult.wordCount}</span>
                <span>变量数量: {Object.keys(previewResult.variables).length}</span>
              </Space>
            </div>
            
            <div className="preview-variables">
              <h4>变量替换:</h4>
              {Object.entries(previewResult.variables).map(([key, value]) => (
                <div key={key} className="variable-item">
                  <code>{`{${key}}`}</code> → <span>{value}</span>
                </div>
              ))}
            </div>
            
            <div className="preview-result">
              <h4>预览结果:</h4>
              <div className="preview-text">{previewResult.preview}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PromptEditor;