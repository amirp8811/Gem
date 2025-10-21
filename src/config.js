export const isDebugEnabled = () => {
  try {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get('debug');
    if (qp === '1' || qp === 'true') return true;
  } catch {}
  try {
    const v = localStorage.getItem('DEBUG_OVERLAY');
    if (v === '1' || v === 'true') return true;
  } catch {}
  return false;
};

export const setDebugEnabled = (enabled) => {
  try {
    localStorage.setItem('DEBUG_OVERLAY', enabled ? '1' : '0');
  } catch {}
};

export const DEBUG_POLL_MS = 3000;

export const getApiBase = () => {
  // Allow explicit override first
  if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
  try {
    const { protocol, hostname, port } = window.location;
    // If running CRA dev server on 3000, default backend to 5000
    if (port === '3000') return `${protocol}//${hostname}:5000`;
    // Otherwise same-origin
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  } catch {
    return '';
  }
};
