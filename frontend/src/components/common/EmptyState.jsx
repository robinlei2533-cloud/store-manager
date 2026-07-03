import React from 'react';
import { Empty } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

/**
 * 通用空状态组件
 * @param {string} title - 标题
 * @param {string} description - 描述文案
 * @param {React.ReactNode} action - 操作按钮
 * @param {string} icon - 图标类型
 */
const EmptyState = ({ title = '暂无数据', description, action, icon }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      minHeight: 200,
    }}>
      <Empty
        image={icon || <InboxOutlined style={{ fontSize: 48, color: 'rgba(255,215,0,0.3)' }} />}
        description={
          <div>
            <div style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>{title}</div>
            {description && <div style={{ color: '#555', fontSize: 12 }}>{description}</div>}
          </div>
        }
      >
        {action}
      </Empty>
    </div>
  );
};

export default EmptyState;
