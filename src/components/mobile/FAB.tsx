import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FABProps {
  onClick: () => void;
  visible?: boolean;
}

export const FAB: React.FC<FABProps> = ({ onClick, visible = true }) => {
  if (!visible) return null;

  return (
    <Button
      size="icon"
      className="absolute bottom-24 right-6 w-14 h-14 rounded-full shadow-lg z-30 bg-blue-600 hover:bg-blue-700 text-white border-0 [&_svg]:!w-[34px] [&_svg]:!h-[34px]"
      onClick={onClick}
    >
      <Plus strokeWidth={2.5} />
    </Button>
  );
};
