// UWELL CRM — Error Monitoring (Sentry)
// Uncomment and configure DSN when ready for production
// import * as Sentry from '@sentry/react';

export function initErrorMonitoring() {
  // if (import.meta.env.VITE_SENTRY_DSN) {
  //   Sentry.init({
  //     dsn: import.meta.env.VITE_SENTRY_DSN,
  //     environment: import.meta.env.MODE,
  //     integrations: [Sentry.browserTracingIntegration()],
  //     tracesSampleRate: 0.1,
  //   });
  // }
}

export function captureError(error, context) {
  console.error('[UWELL CRM Error]', error, context);
  // if (import.meta.env.VITE_SENTRY_DSN) {
  //   Sentry.captureException(error, { extra: context });
  // }
}
