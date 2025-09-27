import React from 'react';
import Link from 'next/link';
import { IEvent } from '@/types';
import { formatDate } from '@/utils/dateFormat';

interface EventCardProps {
  event: IEvent;
  onDelete?: (eventId: string) => void;
  showDeleteButton?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onDelete, showDeleteButton = false }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(event._id);
    }
  };

  return (
    <div className="bg-white dark:bg-darkcard rounded-2xl shadow-xl overflow-hidden flex flex-col hover:scale-105 transition-transform">
      <img 
        src={`${event.image}`} 
        alt={event.title} 
        className="h-36 w-full object-cover" 
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1 text-gray-800 dark:text-darktext">
            {event.title}
          </h3>
          <div className="text-xs text-gray-400 mb-2">
            {formatDate(event.date)}
          </div>
          <div className="text-sm text-gray-500 mb-1">{event.host}</div>
          <div className="text-xs text-gray-400 mb-2">{event.location}</div>
          <div className="text-sm text-primary font-semibold">
            {event.price === 0 ? 'Free' : `₹${event.price}`}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Link href={`/event/${event._id}`}>
            <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition">
              Book Ticket
            </button>
          </Link>
          {showDeleteButton && (
            <button
              onClick={handleDelete}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Delete Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;