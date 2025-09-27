import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { IEvent } from '@/types';
import { formatDate } from '@/utils/dateFormat';
import { 
  PlusCircleIcon, 
  CalendarDaysIcon, 
  WalletIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  SunIcon, 
  MoonIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { user, setUser } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get('/api/events').then((response) => {
      if (response.data.success) {
        setEvents(response.data.events);
      }
    }).catch((error) => {
      console.error('Error fetching events:', error);
    });
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setSearchQuery('');
      }
      // Close notification dropdown when clicking outside
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown')) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const logout = async () => {
    try {
      await axios.post('/api/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const navItems = [
    {
      name: 'Event Planner',
      to: '/calendar',
      icon: <CalendarDaysIcon className="w-6 h-6" aria-hidden="true" />,
    },
    {
      name: 'Host Buzz',
      to: '/createEvent',
      icon: <PlusCircleIcon className="w-6 h-6" aria-hidden="true" />,
    },
    {
      name: 'My Tickets',
      to: '/wallet',
      icon: <WalletIcon className="w-6 h-6" aria-hidden="true" />,
    },
    {
      name: 'Profile',
      to: '/useraccount',
      icon: <UserCircleIcon className="w-6 h-6" aria-hidden="true" />,
      hideIfNotLogged: true,
    },
  ];

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-darkcard shadow-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xs">
        <form className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 w-full shadow-sm focus-within:ring-2 focus-within:ring-primary" role="search" aria-label="Site search">
          <button type="submit" tabIndex={-1} className="focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="ml-2 bg-transparent outline-none text-sm text-black dark:text-white w-full"
            aria-label="Search events"
          />
        </form>
        
        {/* Search dropdown */}
        {searchQuery && (
          <div className="absolute mt-12 left-4 w-72 bg-white dark:bg-darkcard rounded-lg shadow-lg z-50 border border-gray-100 dark:border-gray-700">
            {events
              .filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((event) => (
                <Link key={event._id} href={`/event/${event._id}`} className="block px-4 py-2 hover:bg-primary/10 text-black dark:text-darktext">
                  {event.title}
                </Link>
              ))}
          </div>
        )}
      </div>

      {/* Center: Logo */}
      <div className="flex-1 text-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          CampusBuzz
        </Link>
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Notification Bell */}
        {user && (
          <div className="relative notification-dropdown">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-darkcard rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAsRead()}
                        className="text-sm text-primary hover:text-primary-dark"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => markAsRead(notification._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-yellow-500" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => {
            if (item.hideIfNotLogged && !user) return null;
            return (
              <Link
                key={item.name}
                href={item.to}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          {user ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-darkcard shadow-lg md:hidden">
          <div className="px-4 py-2 space-y-2">
            {navItems.map((item) => {
              if (item.hideIfNotLogged && !user) return null;
              return (
                <Link
                  key={item.name}
                  href={item.to}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-gray-700 dark:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-100 text-red-600 w-full text-left"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 bg-primary text-white text-center rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;