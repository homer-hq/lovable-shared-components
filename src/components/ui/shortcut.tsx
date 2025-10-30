import React from 'react';
import { useActions } from '@/hooks/useActions';

interface ShortcutProps {
  actionId: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Shortcut: React.FC<ShortcutProps> = ({ actionId, className, onClick, style }) => {
  const { getActionById } = useActions();
  const actionData = getActionById(actionId);

  if (!actionData) {
    return null;
  }

  return (
    <div
      className={`bg-card border border-border rounded-none p-3 sm:p-6 flex flex-col items-center justify-center h-[70px] sm:h-[80px] cursor-pointer hover:bg-accent/50 transition-colors ${className || ''}`}
      onClick={onClick}
      style={style}
    >
      <div className="w-6 h-6 sm:w-8 sm:h-8 mb-0.5 sm:mb-1 flex items-center justify-center">
        <img
          src={actionData.icon}
          alt={actionData.title}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/default.png';
          }}
        />
      </div>
      <span className="text-xs sm:text-sm font-medium text-foreground text-center leading-tight">
        {actionData.shortName || actionData.title}
      </span>
    </div>
  );
};