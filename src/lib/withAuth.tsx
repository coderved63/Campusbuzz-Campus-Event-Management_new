import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/UserContext';

interface WithAuthOptions {
  redirectTo?: string;
  adminOnly?: boolean;
}

export function withAuth<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = '/login', adminOnly = false } = options;

  return function AuthenticatedComponent(props: T) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          // User is not authenticated
          router.replace(redirectTo);
        } else if (adminOnly && !user.isAdmin) {
          // User is authenticated but not an admin
          router.replace('/');
        }
      }
    }, [user, loading, router]);

    // Show loading spinner while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Don't render the component if user is not authenticated or not admin (when required)
    if (!user || (adminOnly && !user.isAdmin)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Hook for protecting components within pages
export function useAuth(options: WithAuthOptions = {}) {
  const { redirectTo = '/login', adminOnly = false } = options;
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(redirectTo);
      } else if (adminOnly && !user.isAdmin) {
        router.replace('/');
      }
    }
  }, [user, loading, router, redirectTo, adminOnly]);

  return { user, loading, isAuthenticated: !!user, isAdmin: user?.isAdmin };
}