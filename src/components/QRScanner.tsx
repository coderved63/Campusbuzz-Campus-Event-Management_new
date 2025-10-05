import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface QRScannerProps {
  onVerificationComplete?: (result: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onVerificationComplete }) => {
  const [qrInput, setQrInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleManualVerification = async () => {
    if (!qrInput.trim()) {
      setError('Please enter QR code data');
      return;
    }

    setVerifying(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await axios.post('/api/verify-qr', {
        qrData: qrInput
      });

      if (response.data.success) {
        setVerificationResult(response.data.data);
        onVerificationComplete?.(response.data.data);
      } else {
        setError(response.data.error || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const resetScanner = () => {
    setQrInput('');
    setVerificationResult(null);
    setError('');
  };

  return (
    <div className="bg-white dark:bg-darkcard rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <QrCodeIcon className="w-6 h-6 mr-2 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          QR Code Verification
        </h3>
      </div>

      {!verificationResult ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="qr-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paste QR Code Data or Ticket ID
            </label>
            <textarea
              id="qr-input"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Paste the QR code data here or enter ticket ID..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center">
                <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleManualVerification}
            disabled={verifying || !qrInput.trim()}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <QrCodeIcon className="w-4 h-4 mr-2" />
                Verify Ticket
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Note: In a production environment, you would integrate with a camera-based QR scanner library.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
              <h4 className="text-green-800 dark:text-green-300 font-semibold">
                Ticket Verified Successfully!
              </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Event:</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {verificationResult.event.title}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-400">Attendee:</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {verificationResult.ticket.attendeeName}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-400">Date & Time:</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(verificationResult.event.date).toLocaleDateString()} at {verificationResult.event.time}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-400">Status:</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {verificationResult.ticket.status}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-400">Location:</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {verificationResult.event.location}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-400">Verified:</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(verificationResult.verificationTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={resetScanner}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
          >
            Verify Another Ticket
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;