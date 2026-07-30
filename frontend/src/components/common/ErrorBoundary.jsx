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
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack);
    // Report to Sentry when the host app provides it.
    try {
      if (window.Sentry) {
        window.Sentry.captureException(error, { contexts: { react: errorInfo } });
      }
    } catch (_e) { /* ignore */ }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    const hash = window.location.hash;
    if (hash.includes('fan-center') || hash.includes('fan-entry')) {
      window.location.hash = '#/fan-entry';
    } else if (hash.includes('store-owner') || hash.includes('store-login')) {
      window.location.hash = '#/store-login';
    } else {
      window.location.hash = '#/app/dashboard';
    }
    window.location.reload();
  };

  handleClearData = () => {
    if (window.confirm('This will clear local demo data and reload the page. Continue?')) {
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
          background: '#000000', color: '#e5e5e5',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 500 }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#FFD700' }}>U</div>
            <h2 style={{ marginBottom: 8, color: '#e5e5e5' }}>This portal needs a quick reload</h2>
            <p style={{ color: '#888', marginBottom: 24 }}>
              Reload the current portal first. If the issue continues, reset local demo data to clear stale cached records.
            </p>
            <div style={{
              background: '#0d0d14', padding: 16, borderRadius: 8, marginBottom: 24,
              textAlign: 'left', fontSize: 12, color: '#666', maxHeight: 200, overflow: 'auto',
              whiteSpace: 'pre-wrap', fontFamily: 'monospace', border: '1px solid rgba(255,215,0,0.08)',
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={this.handleReload} style={{
                padding: '8px 24px', background: '#1677ff', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
              }}>
                Reload current portal
              </button>
              <button onClick={this.handleClearData} style={{
                padding: '8px 24px', background: '#fff', color: '#ff4d4f',
                border: '1px solid #ff4d4f', borderRadius: 6, cursor: 'pointer', fontSize: 14,
              }}>
                Reset demo data
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
