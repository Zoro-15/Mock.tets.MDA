import React from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface ToggleTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
}

export default function ToggleTabs({ tabs, activeTabId, onChange }: ToggleTabsProps) {
  return (
    <div className="flex border-b border-[#334155] mb-6">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`py-3 px-6 text-sm font-medium transition-all relative outline-none cursor-pointer flex items-center gap-2 ${
              isActive 
                ? 'text-[#3B82F6]' 
                : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive 
                  ? 'bg-[#3B82F6]/20 text-[#3B82F6]' 
                  : 'bg-[#1E293B] text-[#CBD5E1]'
              }`}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3B82F6] rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
