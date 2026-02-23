import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Shield, User, Activity, HardDrive, Users, CheckCircle2, Clock, Globe, Eye, EyeOff, Pencil, Calendar, AlertCircle } from 'lucide-react';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    plainPassword?: string;
    createdAt: string;
    displayCode?: string;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = React.useState<UserData[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [editingPassword, setEditingPassword] = React.useState<string | null>(null);
    const [newPassword, setNewPassword] = React.useState('');
    const [visiblePasswords, setVisiblePasswords] = React.useState<Set<string>>(new Set());
    const [systemStats, setSystemStats] = React.useState<any>(null);
    const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
    const allVisible = users.length > 0 && visiblePasswords.size === users.length;

    const togglePasswordVisibility = (userId: string) => {
        const newVisible = new Set(visiblePasswords);
        if (newVisible.has(userId)) {
            newVisible.delete(userId);
        } else {
            newVisible.add(userId);
        }
        setVisiblePasswords(newVisible);
    };

    const toggleAllPasswords = () => {
        if (allVisible) {
            setVisiblePasswords(new Set());
        } else {
            const allIds = new Set(users.map(u => u._id));
            setVisiblePasswords(allIds);
        }
    };

    // Form state
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [role, setRole] = React.useState('user');

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://10.95.4.70:5001/api/auth/users');
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('http://10.95.4.70:5001/api/admin/stats');
            const data = await res.json();
            if (res.ok) {
                setSystemStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch('http://10.95.4.70:5001/api/admin/logs');
            const data = await res.json();
            if (res.ok) {
                setAuditLogs(data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    React.useEffect(() => {
        fetchUsers();
        fetchStats();
        fetchLogs();
        const interval = setInterval(() => {
            fetchStats();
            fetchLogs();
        }, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const stats = React.useMemo(() => {
        return [
            { title: 'Events Today', value: systemStats?.eventsToday || 0, icon: Calendar, color: 'text-blue-500', description: 'Created today' },
            { title: 'Events This Month', value: systemStats?.eventsMonth || 0, icon: Calendar, color: 'text-indigo-500', description: 'Current month total' },
            { title: 'Upcoming Events', value: systemStats?.upcomingEvents || 0, icon: Clock, color: 'text-green-500', description: 'Scheduled events' },
            { title: 'Cancelled / Failed', value: systemStats?.cancelledEvents || 0, icon: AlertCircle, color: 'text-red-500', description: 'Issue events' },
            { title: 'Peak Usage Time', value: systemStats?.peakUsageTime || 'N/A', icon: Activity, color: 'text-purple-500', description: 'Busiest hour' },
        ];
    }, [systemStats]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://10.95.4.70:5001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-name': user?.name || ''
                },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Failed to create user",
                    description: data.message || "Something went wrong.",
                });
                return;
            }

            toast({
                title: "User created",
                description: `Successfully created user ${name}`,
            });

            setName('');
            setEmail('');
            setPassword('');
            setRole('user');
            fetchUsers();
            fetchLogs();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to connect to the server.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`http://10.95.4.70:5001/api/auth/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-name': user?.name || ''
                }
            });

            if (res.ok) {
                toast({
                    title: "User deleted",
                    description: "The user has been removed successfully.",
                });
                fetchUsers();
                fetchLogs();
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete user.",
            });
        }
    };

    const handleUpdatePassword = async (userId: string) => {
        if (!newPassword) return;
        setLoading(true);

        try {
            const res = await fetch('http://10.95.4.70:5001/api/auth/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-name': user?.name || ''
                },
                body: JSON.stringify({ userId, newPassword }),
            });

            if (res.ok) {
                toast({
                    title: "Password updated",
                    description: "User password has been successfully updated.",
                });
                setEditingPassword(null);
                setNewPassword('');
                fetchUsers();
                fetchLogs();
            } else {
                const data = await res.json();
                toast({
                    variant: "destructive",
                    title: "Update failed",
                    description: data.message || "Failed to update password.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to connect to server.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('http://10.95.4.70:5001/api/auth/users/role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-name': user?.name || ''
                },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (res.ok) {
                toast({
                    title: "Role updated",
                    description: `User role changed to ${newRole}.`,
                });
                fetchUsers();
                fetchLogs();
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update role.",
            });
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${diffInDays}d ago`;
    };

    const getLogIcon = (action: string) => {
        if (action.includes('User created')) return UserPlus;
        if (action.includes('User deleted')) return Trash2;
        if (action.includes('Login')) return Globe;
        if (action.includes('Logout')) return EyeOff;
        if (action.includes('Password changed')) return Shield;
        if (action.includes('Event published')) return Calendar;
        if (action.includes('Event deleted')) return Trash2;
        if (action.includes('Role updated')) return Shield;
        return Activity;
    };

    if (user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-md text-center p-8">
                    <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
                    <CardDescription>
                        You do not have administrative privileges to access this page.
                    </CardDescription>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
                    <p className="text-muted-foreground">Global system management and user oversight</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 gap-1.5 bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    System Live
                </Badge>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-border shadow-soft">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <div className="space-y-8 h-fit">
                    <Card className="border-border shadow-elevated">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary" />
                                Create New User
                            </CardTitle>
                            <CardDescription>Add a new team member to the platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email ID</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter Email ID (e.g. john@example.com)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Initial Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">User Role</Label>
                                    <select
                                        id="role"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="user">Standard User</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create User'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>


                </div>

                {/* Users List */}
                <Card className="lg:col-span-2 border-border shadow-elevated">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Registered Users
                        </CardTitle>
                        <CardDescription>Manage existing accounts and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                Password
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={toggleAllPasswords}
                                                    title={allVisible ? "Hide all passwords" : "Show all passwords"}
                                                >
                                                    {allVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </Button>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u._id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{u.name}</span>
                                                    <span className="text-xs text-muted-foreground">Email: {u.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <select
                                                    className={`text-xs px-2 py-1 rounded border ${u.role === 'admin' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border'}`}
                                                    value={u.role}
                                                    onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                                    disabled={u.email === user?.email}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </TableCell>
                                            <TableCell>
                                                {editingPassword === u._id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            className="h-8 w-32"
                                                            placeholder="New password"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-2"
                                                            onClick={() => handleUpdatePassword(u._id)}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 px-2"
                                                            onClick={() => setEditingPassword(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded min-w-[100px] text-center">
                                                            {visiblePasswords.has(u._id) ? (u.plainPassword || '••••••••') : '••••••••'}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => togglePasswordVisibility(u._id)}
                                                                title={visiblePasswords.has(u._id) ? "Hide password" : "Show password"}
                                                            >
                                                                {visiblePasswords.has(u._id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => {
                                                                    setEditingPassword(u._id);
                                                                    setNewPassword(u.plainPassword || '');
                                                                }}
                                                                title="Change password"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {u.email !== user?.email && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteUser(u._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {users.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
