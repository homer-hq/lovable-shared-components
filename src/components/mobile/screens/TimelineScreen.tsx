import React from 'react';
import { type AppliedEffectsState } from '@/utils/ruleEngine';
import timelineImage from '@/assets/screenshots/timeline.png';

interface TimelineScreenProps {
  appliedEffects: AppliedEffectsState;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({ appliedEffects }) => {
  return (
    <div className="w-full">
      <img 
        src={timelineImage} 
        alt="Timeline view" 
        className="w-full h-auto object-contain"
      />
    </div>
  );
};
