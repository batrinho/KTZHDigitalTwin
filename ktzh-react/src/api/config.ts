const isProduction = import.meta.env.PROD;

export const API_BASE = isProduction
  ? (import.meta.env.VITE_API_BASE ?? '')
  : '';

export const WS_BASE = isProduction
  ? (import.meta.env.VITE_WS_BASE ?? `ws://${window.location.host}`)
  : `ws://${window.location.host}`;
