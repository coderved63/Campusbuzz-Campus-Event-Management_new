import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import axios from 'axios';
import { formatDateFull } from '@/utils/dateFormat';

interface ITicket {
  _id: string;
  userid: string;
  eventid: string;
  ticketDetails: {
    name: string;
    email: string;
    eventname: string;
    eventdate: Date;
    eventtime: string;
    ticketprice: number;
    qr?: string;
  };
  count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const WalletPage = () => {
  const { user } = useUser();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`/api/tickets?userId=${user?._id}`);
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to view your tickets.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
      
      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You haven't booked any tickets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tickets.map(ticket => (
            <div key={ticket._id} className="bg-white dark:bg-darkcard rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
                <h3 className="text-xl font-bold mb-2">{ticket.ticketDetails.eventname}</h3>
                <div className="flex items-center text-sm opacity-90">
                  <span className="bg-white/20 px-2 py-1 rounded-full">🎫 TICKET</span>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDateFull(ticket.ticketDetails.eventdate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Time</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{ticket.ticketDetails.eventtime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Price</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {ticket.ticketDetails.ticketprice === 0 ? 'Free' : `₹${ticket.ticketDetails.ticketprice}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ticket ID</p>
                    <p className="font-mono text-xs text-gray-700 dark:text-gray-300">
                      {ticket._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* QR Code Section */}
                {ticket.ticketDetails.qr && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Show this QR code at the event entrance
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg inline-block">
                        <img 
                          src={ticket.ticketDetails.qr} 
                          alt="Event Ticket QR Code" 
                          className="w-40 h-40 mx-auto"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Contains: Event details, ticket ID, and verification data
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletPage;