import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import FanApp from './App';
import useAuthStore from '../stores/authStore';

const FanRoot = () => {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <FanApp />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<FanRoot />);
