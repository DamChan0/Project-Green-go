import React, { useState, useEffect, useRef } from "react";
import {
    WindowMinimise,
    WindowToggleMaximise,
    WindowGetSize,
    WindowSetSize,
    Quit,
} from "../wailsjs/runtime/runtime";
import { GetSystemInfo } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

import "./App.css";
import ProgressBar from "./components/ProgressBar";
import ProgressBarSettingsPanel from "./components/ProgressBarSettingPanel";
import { ProgressBarConfig } from "./config/progressConfig";

function App() {
    // ─ 시스템 정보 상태
    const [systemInfo, setSystemInfo] = useState<main.SystemInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ─ UI 상태
    const [verticalMode, setVerticalMode] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [barConfig, setBarConfig] = useState<ProgressBarConfig>({
        compactMode: true,
        animated: true,
        colorMode: "multi",
        barColor: "#0bc568",
    });

    // ─ 리사이즈 제어용 refs
    const handleRef = useRef<HTMLDivElement>(null);
    const isResizingRef = useRef(false);
    const startMouse = useRef({ x: 0, y: 0 });
    const startSize = useRef({ w: 0, h: 0 });

    // ─ 1초마다 시스템 정보 갱신
    useEffect(() => {
        const fetchSystemInfo = async () => {
            try {
                const info = await GetSystemInfo();
                setSystemInfo(info);
                setError(null);
            } catch {
                setError("시스템 정보를 불러오지 못했습니다.");
            }
        };
        fetchSystemInfo();
        const id = setInterval(fetchSystemInfo, 1000);
        return () => clearInterval(id);
    }, []);

    // ─ 포인터 이벤트 핸들러
    const onPointerDown = async (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        // 포인터 캡처 시작 (포인터가 요소를 벗어나도 이벤트 보장)
        handleRef.current?.setPointerCapture(e.pointerId);
        isResizingRef.current = true;
        startMouse.current = { x: e.clientX, y: e.clientY };
        const size = await WindowGetSize();
        startSize.current = { w: size.w, h: size.h };
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isResizingRef.current) return;
        const dx = e.clientX - startMouse.current.x;
        const dy = e.clientY - startMouse.current.y;
        const newW = Math.max(startSize.current.w + dx, 400);
        const newH = Math.max(startSize.current.h + dy, 300);
        WindowSetSize(newW, newH);
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        isResizingRef.current = false;
        handleRef.current?.releasePointerCapture(e.pointerId);
    };

    // ─ 레이아웃 스타일
    const appShellStyle: React.CSSProperties = {
        position: "relative",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgb(74, 18, 82)",
        color: "#f0f0f0",
    };
    const contentStyle: React.CSSProperties = {
        flexGrow: 1,
        overflowY: "auto",
        padding: "20px",
    };

    return (
        <div id='app-shell' style={appShellStyle}>
            {/* 상단 드래그 바 */}
            <div className='draggable-top-bar'>
                <div
                    className='window-controls'
                    style={{ marginRight: "auto" }}
                >
                    <button
                        className='control-button'
                        onClick={() => setVerticalMode((v) => !v)}
                        title='Toggle Orientation'
                    >
                        ↻
                    </button>
                </div>
                <div className='window-controls'>
                    <button
                        className='control-button minimize-button'
                        onClick={WindowMinimise}
                        title='Minimize'
                    >
                        _
                    </button>
                    <button
                        className='control-button maximize-button'
                        onClick={WindowToggleMaximise}
                        title='Maximize/Restore'
                    >
                        ▢
                    </button>
                    <button
                        className='control-button close-button'
                        onClick={Quit}
                        title='Close'
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div id='app-content-scrollable' style={contentStyle}>
                {error && <div style={{ color: "red" }}>{error}</div>}
                {!systemInfo && !error && (
                    <div>Loading system information...</div>
                )}

                {systemInfo && (
                    <>
                        <h1>PC System Monitor</h1>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 8,
                            }}
                        >
                            <button
                                className='control-button expand-button'
                                onClick={() => setSettingsVisible((v) => !v)}
                                title={
                                    settingsVisible
                                        ? "설정 숨기기"
                                        : "설정 표시"
                                }
                                style={{ width: 30, height: 30, opacity: 0.6 }}
                            >
                                {settingsVisible ? "▲" : "▼"}
                            </button>
                            <span style={{ marginLeft: 8, fontWeight: 600 }}>
                                ProgressBar 설정
                            </span>
                        </div>
                        {settingsVisible && (
                            <ProgressBarSettingsPanel
                                config={barConfig}
                                setConfig={setBarConfig}
                            />
                        )}

                        {/* CPU */}
                        <section
                            style={{
                                marginBottom: 20,
                                borderBottom: "1px solid #eee",
                                paddingBottom: 10,
                            }}
                        >
                            <h2>CPU</h2>
                            <p>
                                <strong>Average Usage:</strong>{" "}
                                {systemInfo.cpu_usage_average?.toFixed(2)}%
                            </p>
                            <p>
                                <strong>Threads:</strong>{" "}
                                {systemInfo.cpu_usage_per_thread?.length}
                            </p>
                            <ProgressBar
                                label='CPU Avg Usage'
                                percentage={systemInfo.cpu_usage_average || 0}
                                vertical={verticalMode}
                                compact={barConfig.compactMode}
                                config={barConfig}
                                variant='main'
                            />
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 12,
                                    marginTop: 12,
                                }}
                            >
                                {systemInfo.cpu_usage_per_thread?.map(
                                    (u, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                flexBasis: verticalMode
                                                    ? "auto"
                                                    : "calc(33.33% - 8px)",
                                                textAlign: "center",
                                            }}
                                        >
                                            <ProgressBar
                                                label={`T${i}`}
                                                percentage={u}
                                                vertical={verticalMode}
                                                compact={barConfig.compactMode}
                                                config={barConfig}
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </section>

                        {/* Memory */}
                        <section
                            style={{
                                marginBottom: 20,
                                borderBottom: "1px solid #eee",
                                paddingBottom: 10,
                            }}
                        >
                            <h2>Memory (RAM)</h2>
                            <p>
                                <strong>Usage:</strong>{" "}
                                {systemInfo.memory_usage_percent?.toFixed(2)}%
                            </p>
                            <p>
                                <strong>Capacity:</strong>{" "}
                                {systemInfo.memory_used_gb?.toFixed(2)} GB /{" "}
                                {systemInfo.memory_total_gb?.toFixed(2)} GB
                            </p>
                            <ProgressBar
                                label='Memory Usage'
                                percentage={
                                    systemInfo.memory_usage_percent || 0
                                }
                                vertical={verticalMode}
                                compact={barConfig.compactMode}
                                config={barConfig}
                            />
                        </section>

                        {/* Disk */}
                        <section>
                            <h2>Disk (Root /)</h2>
                            <p>
                                <strong>Usage:</strong>{" "}
                                {systemInfo.disk_usage_percent?.toFixed(2)}%
                            </p>
                            <p>
                                <strong>Capacity:</strong>{" "}
                                {systemInfo.disk_used_gb?.toFixed(2)} GB /{" "}
                                {systemInfo.disk_total_gb?.toFixed(2)} GB
                            </p>
                            <ProgressBar
                                label='Disk Usage'
                                percentage={systemInfo.disk_usage_percent || 0}
                                vertical={verticalMode}
                                compact={barConfig.compactMode}
                                config={barConfig}
                            />
                        </section>
                    </>
                )}
            </div>

            {/* 리사이즈 핸들 */}
            <div
                ref={handleRef}
                className='resize-handle'
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            />
        </div>
    );
}

export default App;
