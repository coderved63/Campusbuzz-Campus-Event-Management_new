import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { UserContextProvider } from '@/contexts/UserContext';
import { ThemeContextProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeContextProvider>
      <UserContextProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-white dark:bg-darkbg">
            <Header />
            <main className="flex-grow">
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </UserContextProvider>
    </ThemeContextProvider>
  );
}

export default MyApp;