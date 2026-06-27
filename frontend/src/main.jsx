import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import useAuthStore from './stores/authStore';

const Root = () => {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <App />;
};

createRoot(document.getElementById('root')).render(<Root />);
