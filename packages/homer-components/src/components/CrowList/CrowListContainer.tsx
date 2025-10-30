import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { SortableCrowTaskItem } from "./SortableCrowTaskItem";
import { CreateCrowItemDialog } from "./CreateCrowItemDialog";
import type { CrowList, CrowTask } from "@/lib/homer-api";
import { homerAPI } from "@/lib/homer-api";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface CrowListContainerProps {
  list: CrowList;
  tasks: CrowTask[];
  homeId: string;
  onTasksChange?: (opts?: { silent?: boolean }) => void;
}

export const CrowListContainer = ({ list, tasks, homeId, onTasksChange }: CrowListContainerProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localTasks, setLocalTasks] = useState<CrowTask[]>(tasks);
  const { toast } = useToast();

  // Sync local tasks with prop changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const validTasks = localTasks.filter(t => t.title && t.title.trim() !== '');
  const emptyTasksCount = localTasks.length - validTasks.length;
  const completedCount = validTasks.filter(t => t.done).length;
  const totalCount = validTasks.length;

  const handleDeleteCompleted = async () => {
    if (!window.confirm('Delete all completed tasks?')) return;
    
    setIsDeleting(true);
    try {
      await homerAPI.deleteCrowListCrows(list.id, homeId, 'completed');
      toast({
        title: "Success",
        description: "Completed tasks deleted",
      });
      onTasksChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete completed tasks",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localTasks.findIndex(t => t.id === active.id);
    const newIndex = localTasks.findIndex(t => t.id === over.id);
    const reorderedTasks = arrayMove(localTasks, oldIndex, newIndex);

    // Optimistic update
    setLocalTasks(reorderedTasks);

    try {
      const movedTask = reorderedTasks[newIndex];
      const prevTask = newIndex > 0 ? reorderedTasks[newIndex - 1].id : null;

      await homerAPI.updateCrow(movedTask.id, { prev_task: prevTask, crow_list_id: list.id }, homeId);
      onTasksChange?.({ silent: true });
    } catch (error: any) {
      // Revert on error
      setLocalTasks(tasks);
      toast({
        title: "Error",
        description: error?.message || "Failed to reorder tasks",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmptyTasks = async () => {
    if (!window.confirm('Delete all tasks without titles?')) return;
    
    setIsDeleting(true);
    try {
      const emptyTasks = localTasks.filter(t => !t.title || t.title.trim() === '');
      for (const task of emptyTasks) {
        await homerAPI.deletePion(task.id);
      }
      toast({
        title: "Success",
        description: `Deleted ${emptyTasks.length} empty task${emptyTasks.length > 1 ? 's' : ''}`,
      });
      onTasksChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete empty tasks",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{list.title || 'Tasks'}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{totalCount} total</Badge>
                <Badge variant={completedCount > 0 ? "default" : "secondary"}>
                  {completedCount} completed
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteCompleted}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Completed
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={validTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {validTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No tasks yet. Click "Add Task" to create one.
                  </p>
                ) : (
                  validTasks.map((task) => (
                    <SortableCrowTaskItem
                      key={task.id}
                      task={task}
                      homeId={homeId}
                      listId={list.id}
                      onUpdate={onTasksChange}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <CreateCrowItemDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        listId={list.id}
        homeId={homeId}
        onSuccess={onTasksChange}
      />
    </>
  );
};
