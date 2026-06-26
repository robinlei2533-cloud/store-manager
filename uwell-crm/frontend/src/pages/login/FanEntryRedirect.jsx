import { useEffect } from 'react';
import { Spin } from 'antd';

const FanEntryRedirect = () => {
  useEffect(() => {
    const savedProfileId = localStorage.getItem('store_manager_current_user');
    const fanLoggedIn = localStorage.getItem('fan_logged_in');
    if (savedProfileId || fanLoggedIn) {
      window.location.href = '/#/fan-center';
    } else {
      window.location.href = '/fan-entry.html';
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0a0a0f',
    }}>
      <Spin size="large" />
    </div>
  );
};

export default FanEntryRedirect;
