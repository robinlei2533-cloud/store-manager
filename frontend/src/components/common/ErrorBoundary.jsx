import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#/app/dashboard';
    window.location.reload();
  };

  handleClearData = () => {
    if (window.confirm('这会清除本地演示数据并重新加载页面，是否继续？')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('store_manager_')) {
          localStorage.removeItem(key);
        }
      });
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          minHeight: '100vh', padding: 24, fontFamily: 'sans-serif',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 500 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>:(</div>
            <h2 style={{ marginBottom: 8 }}>页面遇到了一点问题</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>
              可以先刷新页面。如果仍然无法恢复，清除本地演示数据通常可以解决缓存数据导致的问题。
            </p>
            <div style={{
              background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 24,
              textAlign: 'left', fontSize: 12, color: '#999', maxHeight: 200, overflow: 'auto',
              whiteSpace: 'pre-wrap', fontFamily: 'monospace',
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={this.handleReload} style={{
                padding: '8px 24px', background: '#1677ff', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
              }}>
                重新加载
              </button>
              <button onClick={this.handleClearData} style={{
                padding: '8px 24px', background: '#fff', color: '#ff4d4f',
                border: '1px solid #ff4d4f', borderRadius: 6, cursor: 'pointer', fontSize: 14,
              }}>
                清除本地数据
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
