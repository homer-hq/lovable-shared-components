import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homerAPI } from "@/lib/homer-api";
import { useToast } from "@/hooks/use-toast";

interface CreateCrowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeId: string;
  onSuccess: () => void;
}

export const CreateCrowListDialog = ({ open, onOpenChange, homeId, onSuccess }: CreateCrowListDialogProps) => {
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list title",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await homerAPI.createCrowList(homeId, 'tasksList', title);
      toast({
        title: "Success",
        description: "Task list created successfully",
      });
      setTitle("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task list",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task List</DialogTitle>
          <DialogDescription>
            Create a new task list for your home
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">List Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Home Renovation, Weekly Chores"
              disabled={isCreating}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create List"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
