import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { timelineAPI, TIMELINE_CATEGORIES, type TimelineEventCategory } from "@/lib/timeline-api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

// Event categories grouped by current vs legacy
const EVENT_CATEGORIES: Array<{
  value: TimelineEventCategory;
  labelKey: string;
  group: 'current' | 'legacy';
}> = [
  // Current categories (preferred)
  { value: TIMELINE_CATEGORIES.UTILITIES, labelKey: 'utilities', group: 'current' },
  { value: TIMELINE_CATEGORIES.SERVICES, labelKey: 'services', group: 'current' },
  { value: TIMELINE_CATEGORIES.RENOVATION, labelKey: 'renovation', group: 'current' },
  { value: TIMELINE_CATEGORIES.INSURANCE, labelKey: 'insurance', group: 'current' },
  { value: TIMELINE_CATEGORIES.FINANCIALS, labelKey: 'financials', group: 'current' },
  { value: TIMELINE_CATEGORIES.WARRANTY, labelKey: 'warranty', group: 'current' },
  { value: TIMELINE_CATEGORIES.MAKLARHUSET, labelKey: 'maklarhuset', group: 'current' },
  { value: TIMELINE_CATEGORIES.OTHER, labelKey: 'other', group: 'current' },
  
  // Legacy categories (still supported)
  { value: TIMELINE_CATEGORIES.MOVED_IN, labelKey: 'movedIn', group: 'legacy' },
  { value: TIMELINE_CATEGORIES.HOME_CREATED, labelKey: 'homeCreated', group: 'legacy' },
  { value: TIMELINE_CATEGORIES.ITEM_PURCHASE, labelKey: 'itemPurchase', group: 'legacy' },
  { value: TIMELINE_CATEGORIES.CONSTRUCTION, labelKey: 'construction', group: 'legacy' },
  { value: TIMELINE_CATEGORIES.SERVICE_REPARATION, labelKey: 'serviceReparation', group: 'legacy' },
  { value: TIMELINE_CATEGORIES.IMPORTANT_EVENT, labelKey: 'importantEvent', group: 'legacy' },
  { value: TIMELINE_CATEGORIES.REMINDER, labelKey: 'reminder', group: 'legacy' },
  { value: TIMELINE_CATEGORIES.DEFAULT, labelKey: 'default', group: 'legacy' },
];

const formSchema = z.object({
  eventDate: z.date({
    required_error: "Event date is required",
  }),
  eventTitle: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  eventDescription: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters")
    .trim(),
  eventType: z.string()
    .min(1, "Category is required"),
  endDate: z.date().optional(),
}).refine(data => {
  if (data.endDate && data.eventDate) {
    return data.endDate >= data.eventDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTimelineEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeId: string;
  onEventCreated: () => void;
}

export function CreateTimelineEventDialog({
  open,
  onOpenChange,
  homeId,
  onEventCreated,
}: CreateTimelineEventDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventTitle: "",
      eventDescription: "",
      eventType: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await timelineAPI.createTimelineEvent({
        homeId,
        eventTitle: values.eventTitle,
        eventDate: values.eventDate,
        description: values.eventDescription,
        eventType: values.eventType as TimelineEventCategory,
        endDate: values.endDate,
      });

      toast({
        title: t('timeline.createSuccess'),
        description: t('timeline.eventCreatedDescription'),
      });

      form.reset();
      onEventCreated();
    } catch (error) {
      console.error('Failed to create timeline event:', error);
      toast({
        title: t('timeline.createError'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories = EVENT_CATEGORIES.filter(c => c.group === 'current');
  const legacyCategories = EVENT_CATEGORIES.filter(c => c.group === 'legacy');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('timeline.createEvent')}</DialogTitle>
          <DialogDescription>
            {t('timeline.createEventDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Title */}
            <FormField
              control={form.control}
              name="eventTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('timeline.eventTitle')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('timeline.eventTitlePlaceholder')}
                      {...field}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/100 {t('common.characters')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Date */}
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('timeline.eventDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t('timeline.selectDate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Category */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('timeline.eventType')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={t('timeline.selectCategory')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background z-[100]">
                      <SelectGroup>
                        <SelectLabel>{t('timeline.currentCategories')}</SelectLabel>
                        {currentCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {t(`timeline.categories.${category.labelKey}`)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>{t('timeline.legacyCategories')}</SelectLabel>
                        {legacyCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {t(`timeline.categories.${category.labelKey}`)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Description */}
            <FormField
              control={form.control}
              name="eventDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('timeline.eventDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('timeline.eventDescriptionPlaceholder')}
                      className="min-h-[100px] resize-none"
                      {...field}
                      maxLength={500}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/500 {t('common.characters')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date (Optional) */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('timeline.endDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t('timeline.selectEndDate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          form.watch('eventDate') ? date < form.watch('eventDate') : false
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {t('timeline.endDateDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>{t('common.creating')}</>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('timeline.createEvent')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
