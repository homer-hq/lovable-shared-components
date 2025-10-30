import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { TimelinePion } from "@/lib/homer-api";

interface TimelineEventProps {
  event: TimelinePion;
  onClick: (cardId: string) => void;
}

export function TimelineEvent({ event, onClick }: TimelineEventProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const isDateRange = event.endDate && event.endDate !== event.startDate;

  return (
    <Card 
      className={`timeline-event hover:shadow-lg transition-all ${event.card ? 'cursor-pointer' : 'cursor-default'} border-l-4 border-l-primary`}
      onClick={() => { if (event.card) onClick(event.card); }}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Event Type Badge */}
          {event.eventType && (
            <Badge variant="outline" className="mb-2">
              {event.eventType}
            </Badge>
          )}
          
          {/* Event Title */}
          <h3 className="font-semibold text-lg text-foreground">
            {event.eventTitle || event.title || "Untitled Event"}
          </h3>
          
          {/* Date Display */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(event.startDate)}
              {isDateRange && (
                <>
                  <span className="mx-1">→</span>
                  {formatDate(event.endDate!)}
                </>
              )}
            </span>
          </div>
          
          {/* Description */}
          {event.timelineDescription && (
            <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
              {event.timelineDescription}
            </p>
          )}
          
          {/* Unread Badge */}
          {!event.read && (
            <Badge variant="secondary" className="text-xs">
              New
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}