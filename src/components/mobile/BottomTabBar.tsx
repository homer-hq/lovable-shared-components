import React from 'react';
import { Button } from '@/components/ui/button';

interface Tab {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
}

interface BottomTabBarProps {
  tabs: Tab[];
  activeTab?: string;
  onTabClick?: (tabId: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs,
  activeTab = 'start',
  onTabClick,
}) => {
  const visibleTabs = tabs.filter((tab) => tab.visible);

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border h-[72px] z-40">
      <div className="flex justify-around items-center h-full max-w-[393px] mx-auto px-2">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabClick?.(tab.id)}
              className="flex flex-col items-center justify-center gap-1 h-full flex-1 rounded-none hover:bg-transparent"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <img
                  src={tab.icon}
                  alt={tab.label}
                  className="w-full h-full object-contain"
                  style={{
                    filter: isActive ? 'none' : 'grayscale(100%) opacity(0.6)',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/default.png';
                  }}
                />
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
