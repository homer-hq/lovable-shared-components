import React from 'react';
import { type AppliedEffectsState } from '@/utils/ruleEngine';
import expensesAllImage from '@/assets/screenshots/expenses/expenses-all.png';
import trackersImage from '@/assets/screenshots/expenses/expenses-trackers.png';

interface ExpensesScreenProps {
  appliedEffects: AppliedEffectsState;
  activeSubtab: 'expenses-all' | 'expenses-trackers';
  onSubtabChange: (subtab: 'expenses-all' | 'expenses-trackers') => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ 
  appliedEffects, 
  activeSubtab,
  onSubtabChange 
}) => {
  return (
    <div className="w-full relative">
      {/* Display current screenshot */}
      <img 
        src={activeSubtab === 'expenses-all' ? expensesAllImage : trackersImage}
        alt={activeSubtab === 'expenses-all' ? 'Expenses view' : 'Trackers view'}
        className="w-full h-auto object-contain"
      />
      
      {/* Clickable hotspots over the tabs in the screenshot */}
      <button
        onClick={() => onSubtabChange('expenses-trackers')}
        className="absolute top-[177px] left-4 w-[172px] h-10 cursor-pointer z-50 hover:bg-white/10"
        aria-label="Switch to Trackers tab"
      />
      <button
        onClick={() => onSubtabChange('expenses-all')}
        className="absolute top-[177px] right-4 w-[172px] h-10 cursor-pointer z-50 hover:bg-white/10"
        aria-label="Switch to Expenses tab"
      />
    </div>
  );
};
