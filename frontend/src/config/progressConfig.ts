// src/config/progressConfig.ts

export type ColorMode = "single" | "multi";

export interface ProgressBarConfig {
    compactMode: boolean;
    animated: boolean;
    colorMode: ColorMode;
    barColor: string;
    compact?: boolean; // Added compact prop
    overrideCompact?: boolean; // Added overrideCompact prop
}

const progressBarConfig: ProgressBarConfig = {
    compactMode: true,
    animated: true,
    colorMode: "multi", // 'single' 또는 'multi'
    barColor: "#0bc568", // colorMode가 'single'일 때 적용될 색
    compact: true,
    overrideCompact: false,
};

export default progressBarConfig;
