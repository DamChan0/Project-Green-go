import React, { useState, useEffect } from 'react';
// Wails 런타임 함수를 import 합니다. 경로가 정확한지 확인하세요.
import { WindowMinimise, WindowToggleMaximise, Quit } from '../wailsjs/runtime/runtime';
import { GetSystemInfo } from '../wailsjs/go/main/App';
import { main } from '../wailsjs/go/models';

// CSS 파일을 import 합니다.
import './App.css'; // 또는 './style.css'

function App() {
  const [systemInfo, setSystemInfo] = useState<main.SystemInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const info: main.SystemInfo = await GetSystemInfo();
        setSystemInfo(info);
        setError(null);
      } catch (err) {
        console.error("Error getting system info:", err);
        setError("Failed to load system info.");
      }
    };

    fetchSystemInfo();
    const intervalId = setInterval(fetchSystemInfo, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const appShellStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentAreaStyle: React.CSSProperties = {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px',
  };

  return (
    <div id="app-shell" style={appShellStyle}>
      <div className="draggable-top-bar">
        {/* 앱 제목 등 추가 가능 (선택 사항) */}
        {/* <div className="app-title">PC System Monitor</div> */}

        {/* 창 제어 버튼들을 담을 컨테이너 */}
        <div className="window-controls">
          <button
            className="control-button minimize-button"
            onClick={() => WindowMinimise()}
            title="Minimize"
          >
            {/* 간단한 텍스트 또는 아이콘 SVG/폰트 */}
            _
          </button>
          <button
            className="control-button maximize-button"
            onClick={() => WindowToggleMaximise()}
            title="Maximize/Restore"
          >
            {/* 간단한 텍스트 또는 아이콘 SVG/폰트 */}
            ▢
          </button>
          <button
            className="control-button close-button"
            onClick={() => Quit()}
            title="Close"
          >
            {/* 간단한 텍스트 또는 아이콘 SVG/폰트 */}
            ✕
          </button>
        </div>
      </div>

      <div id="app-content-scrollable" style={contentAreaStyle}>
        {error && <div style={{ color: 'red', paddingBottom: '10px' }}>Error: {error}</div>}
        {!systemInfo && !error && <div>Loading system information...</div>}
        {systemInfo && (
          <>
            <h1>PC System Monitor</h1>
            {/* CPU, Memory, Disk 정보 섹션 (이전과 동일) */}
            <section style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h2>CPU</h2>
              <p>
                <strong>Average Usage:</strong>{' '}
                {systemInfo.cpu_usage_average?.toFixed(2) ?? 'N/A'}%
              </p>
              <p>
                <strong>Threads:</strong>{' '}
                {systemInfo.cpu_usage_per_thread?.length ?? 'N/A'}
              </p>
              <details>
                <summary style={{ cursor: 'pointer' }}><strong>Usage Per Thread (%)</strong></summary>
                <p style={{ fontSize: '0.9em', wordBreak: 'break-word', lineHeight: '1.6' }}>
                  {systemInfo.cpu_usage_per_thread
                    ?.map((usage, index) => `T${index}: ${usage.toFixed(2)}`)
                    ?.join('%, ') ?? 'N/A'}
                  {systemInfo.cpu_usage_per_thread?.length > 0 ? '%' : ''}
                </p>
              </details>
            </section>

            <section style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h2>Memory (RAM)</h2>
              <p>
                <strong>Usage:</strong>{' '}
                {systemInfo.memory_usage_percent?.toFixed(2) ?? 'N/A'}%
              </p>
              <p>
                <strong>Capacity:</strong>{' '}
                {systemInfo.memory_used_gb?.toFixed(2) ?? 'N/A'} GB Used /{' '}
                {systemInfo.memory_total_gb?.toFixed(2) ?? 'N/A'} GB Total
              </p>
            </section>

            <section>
              <h2>Disk (Root /)</h2>
              <p>
                <strong>Usage:</strong>{' '}
                {systemInfo.disk_usage_percent?.toFixed(2) ?? 'N/A'}%
              </p>
              <p>
                <strong>Capacity:</strong>{' '}
                {systemInfo.disk_used_gb?.toFixed(2) ?? 'N/A'} GB Used /{' '}
                {systemInfo.disk_total_gb?.toFixed(2) ?? 'N/A'} GB Total
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default App;