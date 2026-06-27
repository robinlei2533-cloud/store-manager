import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import StoreApp from './App';
import useAuthStore from '../stores/authStore';

const StoreRoot = () => {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <StoreApp />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<StoreRoot />);
