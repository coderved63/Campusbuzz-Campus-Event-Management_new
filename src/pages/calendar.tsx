import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import axios from 'axios';
import { IEvent } from '@/types';

interface CalendarEvent extends IEvent {
  eventDate: string;
}

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from the server
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        // Ensure dates are properly formatted
        const formattedEvents = response.data.events.map((event: IEvent) => ({
          ...event,
          eventDate: event.date // Using the correct field name from your event data
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Create an array of empty cells to align days correctly
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, index) => (
    <div key={`empty-${index}`} className="p-2 bg-white dark:bg-darkcard border border-gray-200 dark:border-gray-700"></div>
  ));

  const previousMonth = () => setCurrentMonth((prevMonth) => addMonths(prevMonth, -1));
  const nextMonth = () => setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-darkcard rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={previousMonth}
                className="p-2 rounded-full hover:bg-primary-dark transition-colors duration-200 text-white"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              
              <button
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-primary-dark transition-colors duration-200 text-white"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0">
              {emptyCells.concat(
                daysInMonth.map((date) => (
                  <div
                    key={date.toISOString()}
                    className="min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkcard hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {/* Date number */}
                    <div className="font-bold text-gray-900 dark:text-white mb-2">
                      {format(date, 'dd')}
                    </div>

                    {/* Events for this date */}
                    <div className="space-y-1">
                      {events
                        .filter((event) => {
                          try {
                            return format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                          } catch (error) {
                            console.error('Error formatting date for event:', event);
                            return false;
                          }
                        })
                        .slice(0, 3) // Show max 3 events per day
                        .map((event) => (
                          <Link key={event._id} href={`/event/${event._id}`}>
                            <div className="text-xs bg-primary text-white rounded px-2 py-1 hover:bg-primary-dark transition-colors duration-200 cursor-pointer truncate">
                              {event.title}
                            </div>
                          </Link>
                        ))}
                      
                      {/* Show "+X more" if there are more than 3 events */}
                      {events.filter((event) => {
                        try {
                          return format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                        } catch (error) {
                          return false;
                        }
                      }).length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          +{events.filter((event) => {
                            try {
                              return format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                            } catch (error) {
                              return false;
                            }
                          }).length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Today's events summary */}
        <div className="mt-8 bg-white dark:bg-darkcard rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Today's Events ({format(new Date(), 'MMMM dd, yyyy')})
          </h3>
          
          <div className="space-y-3">
            {events
              .filter((event) => {
                try {
                  return format(new Date(event.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                } catch (error) {
                  return false;
                }
              })
              .map((event) => (
                <Link key={event._id} href={`/event/${event._id}`}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.location} • {event.time}
                      </p>
                    </div>
                    <div className="text-sm text-primary font-medium">
                      ₹{event.price}
                    </div>
                  </div>
                </Link>
              ))}
            
            {events.filter((event) => {
              try {
                return format(new Date(event.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              } catch (error) {
                return false;
              }
            }).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No events scheduled for today
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;