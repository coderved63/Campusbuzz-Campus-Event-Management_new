import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import EventCard from '@/components/EventCard';
import { IEvent } from '@/types';
import { CalendarDaysIcon, PlusCircleIcon, StarIcon, UsersIcon, TicketIcon } from '@heroicons/react/24/outline';

interface HomePageProps {
  initialEvents: IEvent[];
}

const HomePage: React.FC<HomePageProps> = ({ initialEvents }) => {
  const [events, setEvents] = useState<IEvent[]>(initialEvents);
  const [pendingEvents, setPendingEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { isDarkMode } = useTheme();

  // Refresh events function
  const refreshEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      if (response.data.success) {
        setEvents(response.data.events || []);
        console.log('Refreshed events:', response.data.events?.length || 0);
      }
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on component mount and when user changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events');
        if (response.data.success) {
          setEvents(response.data.events || []);
          console.log('Fetched events:', response.data.events?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    // If no initial events were loaded, fetch them on client-side
    if (initialEvents.length === 0) {
      fetchEvents();
    }
  }, [initialEvents.length]);

  useEffect(() => {
    if (user) {
      axios.get(`/api/events/user/${user._id}/pending`).then((response) => {
        if (response.data.success) {
          setPendingEvents(response.data.events);
        }
      }).catch((error) => {
        console.error('Error fetching pending events:', error);
      });
    }
  }, [user]);

  // Featured events: pick first 3 upcoming
  const featuredEvents = events.slice(0, 3);

  // Statistics (only real data now)
  const stats = [
    { label: "Total Events", value: events.length, icon: <CalendarDaysIcon className="w-6 h-6 text-primary" /> },
  ];

  // Testimonials (dummy)
  const testimonials = [
    {
      name: "Aarav S.",
      text: "CampusBuzz made event registration a breeze! The new look is awesome.",
    },
    {
      name: "Priya K.",
      text: "I love the quick actions and the fresh design. Super easy to use!",
    },
    {
      name: "Rahul M.",
      text: "The featured events section helps me find the best events fast.",
    },
  ];

  const deleteEvent = async (eventId: string) => {
    try {
      await axios.delete(`/api/event/${eventId}`);
      // Refresh events after deletion
      const response = await axios.get('/api/events');
      if (response.data.success) {
        setEvents(response.data.events);
      }
      if (user) {
        const pendingResponse = await axios.get(`/api/events/user/${user._id}/pending`);
        if (pendingResponse.data.success) {
          setPendingEvents(pendingResponse.data.events);
        }
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const deletePendingEvent = async (eventId: string) => {
    try {
      await axios.delete(`/api/event/${eventId}`);
      // Refresh pending events after deletion
      if (user) {
        const response = await axios.get(`/api/events/user/${user._id}/pending`);
        if (response.data.success) {
          setPendingEvents(response.data.events);
        }
      }
    } catch (error) {
      console.error('Error deleting pending event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-darkbg">
      {/* Pending Approval Section for User */}
      {user && pendingEvents.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8 mb-8">
          <h2 className="text-xl font-bold mb-4 text-yellow-600">Your Events Pending Approval</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingEvents.map(event => (
              <div key={event._id} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow p-4 flex flex-col">
                <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">{event.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{event.description}</p>
                <span className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">Pending admin approval</span>
                {(user.isAdmin || event.owner === user._id) && (
                  <button
                    onClick={() => deletePendingEvent(event._id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mt-2"
                  >
                    Delete Event
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/80 to-blue-400/80 text-white py-16 rounded-b-3xl shadow-lg mb-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <img 
            src="/assets/hero.webp" 
            alt="Campus Buzz" 
            className="w-64 h-64 object-cover rounded-2xl shadow-2xl border-4 border-white hidden md:block" 
          />
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Welcome to CampusBuzz</h1>
            <p className="text-lg md:text-xl mb-6 font-medium">Discover, create, and join amazing campus events. Your campus, your buzz!</p>
            <div className="flex gap-4">
              <Link href="/createEvent">
                <button className="bg-white text-primary font-bold px-6 py-3 rounded-lg shadow hover:bg-primary hover:text-white transition">Create Event</button>
              </Link>
              <Link href="/calendar">
                <button className="bg-primary-dark text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-white hover:text-primary transition">View Calendar</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Link href="/createEvent" className="flex flex-col items-center bg-primary/10 rounded-xl p-4 hover:bg-primary/20 transition">
          <PlusCircleIcon className="w-10 h-10 text-primary mb-2" />
          <span className="font-semibold">Create Event</span>
        </Link>
        <Link href="/calendar" className="flex flex-col items-center bg-primary/10 rounded-xl p-4 hover:bg-primary/20 transition">
          <CalendarDaysIcon className="w-10 h-10 text-primary mb-2" />
          <span className="font-semibold">Calendar</span>
        </Link>
        <Link href="/featured" className="flex flex-col items-center bg-primary/10 rounded-xl p-4 hover:bg-primary/20 transition">
          <StarIcon className="w-10 h-10 text-primary mb-2" />
          <span className="font-semibold">Featured</span>
        </Link>
        <Link href="/wallet" className="flex flex-col items-center bg-primary/10 rounded-xl p-4 hover:bg-primary/20 transition">
          <TicketIcon className="w-10 h-10 text-primary mb-2" />
          <span className="font-semibold">My Tickets</span>
        </Link>
      </section>

      {/* Featured Events */}
      <section className="max-w-5xl mx-auto px-4 mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Featured Events</h2>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="text-sm text-gray-500">Loading events...</div>
            )}
            <button
              onClick={refreshEvents}
              disabled={loading}
              className="text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-lg transition disabled:opacity-50"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading featured events...</p>
            </div>
          ) : featuredEvents.length > 0 ? featuredEvents.map(event => (
            <EventCard 
              key={event._id} 
              event={event} 
              onDelete={deleteEvent}
              showDeleteButton={Boolean(user && (user.isAdmin || event.owner === user._id))}
            />
          )) : (
            <div className="col-span-full text-center py-8 text-gray-400">
              <p>No featured events available.</p>
              <p className="text-sm mt-2">Total events loaded: {events.length}</p>
              {user?.isAdmin && (
                <Link href="/debug" className="text-primary hover:underline text-sm">
                  Debug Events →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modern Event Grid */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">All Upcoming Events</h2>
          {loading && (
            <div className="text-sm text-gray-500">Loading events...</div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading upcoming events...</p>
            </div>
          ) : events.length > 0 ? events.map(event => (
            <EventCard 
              key={event._id} 
              event={event}
              onDelete={deleteEvent}
              showDeleteButton={Boolean(user && (user.isAdmin || event.owner === user._id))}
            />
          )) : (
            <div className="col-span-full text-center py-8 text-gray-400">
              <p>No events available at the moment.</p>
              <div className="mt-4 space-y-2">
                <Link href="/createEvent" className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition">
                  Create Your First Event
                </Link>
                <br />
                {user?.isAdmin && (
                  <Link href="/debug" className="text-primary hover:underline text-sm">
                    Debug Events →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-primary/5 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-primary text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white dark:bg-darkcard rounded-xl shadow p-6 flex flex-col items-center">
                <UsersIcon className="w-10 h-10 text-primary mb-2" />
                <p className="text-gray-700 dark:text-gray-200 italic mb-4">"{t.text}"</p>
                <span className="font-semibold text-primary">- {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Try to fetch approved events from database
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log('Fetching events from:', `${baseUrl}/api/events`);
    
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('SSR: Fetched events:', data.events?.length || 0);
      return {
        props: {
          initialEvents: data.events || [],
        },
      };
    } else {
      console.log('SSR: API response not ok:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('SSR: Error fetching initial events:', error);
  }
  
  // Always return empty array as fallback - client will fetch
  return {
    props: {
      initialEvents: [],
    },
  };
};

export default HomePage;