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
    window.location.hash = '#/dashboard';
    window.location.reload();
  };

  handleClearData = () => {
    if (window.confirm('This will clear all local data and reload. Continue?')) {
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
            <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>
              An unexpected error occurred. Try reloading the page. If the problem persists, clearing local data may help.
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
                Reload Page
              </button>
              <button onClick={this.handleClearData} style={{
                padding: '8px 24px', background: '#fff', color: '#ff4d4f',
                border: '1px solid #ff4d4f', borderRadius: 6, cursor: 'pointer', fontSize: 14,
              }}>
                Clear Local Data
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
