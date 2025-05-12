import React, { useState, useEffect } from "react";
import {
    WindowMinimise,
    WindowToggleMaximise,
    Quit,
} from "../wailsjs/runtime/runtime";
import { GetSystemInfo } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

import "./App.css";
import ProgressBar from "./components/ProgressBar";
import ProgressBarSettingsPanel from "./components/ProgressBarSettingPanel";
import { ProgressBarConfig } from "./config/progressConfig";

function App() {
    const [systemInfo, setSystemInfo] = useState<main.SystemInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [verticalMode, setVerticalMode] = useState(false);

    const [barConfig, setBarConfig] = useState<ProgressBarConfig>({
        compactMode: true,
        animated: true,
        colorMode: "multi",
        barColor: "#0bc568",
    });

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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
    };

    const contentAreaStyle: React.CSSProperties = {
        flexGrow: 1,
        overflowY: "auto",
        padding: "20px",
    };

    return (
        <div id='app-shell' style={appShellStyle}>
            <div className='draggable-top-bar'>
                {/* 왼쪽: 회전 버튼 */}
                <div
                    className='window-controls'
                    style={{ marginRight: "auto" }}
                >
                    <button
                        className='control-button'
                        onClick={() => setVerticalMode((prev) => !prev)}
                        title='Toggle Orientation'
                    >
                        ↻
                    </button>
                </div>

                {/* 오른쪽: 창 제어 버튼 */}
                <div className='window-controls'>
                    <button
                        className='control-button minimize-button'
                        onClick={() => WindowMinimise()}
                        title='Minimize'
                    >
                        _
                    </button>
                    <button
                        className='control-button maximize-button'
                        onClick={() => WindowToggleMaximise()}
                        title='Maximize/Restore'
                    >
                        ▢
                    </button>
                    <button
                        className='control-button close-button'
                        onClick={() => Quit()}
                        title='Close'
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div id='app-content-scrollable' style={contentAreaStyle}>
                {error && (
                    <div style={{ color: "red", paddingBottom: "10px" }}>
                        Error: {error}
                    </div>
                )}
                {!systemInfo && !error && (
                    <div>Loading system information...</div>
                )}

                {systemInfo && (
                    <>
                        <h1>PC System Monitor</h1>

                        {/* 설정 패널 */}
                        <ProgressBarSettingsPanel
                            config={barConfig}
                            setConfig={setBarConfig}
                        />

                        {/* CPU */}
                        <section
                            style={{
                                marginBottom: "20px",
                                borderBottom: "1px solid #eee",
                                paddingBottom: "10px",
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
                                percentage={systemInfo.cpu_usage_average}
                                vertical={verticalMode}
                                compact={barConfig.compactMode}
                                config={barConfig}
                                variant='main' // ✅ main bar로 설정
                            />

                            {/* 각 스레드별 ProgressBar */}
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    marginBottom: "18px", // ✅ 추가로 하단 간격 확보
                                    gap: "12px",
                                    justifyContent: "flex-start",
                                }}
                            >
                                {systemInfo.cpu_usage_per_thread?.map(
                                    (usage, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                flexBasis: verticalMode
                                                    ? "auto"
                                                    : "calc(33.33% - 8px)",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <ProgressBar
                                                label={`T${index}`}
                                                percentage={usage}
                                                vertical={verticalMode}
                                                compact={barConfig.compactMode} // ✅ 수정 포인트
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
                                marginBottom: "20px",
                                borderBottom: "1px solid #eee",
                                paddingBottom: "10px",
                            }}
                        >
                            <h2>Memory (RAM)</h2>
                            <p>
                                <strong>Usage:</strong>{" "}
                                {systemInfo.memory_usage_percent?.toFixed(2)}%
                            </p>
                            <p>
                                <strong>Capacity:</strong>{" "}
                                {systemInfo.memory_used_gb?.toFixed(2)} GB Used
                                / {systemInfo.memory_total_gb?.toFixed(2)} GB
                                Total
                            </p>

                            <ProgressBar
                                label='Memory Usage'
                                percentage={systemInfo.memory_usage_percent}
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
                                {systemInfo.disk_used_gb?.toFixed(2)} GB Used /{" "}
                                {systemInfo.disk_total_gb?.toFixed(2)} GB Total
                            </p>

                            <ProgressBar
                                label='Disk Usage'
                                percentage={systemInfo.disk_usage_percent}
                                vertical={verticalMode}
                                compact={barConfig.compactMode}
                                config={barConfig}
                            />
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
