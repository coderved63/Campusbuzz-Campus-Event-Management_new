import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useUser } from '@/contexts/UserContext';
import { IEvent } from '@/types';
import { 
  CheckCircleIcon, 
  CreditCardIcon, 
  CalendarIcon, 
  MapPinIcon, 
  TicketIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface OrderData {
  eventId: string;
  event: IEvent;
  quantity: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  subtotal: number;
  tax: number;
  total: number;
}

const PaymentSummary: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');

  useEffect(() => {
    // Get order data from sessionStorage
    const storedOrderData = sessionStorage.getItem('orderData');
    if (storedOrderData) {
      const parsedData = JSON.parse(storedOrderData);
      setOrderData(parsedData);
      // Generate a mock transaction ID
      setTransactionId(`TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`);
    } else {
      // Redirect back if no order data
      router.push(`/event/${id}`);
    }
  }, [id, router]);

  const handlePayment = async () => {
    if (!orderData || !user) return;

    setProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Book the ticket
      const response = await axios.post('/api/book-ticket', {
        eventId: orderData.eventId,
        name: orderData.customerInfo.name,
        email: orderData.customerInfo.email,
        quantity: orderData.quantity,
        paymentMethod,
        transactionId,
        amount: orderData.total
      });

      if (response.data.success) {
        setTicketId(response.data.data._id);
        setPaymentSuccess(true);
        // Clear order data from sessionStorage
        sessionStorage.removeItem('orderData');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadTicket = () => {
    if (ticketId) {
      // In a real app, this would generate and download a PDF ticket
      alert('Ticket download feature would be implemented here');
    }
  };

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId);
    alert('Transaction ID copied to clipboard!');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-darkcard rounded-xl shadow-lg p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your ticket has been booked successfully. You will receive a confirmation email shortly.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Booking Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Event:</span>
                  <span className="font-medium">{orderData.event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-medium">
                    {new Date(orderData.event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tickets:</span>
                  <span className="font-medium">{orderData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                  <span className="font-medium text-green-600">₹{orderData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                  <div className="flex items-center">
                    <span className="font-mono text-xs mr-2">{transactionId}</span>
                    <button
                      onClick={copyTransactionId}
                      className="text-primary hover:text-primary-dark"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/wallet"
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center"
              >
                <TicketIcon className="w-5 h-5 mr-2" />
                View My Tickets
              </Link>
              
              <button
                onClick={handleDownloadTicket}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Download Ticket
              </button>
              
              <Link
                href="/"
                className="block text-center text-primary hover:underline mt-4"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link href={`/event/${id}/ordersummary`} className="text-primary hover:underline">
            ← Back to Order Summary
          </Link>
          <h1 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Payment</h1>
        </div>

        <div className="bg-white dark:bg-darkcard rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-3">
              {orderData.event.image && (
                <img 
                  src={orderData.event.image.startsWith('http') ? orderData.event.image : `/uploads/${orderData.event.image}`}
                  alt={orderData.event.title}
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{orderData.event.title}</h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {new Date(orderData.event.date).toLocaleDateString()} at {orderData.event.time}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {orderData.event.location}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Tickets ({orderData.quantity}x)</span>
              <span>₹{orderData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{orderData.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Customer Information</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>{orderData.customerInfo.name}</p>
              <p>{orderData.customerInfo.email}</p>
              {orderData.customerInfo.phone && <p>{orderData.customerInfo.phone}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-darkcard rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Payment Method</h2>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-primary focus:ring-primary"
              />
              <CreditCardIcon className="w-5 h-5 text-gray-600" />
              <span>Credit/Debit Card</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-primary focus:ring-primary"
              />
              <span className="w-5 h-5 bg-primary rounded text-white text-xs flex items-center justify-center font-bold">
                U
              </span>
              <span>UPI</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-primary focus:ring-primary"
              />
              <span className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">
                W
              </span>
              <span>Digital Wallet</span>
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-darkcard rounded-xl shadow-lg p-6">
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-primary text-white py-4 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Pay ₹{orderData.total.toFixed(2)}
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            Your payment is secured with 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;