import React, { useState, useEffect } from 'react';
// 경로가 정확한지 다시 확인하세요. (frontend/src 기준)
import { GetSystemInfo } from '../wailsjs/go/main/App';
import { main } from '../wailsjs/go/models'; // SystemInfo 타입 import
        
function App() {
  // 상태 변수: 시스템 정보를 저장합니다. 초기값은 null입니다.
  // 타입은 Wails가 생성한 'main.SystemInfo'를 사용합니다.
  const [systemInfo, setSystemInfo] = useState<main.SystemInfo | null>(null);
  // 에러 상태를 관리하기 위한 상태 변수 (선택 사항)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 시스템 정보를 비동기적으로 가져오는 함수
    const fetchSystemInfo = async () => {
      try {
        // Wails를 통해 Go의 GetSystemInfo 함수를 호출합니다.
        const info: main.SystemInfo = await GetSystemInfo();
        // 가져온 정보로 상태를 업데이트합니다.
        setSystemInfo(info);
        // 성공 시 에러 상태 초기화
        setError(null);
      } catch (err) {
        // 에러 발생 시 콘솔에 로그를 남기고 에러 상태를 설정합니다.
        console.error("Error getting system info:", err);
        setError("Failed to load system info.");
        // 에러가 발생해도 이전 데이터는 유지될 수 있습니다.
        // 필요하다면 setSystemInfo(null) 호출 가능
      }
    };

    // 컴포넌트가 마운트될 때 즉시 한 번 호출합니다.
    fetchSystemInfo();
    // 1000ms(1초) 간격으로 fetchSystemInfo 함수를 반복 호출하는 인터벌을 설정합니다.
    const intervalId = setInterval(fetchSystemInfo, 1000);

    // 컴포넌트가 언마운트될 때 실행될 클린업 함수입니다.
    // 인터벌을 정리하여 메모리 누수를 방지합니다.
    return () => clearInterval(intervalId);
  }, []); // 빈 의존성 배열은 이 effect가 마운트 시 한 번만 실행되고, 언마운트 시 클린업됨을 의미합니다.

  // 에러가 발생했을 경우 에러 메시지를 표시합니다.
  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  // 데이터가 아직 로드되지 않았을 경우 로딩 메시지를 표시합니다.
  if (!systemInfo) {
    return <div>Loading system information...</div>;
  }

  // 데이터 로딩이 완료되면 시스템 정보를 표시합니다.
  // Go 구조체의 필드 이름 (JSON 태그 또는 필드명 기준, Wails가 snake_case로 변환했을 가능성 높음) 사용
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>PC System Monitor</h1>

      {/* CPU 정보 섹션 */}
      <section style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h2>CPU</h2>
        {/* 평균 CPU 사용률 */}
        <p>
          <strong>Average Usage:</strong>{' '}
          {systemInfo.cpu_usage_average?.toFixed(2) ?? 'N/A'}%
        </p>
        {/* 스레드 개수 */}
        <p>
          <strong>Threads:</strong>{' '}
          {systemInfo.cpu_usage_per_thread?.length ?? 'N/A'}
        </p>
        {/* 스레드별 CPU 사용률 (내용이 길 수 있으므로 주의) */}
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

      {/* 메모리 정보 섹션 */}
      <section style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h2>Memory (RAM)</h2>
        {/* 메모리 사용률 */}
        <p>
          <strong>Usage:</strong>{' '}
          {systemInfo.memory_usage_percent?.toFixed(2) ?? 'N/A'}%
        </p>
        {/* 사용 중인 메모리 / 전체 메모리 (GB) */}
        <p>
          <strong>Capacity:</strong>{' '}
          {systemInfo.memory_used_gb?.toFixed(2) ?? 'N/A'} GB Used /{' '}
          {systemInfo.memory_total_gb?.toFixed(2) ?? 'N/A'} GB Total
        </p>
      </section>

      {/* 디스크 정보 섹션 (루트 기준) */}
      <section>
        <h2>Disk (Root /)</h2>
        {/* 디스크 사용률 */}
        <p>
          <strong>Usage:</strong>{' '}
          {systemInfo.disk_usage_percent?.toFixed(2) ?? 'N/A'}%
        </p>
        {/* 사용 중인 디스크 / 전체 디스크 (GB) */}
        <p>
          <strong>Capacity:</strong>{' '}
          {systemInfo.disk_used_gb?.toFixed(2) ?? 'N/A'} GB Used /{' '}
          {systemInfo.disk_total_gb?.toFixed(2) ?? 'N/A'} GB Total
        </p>
      </section>

      {/* TODO: 향후 네트워크, GPU 정보 추가 시 여기에 섹션 추가 */}
    </div>
  );
}

export default App;