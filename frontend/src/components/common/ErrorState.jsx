import React from 'react';
import { Button, Result } from 'antd';

const ErrorState = ({ title = 'Unable to load this section', message, onRetry, onBack }) => {
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
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {onRetry && (
              <Button type="primary" onClick={onRetry} style={{ background: '#d8ff2f', borderColor: '#d8ff2f', color: '#14141e' }}>
                Retry
              </Button>
            )}
            {onBack && (
              <Button onClick={onBack}>Back</Button>
            )}
          </div>
        }
      />
    </div>
  );
};

export default ErrorState;
