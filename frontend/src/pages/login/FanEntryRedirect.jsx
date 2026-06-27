import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Spin } from 'antd';

const FanEntryRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const savedProfileId = localStorage.getItem('store_manager_current_user');
    const fanLoggedIn = localStorage.getItem('fan_logged_in');
    if (savedProfileId || fanLoggedIn) {
      navigate('/fan-center', { replace: true });
    } else {
      navigate('/fan-entry', { replace: true });
    }
  }, [navigate]);

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

