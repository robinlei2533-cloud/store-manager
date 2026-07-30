import React from 'react';
import { Empty } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

/**
 * Shared empty-state component.
 * @param {string} title - Short empty-state title.
 * @param {string} description - Optional supporting copy.
 * @param {React.ReactNode} action - Optional action button.
 * @param {string} icon - Optional Ant Design empty image.
 */
const EmptyState = ({ title = 'No data yet', description, action, icon }) => {
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
