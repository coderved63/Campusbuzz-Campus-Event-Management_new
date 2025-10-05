import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@/contexts/UserContext';
import { formatDateFull } from '@/utils/dateFormat';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon,
  ShareIcon,
  TicketIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { IEvent } from '@/types';

const EventPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const [checkingTicket, setCheckingTicket] = useState(false);

  // Check if user has existing ticket
  useEffect(() => {
    if (!user || !id) return;
    
    const checkExistingTicket = async () => {
      setCheckingTicket(true);
      try {
        const response = await axios.get(`/api/tickets?userId=${user._id}`);
        if (response.data.success && response.data.data) {
          // Check if user has a ticket for this specific event
          const hasEventTicket = response.data.data.some((ticket: any) => ticket.eventid === id);
          setHasTicket(hasEventTicket);
        }
      } catch (error) {
        console.log('No existing ticket found');
      } finally {
        setCheckingTicket(false);
      }
    };

    checkExistingTicket();
  }, [user, id]);

  // Fetch event data
  useEffect(() => {
    if (!id) return;
    
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${id}`);
        setEvent(response.data.event);
        // Check if the current user is the owner or admin
        setIsOwner(Boolean(user && (user.isAdmin || response.data.event.owner === user._id)));
      } catch (error: any) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  // Book ticket functionality
  const handleBookTicket = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      console.log('Booking ticket for user:', user.name, user.email);
      console.log('Event ID:', id);
      
      const response = await axios.post('/api/book-ticket', {
        eventId: id,
        name: user.name,
        email: user.email
      });
      
      console.log('Booking response:', response.data);
      
      if (response.data.success) {
        alert('Ticket booked successfully!');
        setHasTicket(true); // Update state to show user now has ticket
        router.push('/wallet');
      } else {
        setBookingError(response.data.error || 'Failed to book ticket');
      }
    } catch (error: any) {
      console.error('Error booking ticket:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.error) {
        setBookingError(error.response.data.error);
      } else if (error.response?.status === 401) {
        setBookingError('Please log in to book tickets');
        router.push('/login');
      } else {
        setBookingError('Failed to book ticket. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Share functionalities
  const handleCopyLink = () => {
    const linkToShare = window.location.href;
    navigator.clipboard.writeText(linkToShare).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleWhatsAppShare = () => {
    const linkToShare = window.location.href;
    const whatsappMessage = encodeURIComponent(`Check out this event: ${event?.title} - ${linkToShare}`);
    window.open(`https://wa.me/?text=${whatsappMessage}`);
  };

  const handleFacebookShare = () => {
    const linkToShare = window.location.href;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkToShare)}`;
    window.open(facebookShareUrl, '_blank');
  };

  // Delete event function
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${id}`);
        router.push('/');
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Failed to delete event');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/">
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
              Go Back Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <Link href="/">
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
              Go Back Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-darkcard rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="relative">
            {event.image && (
              <div className="h-64 md:h-96 bg-gray-200 dark:bg-gray-700">
                <img 
                  src={event.image.startsWith('http') ? event.image : `/uploads/${event.image}`}
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {isOwner && (
              <button
                onClick={handleDelete}
                className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6 md:p-8">
            {/* Title and Category */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                  {event.category}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="p-2 text-gray-500 hover:text-primary transition-colors duration-200"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {event.title}
              </h1>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {error}
              </div>
            )}
            
            {bookingError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {bookingError}
              </div>
            )}

            {/* Event Details Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Date & Time */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Date & Time</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {formatDateFull(event.date)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {event.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Location</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Host */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <UserIcon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Hosted by</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {event.host}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Price</h3>
                <p className="text-3xl font-bold text-primary">
                  {event.price === 0 ? 'Free' : `₹${event.price}`}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this event</h2>
              <div className="prose max-w-none text-gray-600 dark:text-gray-400">
                <p className="whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Book Ticket Button */}
            <div className="text-center mb-8">
              {checkingTicket ? (
                <div className="inline-flex items-center px-8 py-4 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-transparent mr-3"></div>
                  Checking ticket status...
                </div>
              ) : hasTicket ? (
                <div className="inline-flex flex-col items-center">
                  <div className="inline-flex items-center px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg mb-3">
                    <TicketIcon className="w-5 h-5 mr-3" />
                    Ticket Already Booked
                  </div>
                  <Link href="/wallet">
                    <button className="text-primary hover:text-primary-dark underline">
                      View Your Tickets
                    </button>
                  </Link>
                </div>
              ) : user ? (
                <button
                  onClick={handleBookTicket}
                  disabled={bookingLoading}
                  className="inline-flex items-center px-8 py-4 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  ) : (
                    <TicketIcon className="w-5 h-5 mr-3" />
                  )}
                  {bookingLoading ? 'Booking...' : 'Book Ticket'}
                </button>
              ) : (
                <Link href="/login">
                  <button className="inline-flex items-center px-8 py-4 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200">
                    <TicketIcon className="w-5 h-5 mr-3" />
                    Login to Book Ticket
                  </button>
                </Link>
              )}
            </div>

            {/* Share Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Share with friends
              </h3>
              <div className="flex justify-center space-x-6">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span>Copy Link</span>
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.309"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;