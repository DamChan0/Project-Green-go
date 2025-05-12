import React from "react";
import { ProgressBarConfig } from "../config/progressConfig";

type ProgressBarVariant = "main" | "thread";

interface ProgressBarProps {
    label: string;
    percentage: number;
    vertical?: boolean;
    compact?: boolean;
    config: ProgressBarConfig;
    variant?: ProgressBarVariant;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    label,
    percentage,
    vertical = false,
    compact,
    config,
    variant = "thread",
}) => {
    const isCompact = compact ?? config.compactMode;

    const getColor = (value: number): string => {
        if (config.colorMode === "single") return config.barColor;
        if (value < 50) return "#0bc568";
        if (value < 80) return "#f5a623";
        return "#e74c3c";
    };

    const color = getColor(percentage);

    // ✅ main 요약 바 스타일
    const mainBarStyle: React.CSSProperties = {
        width: "100%",
        height: "24px",
        backgroundColor: "#444",
        borderRadius: "10px",
        overflow: "hidden",
        position: "relative",
        marginBottom: "1em",
        color: "#eee",
        fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    // ✅ 상세(thread) 막대 wrapper
    const wrapperStyle: React.CSSProperties = vertical
        ? {
              height: isCompact ? "60px" : "100px",
              width: isCompact ? "20px" : "20px",
              backgroundColor: "#444",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column-reverse",
              margin: "auto",
          }
        : {
              width: "100%",
              height: isCompact ? "3px" : "14px",
              backgroundColor: "#444",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "6px",
          };

    const barStyle: React.CSSProperties = vertical
        ? {
              width: "100%",
              height: `${percentage}%`,
              backgroundColor: color,
              borderRadius: "10px 10px 0 0",
              transition: config.animated ? "height 0.5s ease-in-out" : "none",
          }
        : {
              height: "100%",
              width: `${percentage}%`,
              backgroundColor: color,
              transition: config.animated ? "width 0.5s ease-in-out" : "none",
          };

    const labelStyle: React.CSSProperties = {
        marginBottom: "4px",
        textAlign: "center",
        fontSize: isCompact ? "0.8rem" : "clamp(1.11rem, 1.5vw, 1rem)",
    };

    // ✅ 요약용 bar (main)
    if (variant === "main") {
        return (
            <div style={mainBarStyle}>
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: `${percentage}%`,
                        height: "100%",
                        backgroundColor: color,
                        borderRadius: "10px",
                        transition: config.animated
                            ? "width 0.5s ease-in-out"
                            : "none",
                        zIndex: 0,
                    }}
                />
                <span
                    style={{
                        position: "relative",
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                >
                    {label} - {percentage.toFixed(1)}%
                </span>
            </div>
        );
    }

    // ✅ 상세 바 (스레드, 메모리 등)
    return (
        <div
            style={{
                marginBottom: isCompact ? "0.5em" : "1em",
                alignItems: "center",
                width: "100%",
            }}
        >
            <div style={labelStyle}>
                {label} - {percentage.toFixed(1)}%
            </div>
            <div style={wrapperStyle}>
                <div style={barStyle} />
            </div>
        </div>
    );
};

export default ProgressBar;
