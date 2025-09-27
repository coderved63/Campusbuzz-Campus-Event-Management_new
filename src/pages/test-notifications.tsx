import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
import axios from 'axios';

const TestNotifications = () => {
  const { user } = useUser();
  const { notifications, unreadCount, fetchNotifications } = useNotifications();
  const [testResult, setTestResult] = useState<string>('');

  const createTestNotification = async () => {
    if (!user) {
      setTestResult('Please login first');
      return;
    }

    try {
      // Create a test notification directly in the database
      await axios.post('/api/test-notification', {
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working',
        type: 'general'
      });
      
      setTestResult('Test notification created successfully!');
      fetchNotifications();
    } catch (error) {
      setTestResult('Error creating test notification');
      console.error(error);
    }
  };

  const checkPendingEvents = async () => {
    if (!user || !user.isAdmin) {
      setTestResult('Admin access required');
      return;
    }

    try {
      const response = await axios.get('/api/events/pending');
      setTestResult(`Found ${response.data.events.length} pending events`);
    } catch (error) {
      setTestResult('Error fetching pending events');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkbg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Notification System Test</h1>
        
        <div className="bg-white dark:bg-darkcard rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <p className="mb-2">User: {user ? user.name : 'Not logged in'}</p>
          <p className="mb-2">Is Admin: {user?.isAdmin ? 'Yes' : 'No'}</p>
          <p className="mb-2">Unread Notifications: {unreadCount}</p>
          <p className="mb-4">Total Notifications: {notifications.length}</p>
        </div>

        <div className="bg-white dark:bg-darkcard rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={createTestNotification}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Test Notification
            </button>
            
            <button
              onClick={checkPendingEvents}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-4"
            >
              Check Pending Events
            </button>
          </div>
          
          {testResult && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <p>{testResult}</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-darkcard rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 rounded border ${
                    !notification.isRead 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' 
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200'
                  }`}
                >
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No notifications found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestNotifications;