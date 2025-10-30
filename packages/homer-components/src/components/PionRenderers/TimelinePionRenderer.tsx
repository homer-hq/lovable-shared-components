import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { TimelinePion } from "@/lib/homer-api";

interface TimelinePionRendererProps {
  pion: TimelinePion;
}

export function TimelinePionRenderer({ pion }: TimelinePionRendererProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch {
      return "";
    }
  };

  const isDateRange = pion.endDate && pion.endDate !== pion.startDate;

  return (
    <Card className="timeline-pion border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            {pion.eventType && (
              <Badge variant="outline" className="mb-2">
                {pion.eventType}
              </Badge>
            )}
            <CardTitle className="text-xl">
              {pion.eventTitle || pion.title || "Untitled Event"}
            </CardTitle>
          </div>
          {!pion.read && (
            <Badge variant="secondary" className="ml-2">New</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Date and Time Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {formatDate(pion.startDate)}
              {isDateRange && (
                <>
                  <span className="mx-2">→</span>
                  {formatDate(pion.endDate!)}
                </>
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(pion.startDate)}</span>
          </div>
        </div>

        {/* Description */}
        {pion.timelineDescription && (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {pion.timelineDescription}
            </p>
          </div>
        )}

        {/* Additional Payload Data */}
        {pion.payload && Object.keys(pion.payload).length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Additional Details</p>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(pion.payload, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}