import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeftIcon, TrashIcon, TicketIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface TicketDetails {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    price: number;
  };
  userId: string;
  userName: string;
  userEmail: string;
  purchaseDate: string;
  qrCode: string;
  status: 'active' | 'used' | 'cancelled';
}

const TicketPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`/api/tickets/${id}`);
        setTicket(response.data.ticket);
      } catch (error: any) {
        console.error('Error fetching ticket:', error);
        setError('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const deleteTicket = async () => {
    if (!ticket) return;
    
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/tickets/${ticket._id}`);
        alert('Ticket deleted successfully');
        router.push('/wallet');
      } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Failed to delete ticket');
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

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            {error || 'Ticket Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The ticket you're looking for doesn't exist."}
          </p>
          <Link href="/wallet">
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
              Back to Wallet
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && (user._id === ticket.userId || user.isAdmin);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/wallet">
            <button className="inline-flex items-center gap-2 p-3 bg-white dark:bg-darkcard text-primary font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm">
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Wallet
            </button>
          </Link>
        </div>

        {/* Ticket Card */}
        <div className="bg-white dark:bg-darkcard rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TicketIcon className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Event Ticket</h1>
                  <p className="text-primary-light">#{ticket._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              
              {isOwner && (
                <button
                  onClick={deleteTicket}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors duration-200"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code Section */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg shadow-md border-2 border-gray-200 mb-4">
                  {ticket.qrCode ? (
                    <img 
                      src={ticket.qrCode.startsWith('http') ? ticket.qrCode : `/uploads/qrcodes/${ticket.qrCode}`}
                      alt="Ticket QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500">QR Code</span>
                    </div>
                  )}
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  ticket.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : ticket.status === 'used'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </div>
              </div>

              {/* Ticket Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {ticket.eventId.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Date
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(ticket.eventId.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Time
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {ticket.eventId.time}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Location
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {ticket.eventId.location}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Attendee
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {ticket.userName}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Price
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-primary">
                      {ticket.eventId.price === 0 ? 'Free' : `₹${ticket.eventId.price}`}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Email
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {ticket.userEmail}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Purchased On
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(ticket.purchaseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Important Instructions:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Please arrive at the venue 15 minutes before the event starts</li>
                <li>• Show this QR code at the entrance for verification</li>
                <li>• Keep this ticket safe and do not share the QR code with others</li>
                <li>• Contact the event organizer if you have any questions</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href={`/event/${ticket.eventId._id}`} className="flex-1">
                <button className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200">
                  View Event Details
                </button>
              </Link>
              
              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Print Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;