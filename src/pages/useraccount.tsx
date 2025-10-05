import { useUser } from '@/contexts/UserContext';
import { withAuth } from '@/lib/withAuth';
import { UserCircleIcon, EnvelopeIcon, CalendarIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { formatDate, formatDateTime } from '@/utils/dateFormat';

interface UserTicket {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
  purchaseDate: string;
  qrCode: string;
}

const UserAccountPage = () => {
  const { user } = useUser();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // User is guaranteed to exist due to withAuth wrapper
  if (!user) return null;

  useEffect(() => {
    // Fetch user's tickets
    const fetchTickets = async () => {
      try {
        const response = await axios.get('/api/tickets/user');
        setTickets(response.data.tickets || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleLogout = () => {
    // This would typically call a logout function from UserContext
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <div className="bg-white dark:bg-darkcard rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0">
              <UserCircleIcon className="w-24 h-24 text-primary" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user.name}
              </h1>
              
              <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 dark:text-gray-400 mb-3">
                <EnvelopeIcon className="w-5 h-5" />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  user.isAdmin 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {user.isAdmin ? 'Admin' : 'User'}
                </span>
                
                {user.isAdmin && (
                  <Link href="/admin-dashboard">
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors duration-200 cursor-pointer">
                      Admin Dashboard
                    </span>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Link href="/createEvent">
                <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200">
                  Create Event
                </button>
              </Link>
              
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* My Tickets Section */}
        <div className="bg-white dark:bg-darkcard rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TicketIcon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Tickets</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {ticket.eventId.title}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {formatDateTime(ticket.eventId.date, ticket.eventId.time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{ticket.eventId.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Purchased: {formatDate(ticket.purchaseDate)}
                    </span>
                    
                    <Link href={`/ticket/${ticket._id}`}>
                      <button className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-200">
                        View Ticket
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                You haven't purchased any tickets yet
              </p>
              <Link href="/">
                <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200">
                  Browse Events
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(UserAccountPage);