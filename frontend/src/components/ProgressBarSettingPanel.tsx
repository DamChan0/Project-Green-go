import React from "react";
import { ColorMode, ProgressBarConfig } from "../config/progressConfig";

interface SettingsPanelProps {
    config: ProgressBarConfig;
    setConfig: React.Dispatch<React.SetStateAction<ProgressBarConfig>>;
}

const ProgressBarSettingsPanel: React.FC<SettingsPanelProps> = ({
    config,
    setConfig,
}) => {
    return (
        <div
            style={{
                backgroundColor: "#222",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                color: "#eee",
                fontSize: "0.9rem",
            }}
        >
            <h3 style={{ marginTop: 0, color: "#0bc568" }}>ProgressBar 설정</h3>

            <label>
                <input
                    type='checkbox'
                    checked={config.compactMode}
                    onChange={(e) =>
                        setConfig((prev) => ({
                            ...prev,
                            compactMode: e.target.checked,
                        }))
                    }
                />
                &nbsp;Compact 모드
            </label>
            <br />

            <label>
                <input
                    type='checkbox'
                    checked={config.animated}
                    onChange={(e) =>
                        setConfig((prev) => ({
                            ...prev,
                            animated: e.target.checked,
                        }))
                    }
                />
                &nbsp;부드러운 애니메이션
            </label>
            <br />

            <label>
                색상 모드:&nbsp;
                <select
                    value={config.colorMode}
                    onChange={(e) =>
                        setConfig((prev) => ({
                            ...prev,
                            colorMode: e.target.value as ColorMode,
                        }))
                    }
                >
                    <option value='multi'>단계별</option>
                    <option value='single'>고정색</option>
                </select>
            </label>
            <br />

            {config.colorMode === "single" && (
                <label>
                    색상 선택:&nbsp;
                    <input
                        type='color'
                        value={config.barColor}
                        onChange={(e) =>
                            setConfig((prev) => ({
                                ...prev,
                                barColor: e.target.value,
                            }))
                        }
                    />
                </label>
            )}
        </div>
    );
};

export default ProgressBarSettingsPanel;
