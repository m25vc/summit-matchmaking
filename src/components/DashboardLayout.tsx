import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  LayoutDashboard,
  Menu,
  Settings,
  User,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Link } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<{
    first_name: string
    last_name: string
  } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          setProfile({
            first_name: profileData?.first_name || 'User',
            last_name: profileData?.last_name || 'Profile',
          })
        }
      }
    }

    fetchProfile()
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    } else {
      navigate('/auth')
    }
  }

  const menuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/teams", label: "Teams" },
    { href: "/edit-profile", label: "Edit Profile" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-700">
      {/* Mobile menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden absolute top-4 left-4"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 pt-6">
          <SheetHeader className="px-6 pb-4">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navigate your dashboard
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 rounded-md p-2 hover:bg-gray-200 ${
                  location.pathname === item.href ? 'bg-gray-200 font-medium' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
          <SheetHeader className="mt-8 px-6 pb-4">
            <SheetTitle>Account</SheetTitle>
            <SheetDescription>
              Manage your account settings
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-4">
            <Button variant="ghost" className="justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={handleSignOut}
            >
              <User className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-gray-200">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link to="/" className="font-bold text-lg">
            Your Company
          </Link>
        </div>
        <div className="flex flex-col flex-grow p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2 rounded-md p-2 hover:bg-gray-200 ${
                location.pathname === item.href ? 'bg-gray-200 font-medium' : ''
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Your Name" />
                    <AvatarFallback>
                      {profile?.first_name?.charAt(0)}
                      {profile?.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {profile?.first_name} {profile?.last_name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <User className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex flex-col">
        <main className="flex-grow p-4">{children}</main>
        <footer className="h-16 flex items-center justify-center border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}
