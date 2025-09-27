import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  QrCodeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Head from 'next/head';

interface TicketVerificationResult {
  valid: boolean;
  ticket?: {
    _id: string;
    eventTitle: string;
    userName: string;
    userEmail: string;
    ticketType: string;
    quantity: number;
    purchaseDate: string;
    eventDate: string;
    eventLocation: string;
    verified: boolean;
    verificationDate?: string;
  };
  error?: string;
  message?: string;
}

const TicketVerificationPage: React.FC = () => {
  const router = useRouter();
  const [ticketId, setTicketId] = useState('');
  const [verificationResult, setVerificationResult] = useState<TicketVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState(false);

  const handleVerifyTicket = async (id?: string) => {
    const idToVerify = id || ticketId;
    if (!idToVerify.trim()) {
      setVerificationResult({
        valid: false,
        error: 'Please enter a ticket ID'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId: idToVerify }),
      });

      const data = await response.json();
      setVerificationResult(data);

      // Clear the input after verification
      setTicketId('');
    } catch (error) {
      console.error('Error verifying ticket:', error);
      setVerificationResult({
        valid: false,
        error: 'Failed to verify ticket. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    // In a real implementation, this would open camera for QR scanning
    // For now, we'll simulate with a prompt
    const scannedId = prompt('Enter scanned ticket ID:');
    if (scannedId) {
      handleVerifyTicket(scannedId);
    }
  };

  return (
    <>
      <Head>
        <title>Ticket Verification - CampusBuzz</title>
        <meta name="description" content="Verify event tickets for CampusBuzz events" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ticket Verification
            </h1>
            <p className="text-gray-600">
              Verify event tickets by scanning QR codes or entering ticket IDs
            </p>
          </div>

          {/* Verification Input */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter ticket ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyTicket()}
                />
              </div>
              
              <div className="flex items-end space-x-3">
                <button
                  onClick={() => handleVerifyTicket()}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Ticket'
                  )}
                </button>
                
                <button
                  onClick={handleScanQR}
                  disabled={loading}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <QrCodeIcon className="w-5 h-5 mr-2" />
                  Scan QR
                </button>
              </div>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className={`bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 ${
              verificationResult.valid 
                ? 'border-green-500' 
                : 'border-red-500'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {verificationResult.valid ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-500" />
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <h3 className={`text-lg font-medium ${
                    verificationResult.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verificationResult.valid ? 'Valid Ticket' : 'Invalid Ticket'}
                  </h3>
                  
                  {verificationResult.error && (
                    <p className="text-red-600 mt-1">{verificationResult.error}</p>
                  )}
                  
                  {verificationResult.message && (
                    <p className="text-gray-600 mt-1">{verificationResult.message}</p>
                  )}

                  {verificationResult.ticket && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Ticket Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Event:</span>
                          <p className="text-gray-900">{verificationResult.ticket.eventTitle}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Attendee:</span>
                          <p className="text-gray-900">{verificationResult.ticket.userName}</p>
                          <p className="text-gray-600">{verificationResult.ticket.userEmail}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Ticket Type:</span>
                          <p className="text-gray-900">{verificationResult.ticket.ticketType}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Quantity:</span>
                          <p className="text-gray-900">{verificationResult.ticket.quantity}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Purchase Date:</span>
                          <p className="text-gray-900">
                            {new Date(verificationResult.ticket.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Event Date:</span>
                          <p className="text-gray-900">
                            {new Date(verificationResult.ticket.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Location:</span>
                          <p className="text-gray-900">{verificationResult.ticket.eventLocation}</p>
                        </div>
                      </div>

                      {verificationResult.ticket.verified && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                            <span className="text-yellow-800 font-medium">
                              Previously Verified
                            </span>
                          </div>
                          {verificationResult.ticket.verificationDate && (
                            <p className="text-yellow-700 text-sm mt-1">
                              Verified on: {new Date(verificationResult.ticket.verificationDate).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Verification Instructions
            </h3>
            
            <div className="space-y-3 text-gray-600">
              <p>• <strong>Manual Entry:</strong> Type or paste the ticket ID in the input field above and click "Verify Ticket"</p>
              <p>• <strong>QR Code Scanning:</strong> Click "Scan QR" to scan a ticket's QR code with your device camera</p>
              <p>• <strong>Valid Tickets:</strong> Will show green with full ticket details and attendee information</p>
              <p>• <strong>Invalid Tickets:</strong> Will show red with an error message explaining why the ticket is invalid</p>
              <p>• <strong>Already Used:</strong> Previously verified tickets will show a warning but remain valid for reference</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketVerificationPage;