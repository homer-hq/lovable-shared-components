import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { CrowTask } from "@/lib/homer-api";
import { homerAPI } from "@/lib/homer-api";
import { useToast } from "@/hooks/use-toast";
import { format, isPast, isToday } from "date-fns";

interface CrowTaskItemProps {
  task: CrowTask;
  homeId: string;
  listId: string;
  onUpdate: () => void;
}

export const CrowTaskItem = ({ task, homeId, listId, onUpdate }: CrowTaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await homerAPI.updateCrow(task.id, { done: !task.done }, homeId);
      onUpdate();
    } catch (error: any) {
      console.error('CrowTask toggle error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update task',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const getDueDateBadge = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const overdue = isPast(dueDate) && !isToday(dueDate);
    const today = isToday(dueDate);
    
    return (
      <Badge 
        variant={overdue ? "destructive" : today ? "default" : "outline"}
        className="text-xs"
      >
        <Calendar className="h-3 w-3 mr-1" />
        {format(dueDate, 'MMM dd')}
      </Badge>
    );
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <Checkbox
        checked={task.done}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${task.done ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {task.description}
          </p>
        )}
        <div className="flex gap-2 mt-2">
          {getDueDateBadge()}
          {task.cards && task.cards.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {task.cards.length} card{task.cards.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
