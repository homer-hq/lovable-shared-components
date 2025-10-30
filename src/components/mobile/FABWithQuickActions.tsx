import React, { useState } from 'react';
import { FAB } from './FAB';
import { QuickActionSlider } from './QuickActionSlider';

interface FABWithQuickActionsProps {
  actionIds: string[];
  layout: 'grid' | 'list';
  visible?: boolean;
  showCustomizeButton?: boolean;
  showAllActionsButton?: boolean;
  onCustomizeClick?: () => void;
  onAllActionsClick?: () => void;
}

export const FABWithQuickActions: React.FC<FABWithQuickActionsProps> = ({
  actionIds,
  layout,
  visible = true,
  showCustomizeButton = false,
  showAllActionsButton = false,
  onCustomizeClick,
  onAllActionsClick,
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  if (!visible) return null;

  return (
    <>
      <FAB onClick={() => setShowQuickActions(!showQuickActions)} visible={visible} />
      
      <QuickActionSlider
        visible={showQuickActions && (actionIds.length > 0 || showAllActionsButton || showCustomizeButton)}
        onClose={() => setShowQuickActions(false)}
        actionIds={actionIds}
        layout={layout}
        showCustomizeButton={showCustomizeButton}
        showAllActionsButton={showAllActionsButton}
        onCustomizeClick={onCustomizeClick}
        onAllActionsClick={onAllActionsClick}
      />
    </>
  );
};
