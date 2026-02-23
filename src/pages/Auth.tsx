import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider';

export default function Auth() {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { login, user } = useAuth();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/dashboard/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://10.95.4.70:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast({
                    variant: "destructive",
                    title: "Login failed",
                    description: data.message || "Please check your credentials.",
                });
                return;
            }

            toast({
                title: 'Welcome back!',
                description: `Successfully logged in as ${data.user.name}`,
            });
            login(data.user);
            navigate('/dashboard');
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong. Is the server running?",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>



            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
                {/* Logo/Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-slate-900/50 border border-slate-800 shadow-2xl mb-6 backdrop-blur-xl ring-1 ring-white/5 group transition-transform duration-500 hover:scale-105">
                        <img src="/company-logo.png" alt="Netlink Logo" className="w-20 h-20 object-contain brightness-110" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        Event Planner
                    </h1>
                    <p className="text-slate-400 font-medium">Organize your days with precision</p>
                </div>

                <Card className="bg-slate-900/50 border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden ring-1 ring-white/5">
                    <CardHeader className="pb-4 space-y-1">
                        <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Enter your credentials to access your account</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="login-email" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">User ID</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input
                                        id="login-email"
                                        type="text"
                                        placeholder="Enter your User ID"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 active:scale-[0.98]" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Logging in...</span>
                                    </div>
                                ) : 'Login'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
