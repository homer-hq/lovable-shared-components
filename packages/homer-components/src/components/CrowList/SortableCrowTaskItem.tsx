import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { CrowTaskItem } from './CrowTaskItem';
import type { CrowTask } from '@/lib/homer-api';

interface SortableCrowTaskItemProps {
  task: CrowTask;
  homeId: string;
  listId: string;
  onUpdate: () => void;
}

export const SortableCrowTaskItem = ({ task, homeId, listId, onUpdate }: SortableCrowTaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <CrowTaskItem task={task} homeId={homeId} listId={listId} onUpdate={onUpdate} />
      </div>
    </div>
  );
};
