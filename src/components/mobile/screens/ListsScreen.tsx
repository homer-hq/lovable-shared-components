import React from 'react';
import { type AppliedEffectsState } from '@/utils/ruleEngine';
import listsImage from '@/assets/screenshots/lists.png';

interface ListsScreenProps {
  appliedEffects: AppliedEffectsState;
}

export const ListsScreen: React.FC<ListsScreenProps> = ({ appliedEffects }) => {
  return (
    <div className="w-full">
      <img 
        src={listsImage} 
        alt="Lists view" 
        className="w-full h-auto object-contain"
      />
    </div>
  );
};
