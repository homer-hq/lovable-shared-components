import React from 'react';
import { X, Pencil, Sparkles, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShortcutsGrid } from '@/components/ui/shortcuts-grid';
import { Shortcut } from '@/components/ui/shortcut';

interface QuickActionSliderProps {
  visible: boolean;
  onClose: () => void;
  actionIds: string[];
  layout: 'grid' | 'list';
  showCustomizeButton?: boolean;
  showAllActionsButton?: boolean;
  onCustomizeClick?: () => void;
  onAllActionsClick?: () => void;
}

export const QuickActionSlider: React.FC<QuickActionSliderProps> = ({
  visible,
  onClose,
  actionIds,
  layout,
  showCustomizeButton = false,
  showAllActionsButton = false,
  onCustomizeClick,
  onAllActionsClick,
}) => {
  if (!visible) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer sliding from bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-[hsl(var(--slider-background))] rounded-t-3xl shadow-2xl z-50 max-h-[70vh] flex flex-col transition-transform duration-300 overflow-hidden ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* iOS-style handle bar at top */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Top centered icon */}
        <div className="flex justify-center pt-2 pb-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Header bar with title and buttons */}
        <div className="relative flex items-center justify-center px-4 py-2">
          {/* Left side - Customize button (conditionally visible) */}
          {showCustomizeButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCustomizeClick}
              className="absolute left-4 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Pencil className="h-4 w-4 text-gray-700" />
            </Button>
          )}
          
          {/* Center - Title */}
          <h3 className="text-base font-semibold text-foreground">Quick actions</h3>
          
          {/* Right side - Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <X className="h-4 w-4 text-gray-700" />
          </Button>
        </div>

        {/* Content area - scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {layout === 'grid' ? (
            <ShortcutsGrid actionIds={actionIds} />
          ) : (
            <div className="space-y-2 max-w-[393px] mx-auto">
              {actionIds.map((actionId) => (
                <Shortcut
                  key={actionId}
                  actionId={actionId}
                  className="w-full h-16"
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with "All actions" button */}
        {showAllActionsButton && (
          <div className="px-6 py-4">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold rounded-xl flex items-center justify-center gap-2"
              onClick={onAllActionsClick}
            >
              <LayoutGrid className="h-5 w-5" />
              All actions
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
