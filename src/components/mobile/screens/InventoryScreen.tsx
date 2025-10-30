import React from 'react';
import { type AppliedEffectsState } from '@/utils/ruleEngine';
import listView from '@/assets/screenshots/inventory/list.png';
import microcardsView from '@/assets/screenshots/inventory/microcards.png';
import gridView from '@/assets/screenshots/inventory/grid.png';
import largeView from '@/assets/screenshots/inventory/large.png';
import tableView from '@/assets/screenshots/inventory/table.png';

interface InventoryScreenProps {
  appliedEffects: AppliedEffectsState;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ appliedEffects }) => {
  const displayType = appliedEffects.inventory?.displayType || 'list';
  
  const screenshots = {
    list: listView,
    microcards: microcardsView,
    grid: gridView,
    large: largeView,
    table: tableView,
  };
  
  return (
    <div className="w-full">
      <img 
        src={screenshots[displayType]} 
        alt={`Inventory ${displayType} view`}
        className="w-full h-auto object-contain"
      />
    </div>
  );
};
