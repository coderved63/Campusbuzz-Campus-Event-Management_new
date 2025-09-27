import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useUser } from '@/contexts/UserContext';
import { IEvent } from '@/types';
import { CalendarIcon, MapPinIcon, UserIcon, CurrencyRupeeIcon, TicketIcon } from '@heroicons/react/24/outline';

interface OrderSummaryProps {
  event: IEvent | null;
  loading: boolean;
  error: string | null;
}

const OrderSummary: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${id}`);
        if (response.data.success) {
          setEvent(response.data.event);
          // Pre-fill user info if logged in
          if (user) {
            setCustomerInfo({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || ''
            });
          }
        }
      } catch (error: any) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const subtotal = event ? event.price * quantity : 0;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  const handleProceedToPayment = () => {
    if (!customerInfo.name || !customerInfo.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Store order data in sessionStorage for payment page
    const orderData = {
      eventId: id,
      event,
      quantity,
      customerInfo,
      subtotal,
      tax,
      total
    };
    
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    router.push(`/event/${id}/ordersummary/paymentsummary`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Event not found'}</p>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href={`/event/${id}`} className="text-primary hover:underline">
            ← Back to Event
          </Link>
          <h1 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Order Summary</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-darkcard rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Event Details</h2>
              
              {event.image && (
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={event.image.startsWith('http') ? event.image : `/uploads/${event.image}`}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{event.title}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-5 h-5 mr-3" />
                  <span>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {event.time}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-5 h-5 mr-3" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <UserIcon className="w-5 h-5 mr-3" />
                  <span>Hosted by {event.host}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CurrencyRupeeIcon className="w-5 h-5 mr-3" />
                  <span>{event.price === 0 ? 'Free' : `₹${event.price} per ticket`}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white dark:bg-darkcard rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Customer Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-darkcard rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    -
                  </button>
                  <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Ticket Price × {quantity}
                  </span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">GST (18%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center"
              >
                <TicketIcon className="w-5 h-5 mr-2" />
                Proceed to Payment
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Secure payment powered by CampusBuzz
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;