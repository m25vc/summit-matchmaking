import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { UserCog, ShieldCheck, CalendarClock, Handshake, HelpCircle, User } from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[DashboardLayout] Session:', session);
      if (!session) {
        console.log('[DashboardLayout] No session, navigating to /auth');
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      console.log('[DashboardLayout] Profile:', profile);

      setIsAdmin(profile?.role === 'admin');
      setLoading(false);
      console.log('[DashboardLayout] setLoading(false)');
    };
    
    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    console.log('[DashboardLayout] Signing out...');
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    console.log('[DashboardLayout] Loading...');
    return <div>Loading...</div>;
  }

  console.log('[DashboardLayout] Rendering children');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/ed6dc4fc-70bd-4ee0-aa8e-01c89f7c45f3.png" 
                alt="M25 Logo" 
                className="h-8 w-auto"
              />
              <Link to="/dashboard" className="text-xl font-bold">Club M25 Summit</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <Handshake className="h-4 w-4 mr-1" />
                Match Selection
              </Link>
              <Link 
                to="/availability"
                className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <CalendarClock className="h-4 w-4 mr-1" />
                Set Availability
              </Link>
              <Link 
                to="/matchmaking-guide"
                className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Matchmaking Guide
              </Link>
              <Link 
                to="/profile/edit"
                className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin"
                  className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
                >
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
