import React from 'react';
import { Card, Statistic, Progress, Typography, Space, Tooltip } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  QuestionCircleOutlined 
} from '@ant-design/icons';
import './index.less';

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: number | string;
  precision?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  progress?: {
    percent: number;
    status?: 'normal' | 'active' | 'success' | 'exception';
  };
  loading?: boolean;
  description?: string;
  tooltip?: string;
  color?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  precision = 0,
  prefix,
  suffix,
  trend,
  progress,
  loading = false,
  description,
  tooltip,
  color = '#1890ff',
  icon,
  extra,
  onClick,
}) => {
  
  const cardProps = {
    loading,
    hoverable: !!onClick,
    onClick,
    className: `stat-card ${onClick ? 'clickable' : ''}`,
  };

  const renderTrend = () => {
    if (!trend) return null;

    const { value: trendValue, isPositive, period = '较昨日' } = trend;
    const trendIcon = isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
    const trendColor = isPositive ? '#52c41a' : '#f5222d';

    return (
      <div className="trend-container">
        <Space>
          <span className="trend-value" style={{ color: trendColor }}>
            {trendIcon}
            <span className="trend-number">
              {Math.abs(trendValue)}%
            </span>
          </span>
          <Text type="secondary" className="trend-period">
            {period}
          </Text>
        </Space>
      </div>
    );
  };

  const renderProgress = () => {
    if (!progress) return null;

    return (
      <div className="progress-container">
        <Progress
          percent={progress.percent}
          status={progress.status}
          showInfo={false}
          strokeColor={color}
          size="small"
        />
        <Text type="secondary" className="progress-text">
          {progress.percent}% 完成率
        </Text>
      </div>
    );
  };

  const renderHeader = () => (
    <div className="card-header">
      <div className="header-left">
        {icon && (
          <div className="header-icon" style={{ color }}>
            {icon}
          </div>
        )}
        <div className="header-title">
          <Space>
            <span>{title}</span>
            {tooltip && (
              <Tooltip title={tooltip}>
                <QuestionCircleOutlined className="tooltip-icon" />
              </Tooltip>
            )}
          </Space>
        </div>
      </div>
      {extra && (
        <div className="header-extra">
          {extra}
        </div>
      )}
    </div>
  );

  return (
    <Card {...cardProps}>
      {renderHeader()}
      
      <div className="stat-content">
        <div className="main-stat">
          <Statistic
            value={value}
            precision={precision}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ 
              color,
              fontSize: '28px',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          />
        </div>

        {description && (
          <div className="stat-description">
            <Text type="secondary">{description}</Text>
          </div>
        )}

        {renderTrend()}
        {renderProgress()}
      </div>
    </Card>
  );
};

export default StatCard;