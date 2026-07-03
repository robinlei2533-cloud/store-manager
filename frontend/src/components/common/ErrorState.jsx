import React from 'react';
import { Button, Result } from 'antd';

/**
 * 通用错误状态组件
 * @param {string} title - 错误标题
 * @param {string} message - 错误详情
 * @param {function} onRetry - 重试回调
 * @param {function} onBack - 返回回调
 */
const ErrorState = ({ title = '加载失败', message, onRetry, onBack }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      minHeight: 300,
    }}>
      <Result
        status="error"
        title={<span style={{ color: '#e5e5e5' }}>{title}</span>}
        subTitle={message ? <span style={{ color: '#888' }}>{message}</span> : undefined}
        extra={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {onRetry && (
              <Button type="primary" onClick={onRetry} style={{ background: '#FFD700', borderColor: '#FFD700', color: '#14141e' }}>
                重试
              </Button>
            )}
            {onBack && (
              <Button onClick={onBack}>返回</Button>
            )}
          </div>
        }
      />
    </div>
  );
};

export default ErrorState;
