import React from 'react';
import { ShortcutsGrid } from '@/components/ui/shortcuts-grid';
import ActionPlate from '@/components/ui/action-plate';
import { type AppliedEffectsState } from '@/utils/ruleEngine';

interface StartScreenProps {
  appliedEffects: AppliedEffectsState;
}

export const StartScreen: React.FC<StartScreenProps> = ({ appliedEffects }) => {
  return (
    <>
      {/* Shortcuts grid */}
      {appliedEffects.shortcuts.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <ShortcutsGrid actionIds={appliedEffects.shortcuts} />
        </div>
      )}

      {/* Start plates */}
      {appliedEffects.startPlates.length > 0 && (
        <div className="px-4 pb-20 space-y-3">
          {appliedEffects.startPlates.map((actionId) => (
            <ActionPlate
              key={actionId}
              actionId={actionId}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {appliedEffects.shortcuts.length === 0 &&
        appliedEffects.startPlates.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center">
            <p className="text-sm">
              No content to display. Add rules with shortcuts or start plates to see them here.
            </p>
          </div>
        )}
    </>
  );
};
