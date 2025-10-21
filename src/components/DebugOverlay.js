import React, { useEffect, useMemo, useRef, useState } from 'react';
import './DebugOverlay.css';
import { DEBUG_POLL_MS, getApiBase } from '../config';

const usePing = (url, intervalMs) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const timerRef = useRef(null);

  const fetchOnce = async () => {
    try {
      const start = performance.now();
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      setLatencyMs(Math.round(performance.now() - start));
      setData(json);
      setError(null);
    } catch (e) {
      setError(String(e?.message || e));
      setData(null);
      setLatencyMs(null);
    }
  };

  useEffect(() => {
    fetchOnce();
    timerRef.current = setInterval(fetchOnce, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [url, intervalMs]);

  return { data, error, latencyMs };
};

function DebugOverlay() {
  const apiUrl = useMemo(() => `${getApiBase()}/api/health`, []);
  const { data, error, latencyMs } = usePing(apiUrl, DEBUG_POLL_MS);

  const status = error ? 'DOWN' : (data?.status || 'UNKNOWN');
  const statusClass = error ? 'bad' : status === 'OK' ? 'ok' : 'warn';

  return (
    <div className="debug-overlay">
      <div className="hdr">
        <span>Debug Overlay</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
      <div className="body">
        <div className="row"><div className="key">Backend</div><div className={statusClass}>{status}</div></div>
        <div className="row"><div className="key">Latency</div><div>{latencyMs != null ? `${latencyMs} ms` : '—'}</div></div>
        <div className="row"><div className="key">Env</div><div>{data?.environment || '—'}</div></div>
        <div className="row"><div className="key">Time</div><div>{data?.timestamp || '—'}</div></div>
        <div className="row"><div className="key">User Agent</div><div>{navigator.userAgent}</div></div>
        <div className="row"><div className="key">URL</div><div>{window.location.href}</div></div>
        {error && (
          <div className="row"><div className="key">Error</div><div className="bad" style={{maxWidth:220,wordBreak:'break-word'}}>{error}</div></div>
        )}
      </div>
    </div>
  );
}

export default DebugOverlay;
