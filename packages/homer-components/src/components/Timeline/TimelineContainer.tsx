import { TimelinePion } from "@/lib/homer-api";
import { TimelineEvent } from "./TimelineEvent";
import { format, parseISO } from "date-fns";

interface TimelineContainerProps {
  events: TimelinePion[];
  onCardClick: (cardId: string) => void;
}

export function TimelineContainer({ events, onCardClick }: TimelineContainerProps) {
  // Group events by year and month
  const groupedEvents = events.reduce((acc, event) => {
    try {
      const date = parseISO(event.startDate);
      const yearMonth = format(date, "MMMM yyyy");
      
      if (!acc[yearMonth]) {
        acc[yearMonth] = [];
      }
      acc[yearMonth].push(event);
    } catch {
      // If date parsing fails, put in "Unknown" group
      if (!acc["Unknown"]) {
        acc["Unknown"] = [];
      }
      acc["Unknown"].push(event);
    }
    
    return acc;
  }, {} as Record<string, TimelinePion[]>);

  const periods = Object.keys(groupedEvents);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-lg">No timeline events found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Timeline events will appear here when created
        </p>
      </div>
    );
  }

  return (
    <div className="timeline-container relative">
      {/* Vertical Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
      
      <div className="space-y-8">
        {periods.map((period) => (
          <div key={period} className="timeline-period">
            {/* Period Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="timeline-period-marker hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-sm z-10 flex-shrink-0">
                {period.split(" ")[0].slice(0, 3)}
              </div>
              <h2 className="text-2xl font-bold text-foreground md:ml-0 ml-0">
                {period}
              </h2>
            </div>
            
            {/* Events in this period */}
            <div className="space-y-4 md:ml-24 ml-0">
              {groupedEvents[period].map((event, index) => (
                <div
                  key={event.id}
                  className="relative"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Connection dot (desktop only) */}
                  <div className="absolute -left-[4.5rem] top-6 w-3 h-3 rounded-full bg-primary border-4 border-background hidden md:block" />
                  
                  <TimelineEvent event={event} onClick={onCardClick} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}