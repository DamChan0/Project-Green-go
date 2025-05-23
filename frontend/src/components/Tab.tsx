import React from "react";

interface TabProps {
    tabs: {
        id: string;
        label: string;
        content: React.ReactNode;
    }[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const Tab: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className='tab-container'>
            {/* 탭 헤더 */}
            <div className='tab-headers'>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-header ${
                            activeTab === tab.id ? "active" : ""
                        }`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 탭 컨텐츠 */}
            <div className='tab-content'>
                {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
        </div>
    );
};

export default Tab;
