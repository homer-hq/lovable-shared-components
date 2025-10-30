import { format } from 'date-fns';
import { homerAPI } from './homer-api';
import type { TimelinePion } from './homer-api';

// Timeline Event Categories (based on Homer API constants)
export const TIMELINE_CATEGORIES = {
  // Current categories
  UTILITIES: 'utilities',
  SERVICES: 'services',
  RENOVATION: 'renovation',
  INSURANCE: 'insurance',
  FINANCIALS: 'financials',
  WARRANTY: 'warranty',
  MAKLARHUSET: 'maklarhuset',
  OTHER: 'other',
  
  // Legacy categories (still supported)
  MOVED_IN: 'movedIn',
  HOME_CREATED: 'homeCreated',
  ITEM_PURCHASE: 'itemPurchase',
  CONSTRUCTION: 'constructionRenovation',
  SERVICE_REPARATION: 'serviceReparation',
  IMPORTANT_EVENT: 'importantEvent',
  REMINDER: 'reminder',
  DEFAULT: 'default',
} as const;

export type TimelineEventCategory = typeof TIMELINE_CATEGORIES[keyof typeof TIMELINE_CATEGORIES];

// Helper to format dates consistently
function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

// High-level Timeline API for programmatic access
export const timelineAPI = {
  /**
   * Create a timeline event (standalone or card-attached)
   * Can be called from anywhere in the app without UI
   */
  async createTimelineEvent(params: {
    homeId: string;
    eventTitle: string;
    eventDate: Date | string;
    description: string;
    eventType: TimelineEventCategory;
    endDate?: Date | string;
    cardId?: string;
  }): Promise<TimelinePion> {
    const startDate = formatDate(params.eventDate);
    const endDate = params.endDate ? formatDate(params.endDate) : undefined;

    const result = await homerAPI.createTimelinePion({
      homeId: params.homeId,
      cardId: params.cardId || null,
      title: 'Timeline Event',
      eventTitle: params.eventTitle,
      startDate,
      description: params.description,
      eventType: params.eventType,
      endDate,
    });
    
    return result as TimelinePion;
  },

  /**
   * Create a timeline event from a ticket
   * Used by the ticketing system to sync events to Homer
   */
  async createTimelineEventFromTicket(params: {
    homeId: string;
    cardId?: string;
    ticketTitle: string;
    ticketDescription: string;
    createdAt: Date | string;
    category?: string;
  }): Promise<TimelinePion> {
    const eventType = params.category || TIMELINE_CATEGORIES.SERVICE_REPARATION;
    
    const result = await homerAPI.createTimelinePion({
      homeId: params.homeId,
      cardId: params.cardId || null,
      title: 'Ticket Timeline Event',
      eventTitle: `Issue reported - ${params.ticketTitle}`,
      startDate: formatDate(params.createdAt),
      description: params.ticketDescription,
      eventType,
    });
    
    return result as TimelinePion;
  },

  /**
   * Batch create multiple timeline events
   * Returns success and error arrays
   */
  async createTimelineEvents(
    events: Array<{
      homeId: string;
      eventTitle: string;
      eventDate: Date | string;
      description: string;
      eventType: TimelineEventCategory;
      endDate?: Date | string;
      cardId?: string;
    }>
  ): Promise<{
    success: TimelinePion[];
    errors: Array<{ index: number; error: string; event: any }>;
  }> {
    const results = await Promise.allSettled(
      events.map(event => this.createTimelineEvent(event))
    );

    const success: TimelinePion[] = [];
    const errors: Array<{ index: number; error: string; event: any }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        errors.push({
          index,
          error: result.reason?.message || String(result.reason),
          event: events[index],
        });
      }
    });

    return { success, errors };
  },

  /**
   * Update an existing timeline event
   */
  async updateTimelineEvent(
    pionId: string,
    updates: {
      eventTitle?: string;
      eventDate?: Date | string;
      endDate?: Date | string;
      description?: string;
      eventType?: TimelineEventCategory;
    }
  ): Promise<TimelinePion> {
    const payload: any = {};

    if (updates.eventTitle) payload.eventTitle = updates.eventTitle;
    if (updates.eventDate) payload.startDate = formatDate(updates.eventDate);
    if (updates.endDate) payload.endDate = formatDate(updates.endDate);
    if (updates.description) payload.description = updates.description;
    if (updates.eventType) payload.eventType = updates.eventType;

    const result = await homerAPI.updateTimelinePion(pionId, payload);
    return result as TimelinePion;
  },
};
