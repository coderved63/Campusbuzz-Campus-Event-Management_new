import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/contexts/UserContext';
import { formatDate } from '@/utils/dateFormat';

interface DebugInfo {
  success: boolean;
  totalEvents: number;
  approvedEvents: number;
  pendingEvents: number;
  allEvents: any[];
  approvedEventsList: any[];
}

const DebugPage = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoApproving, setAutoApproving] = useState(false);
  const { user } = useUser();

  const fetchDebugInfo = async () => {
    try {
      const response = await axios.get('/api/debug-events');
      setDebugInfo(response.data);
    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoApproveEvents = async () => {
    if (!user) return;
    
    setAutoApproving(true);
    try {
      const response = await axios.post('/api/auto-approve-events');
      alert(`Success: ${response.data.message}`);
      fetchDebugInfo(); // Refresh the data
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || 'Failed to approve events'}`);
    } finally {
      setAutoApproving(false);
    }
  };

  const createSampleEvents = async () => {
    if (!user) return;
    
    setAutoApproving(true);
    try {
      const response = await axios.post('/api/create-sample-events');
      alert(`Success: ${response.data.message}`);
      fetchDebugInfo(); // Refresh the data
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || 'Failed to create sample events'}`);
    } finally {
      setAutoApproving(false);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading debug information...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Debug Dashboard</h1>

      {!user && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          Please login to use debug features.
        </div>
      )}

      {debugInfo && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-100 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-blue-800">Total Events</h3>
              <p className="text-3xl font-bold text-blue-600">{debugInfo.totalEvents}</p>
            </div>
            <div className="bg-green-100 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-green-800">Approved Events</h3>
              <p className="text-3xl font-bold text-green-600">{debugInfo.approvedEvents}</p>
            </div>
            <div className="bg-orange-100 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-orange-800">Pending Events</h3>
              <p className="text-3xl font-bold text-orange-600">{debugInfo.pendingEvents}</p>
            </div>
          </div>

          {/* Quick Actions */}
          {user && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {debugInfo.totalEvents === 0 && (
                  <div>
                    <button
                      onClick={createSampleEvents}
                      disabled={autoApproving}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mr-3"
                    >
                      {autoApproving ? 'Creating...' : 'Create Sample Events'}
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      Create 5 sample approved events to test the homepage display.
                    </p>
                  </div>
                )}
                {debugInfo.pendingEvents > 0 && (
                  <div>
                    <button
                      onClick={autoApproveEvents}
                      disabled={autoApproving}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                      {autoApproving ? 'Approving...' : `Auto-Approve All ${debugInfo.pendingEvents} Pending Events`}
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      This will approve all pending events for testing purposes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Events List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">All Events</h3>
            {debugInfo.allEvents.length === 0 ? (
              <p className="text-gray-500">No events found.</p>
            ) : (
              <div className="space-y-3">
                {debugInfo.allEvents.map(event => (
                  <div 
                    key={event._id} 
                    className={`p-4 rounded-lg border ${
                      event.isApproved 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          Owner: {event.owner?.name || 'Unknown'} 
                          {event.owner?.isAdmin && ' (Admin)'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        event.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {event.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Events Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Approved Events (Featured)</h3>
            {debugInfo.approvedEventsList.length === 0 ? (
              <p className="text-gray-500">No approved events available for featured display.</p>
            ) : (
              <div className="space-y-3">
                {debugInfo.approvedEventsList.map(event => (
                  <div key={event._id} className="p-4 rounded-lg border border-green-200 bg-green-50">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      Date: {formatDate(event.date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Owner: {event.owner?.name || 'Unknown'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={fetchDebugInfo}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh Debug Info
        </button>
      </div>
    </div>
  );
};

export default DebugPage;