import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useUser } from '@/contexts/UserContext';
import { formatDateFull } from '@/utils/dateFormat';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  UserIcon,
  TagIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { IEvent } from '@/types';

const AdminDashboard = () => {
  const [pendingEvents, setPendingEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!user.isAdmin) {
      router.push('/');
      return;
    }
    
    fetchPendingEvents();
  }, [user, router]);

  const fetchPendingEvents = async () => {
    try {
      const response = await axios.get('/api/events/pending');
      setPendingEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching pending events:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      await axios.post(`/api/events/${eventId}/approve`);
      // Refresh the list after approval
      fetchPendingEvents();
    } catch (error) {
      console.error('Error approving event:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectEvent = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      await axios.delete(`/api/events/${eventId}`);
      fetchPendingEvents();
    } catch (error) {
      console.error('Error rejecting event:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Review and manage pending events
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-darkcard rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{pendingEvents.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rejected Today</div>
            </div>
          </div>
        </div>

        {/* Events List */}
        {pendingEvents.length === 0 ? (
          <div className="bg-white dark:bg-darkcard rounded-lg shadow-lg p-12 text-center">
            <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              All caught up!
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No pending events to review at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingEvents.map((event) => (
              <div key={event._id} className="bg-white dark:bg-darkcard rounded-lg shadow-lg overflow-hidden">
                {/* Event Image */}
                {event.image && (
                  <div className="h-48 bg-gray-200 dark:bg-gray-700">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Event Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                    {event.description?.length > 150 
                      ? `${event.description.substring(0, 150)}...` 
                      : event.description
                    }
                  </p>

                  {/* Event Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>{formatDateFull(event.date)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{event.time}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <UserIcon className="w-4 h-4 mr-2" />
                      <span>{event.host}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <TagIcon className="w-4 h-4 mr-2" />
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {event.category}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
                      <span className="font-semibold text-primary">
                        {event.price === 0 ? 'Free' : `₹${event.price}`}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => approveEvent(event._id)}
                      disabled={actionLoading === event._id}
                      className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      {actionLoading === event._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => rejectEvent(event._id)}
                      disabled={actionLoading === event._id}
                      className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      {actionLoading === event._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <XCircleIcon className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;