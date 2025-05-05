import React, { useState, useEffect } from 'react';
// 경로가 정확한지 다시 확인하세요. (frontend/src 기준)
import { GetSystemInfo } from '../wailsjs/go/main/App';
import { main } from '../wailsjs/go/models'; // SystemInfo 타입 import
        
function App() {
  const [systemInfo, setSystemInfo] = useState<main.SystemInfo | null>(null); // 초기값 null 설정 가능

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const info = await GetSystemInfo();
        setSystemInfo(info);
      } catch (error) {
        console.error("Error getting system info:", error);
      }
    };

    fetchSystemInfo(); // 초기 로드
    const interval = setInterval(fetchSystemInfo, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 로딩 상태 처리
  if (!systemInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>PC Monitor</h1>
      {/* Go 구조체 필드 이름 사용 */}
      <p>CPU Usage: {systemInfo.cpu_usage?.map(usage => `${usage.toFixed(2)}%`).join(', ')}</p>
      <p>Memory Usage: {systemInfo.memory_usage?.toFixed(2)}%</p>
      <p>Disk Usage: {systemInfo.disk_usage?.toFixed(2)}%</p>
    </div>
  );
}

export default App;