import { CheckCircle2, Circle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CrowTask } from "@/lib/homer-api";
import { format } from "date-fns";

interface CrowTaskPionRendererProps {
  task: CrowTask;
  detailed?: boolean;
}

export const CrowTaskPionRenderer = ({ task, detailed = false }: CrowTaskPionRendererProps) => {
  if (!detailed) {
    return (
      <div className="flex items-start gap-3">
        {task.done ? (
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${task.done ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </p>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM dd, yyyy')}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        {task.done ? (
          <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h3 className={`text-xl font-semibold ${task.done ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-muted-foreground mt-2">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={task.done ? "default" : "secondary"}>
          {task.done ? "Completed" : "Pending"}
        </Badge>
        {task.dueDate && (
          <Badge variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </Badge>
        )}
        {task.cards && task.cards.length > 0 && (
          <Badge variant="outline">
            {task.cards.length} linked card{task.cards.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {task.cards && task.cards.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Linked Cards</h4>
          <div className="space-y-1">
            {task.cards.map((card) => (
              <div key={card.id} className="text-sm p-2 border rounded bg-muted/50">
                {card.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
