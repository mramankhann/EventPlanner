import { CalendarDays, LayoutDashboard, LogOut, Shield, Copy, Check, Clock, Tv } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { differenceInMinutes } from 'date-fns';

import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user, updateUser, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`http://10.95.4.70:5001/api/auth/user/${user.id}`);
        const data = await res.json();
        if (res.ok) {
          if (data.displayCode !== user.displayCode) {
            updateUser({
              displayCode: data.displayCode,
              displayCodeCreatedAt: data.displayCodeCreatedAt
            });
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
    // Refresh every minute to keep the expiry timer accurate
    const interval = setInterval(fetchUserData, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleLogout = async () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have successfully logged out.',
    });
    navigate('/auth');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const copyDisplayCode = () => {
    if (user?.displayCode) {
      navigator.clipboard.writeText(user.displayCode);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Display code copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTimeUntilExpiry = () => {
    if (!user?.displayCodeCreatedAt) return null;
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setUTCHours(0, 30, 0, 0);
    if (now >= nextReset) {
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    }
    const minutesLeft = differenceInMinutes(nextReset, now);
    if (minutesLeft <= 0) return 'Expiring soon';
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const menuItems = [];

  if (user?.role === 'admin') {
    menuItems.push({ title: 'Admin Panel', url: '/dashboard/admin', icon: Shield });
  } else {
    menuItems.push(
      { title: 'All Tasks', url: '/dashboard/all', icon: LayoutDashboard },
      { title: "Today's Tasks", url: '/dashboard', icon: CalendarDays }
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn("p-4", collapsed && "p-1")}>
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src="/company-logo.png" className="w-8 h-8 object-contain" alt="Logo" />
              <span className="font-bold font-heading text-xl text-black dark:text-white">Event Planner</span>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/company-logo.png" className="w-full h-full object-contain" alt="Logo" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!collapsed && user?.displayCode && user?.role !== 'admin' && (
          <div className="px-4 mb-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/20 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 shrink-0">
                  <Tv className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">TV Access Code</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold tracking-widest text-primary font-mono truncate">{user.displayCode}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={copyDisplayCode}
                      >
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  {user.displayCodeCreatedAt && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        Expires in {getTimeUntilExpiry()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {collapsed && user?.displayCode && user?.role !== 'admin' && (
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-primary/10 border border-primary/20"
              onClick={copyDisplayCode}
              title={`TV Code: ${user.displayCode}`}
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Tv className="w-5 h-5 text-primary" />}
            </Button>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-black dark:text-white font-bold text-sm mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium shadow-soft'
                            : '!text-black dark:!text-white hover:bg-sidebar-accent font-medium'
                        )
                      }
                    >
                      <item.icon className="w-5 h-5 !text-black dark:!text-white" />
                      {!collapsed && <span className="!text-black dark:!text-white">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn('p-4 space-y-2', collapsed && 'p-2 items-center')}>
        <Button
          variant="ghost"
          className={cn('w-full justify-start gap-3 text-black dark:text-white hover:text-black hover:dark:text-white hover:bg-sidebar-accent font-medium', collapsed && 'w-10 h-10 p-0 justify-center')}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn('w-full justify-start gap-3 text-black dark:text-white hover:text-black hover:dark:text-white hover:bg-destructive/10 hover:text-destructive font-medium', collapsed && 'w-10 h-10 p-0 justify-center')}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar >
  );
}
