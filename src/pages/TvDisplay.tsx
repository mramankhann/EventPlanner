import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeftCircle, ArrowRightCircle, Tv, Lock, AlertCircle, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { DaySchedule } from "@/types/schedule";

const API_URL = 'http://10.95.4.70:5001/api';

export default function TvDisplay() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isExpanded, setIsExpanded] = useState(false);
    const [pin, setPin] = useState("");
    const [verifiedUserId, setVerifiedUserId] = useState<string | null>(localStorage.getItem("tv_display_user_id"));
    const [verifiedUserName, setVerifiedUserName] = useState<string | null>(localStorage.getItem("tv_display_user_name"));
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [schedules, setSchedules] = useState<DaySchedule[]>([]);

    const fetchSchedules = useCallback(async (userId: string) => {
        try {
            const res = await fetch(`${API_URL}/schedules?_t=${Date.now()}`, {
                headers: {
                    'x-user-id': userId
                }
            });
            const data = await res.json();
            setSchedules(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (verifiedUserId) {
            fetchSchedules(verifiedUserId);
            const refreshTimer = setInterval(() => fetchSchedules(verifiedUserId), 2000);
            return () => clearInterval(refreshTimer);
        }
    }, [verifiedUserId, fetchSchedules]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            setError("Please enter a 4-digit code");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/auth/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: pin })
            });

            const data = await res.json();

            if (res.ok) {
                setVerifiedUserId(data.userId);
                setVerifiedUserName(data.userName);
                localStorage.setItem("tv_display_user_id", data.userId);
                localStorage.setItem("tv_display_user_name", data.userName);
            } else {
                setError(data.message || "Invalid code");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to quit?")) {
            setVerifiedUserId(null);
            setVerifiedUserName(null);
            setPin("");
            localStorage.removeItem("tv_display_user_id");
            localStorage.removeItem("tv_display_user_name");
        }
    };

    // Format today's date to matched the string format in data (DD/MM/YYYY)
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    const todaySchedule = schedules.find((s) => s.date === dateStr);
    const rawTasks = todaySchedule?.activities || [];

    const tasks = [...rawTasks].sort((a, b) => {
        const getScore = (status: string) => {
            switch (status) {
                case 'in progress': return 0;
                case 'upcoming': return 1;
                case 'cancelled': return 2;
                case 'done': return 3;
                default: return 4;
            }
        };

        const scoreA = getScore(a.status);
        const scoreB = getScore(b.status);

        if (scoreA !== scoreB) {
            return scoreA - scoreB;
        }

        return a.time.localeCompare(b.time);
    });

    if (!verifiedUserId) {
        return (
            <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden font-sans relative">
                {/* Enhanced Background Decor */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />
                </div>

                <Card className="w-full max-w-md bg-slate-900/40 border-slate-800/50 p-10 relative z-10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in duration-700">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-24 h-24 bg-slate-900/50 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl group transition-transform duration-500 hover:scale-110 backdrop-blur-xl ring-1 ring-white/5">
                            <img src="/company-logo.png" alt="Company Logo" className="w-14 h-14 object-contain brightness-110" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                            TV Display
                        </h1>
                        <p className="text-slate-400 text-lg font-medium">
                            Enter your 4-digit code to access
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-8">
                        <div className="flex flex-col items-center gap-4">
                            <InputOTP
                                maxLength={4}
                                value={pin}
                                onChange={(value) => setPin(value)}
                            >
                                <InputOTPGroup className="gap-3">
                                    <InputOTPSlot index={0} className="w-14 h-20 text-3xl bg-slate-950/50 border-slate-700 text-white rounded-xl" />
                                    <InputOTPSlot index={1} className="w-14 h-20 text-3xl bg-slate-950/50 border-slate-700 text-white rounded-xl" />
                                    <InputOTPSlot index={2} className="w-14 h-20 text-3xl bg-slate-950/50 border-slate-700 text-white rounded-xl" />
                                    <InputOTPSlot index={3} className="w-14 h-20 text-3xl bg-slate-950/50 border-slate-700 text-white rounded-xl" />
                                </InputOTPGroup>
                            </InputOTP>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || pin.length !== 4}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl rounded-2xl shadow-lg shadow-indigo-600/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                "Access Schedule"
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 flex flex-col items-center gap-4">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" />
                            Find your code in the Dashboard
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">

            {/* Content Panel (Left Side - ~35-40% width or Full Width) */}
            <div className={`${isExpanded ? 'w-full' : 'w-[38%] min-w-[500px]'} h-full bg-slate-950 text-white flex flex-col relative shadow-[20px_0_40px_-10px_rgba(0,0,0,0.5)] z-20 border-r border-slate-900 transition-all duration-500 ease-in-out`}>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute top-8 right-8 z-50 text-slate-400 hover:text-white transition-colors"
                >
                    {isExpanded ? <ArrowLeftCircle size={32} /> : <ArrowRightCircle size={32} />}
                </button>

                {/* Background Decor (Dark Theme) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10 h-full flex flex-col p-8">
                    {/* Header */}
                    <header className="mb-8 border-b border-slate-800 pb-6 pr-12">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-stone-200 mb-1">
                                    Netlink Welcomes
                                </h2>
                                <h1 className="text-4xl font-extrabold tracking-tight text-indigo-400">
                                    {todaySchedule?.companyName || "Project Agenda"}
                                </h1>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-3xl font-light tracking-tighter text-white leading-none">
                                    {format(currentTime, "HH:mm")}
                                </div>
                            </div>
                        </div>

                        <h2 className="text-slate-400 font-medium tracking-wider uppercase text-sm mb-1">
                            Today's Tasks
                        </h2>
                        <div className="text-slate-500 font-medium text-sm">
                            {format(currentTime, "EEEE, MMMM do, yyyy")}
                        </div>
                    </header>

                    {/* Task Grid - Adjust columns based on expansion */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                        {tasks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-slate-600"
                                    >
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-1 text-white">All Caught Up</h3>
                                <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
                                    No tasks scheduled for today.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3 grid-cols-1">
                                {tasks.map((task, index) => {
                                    const firstActiveIndex = tasks.findIndex(t => t.status === 'in progress' || t.status === 'upcoming');
                                    const firstDoneIndex = tasks.findIndex(t => t.status === 'done');

                                    const showStayHeader = index === firstActiveIndex;
                                    const showWrappedHeader = index === firstDoneIndex;

                                    return (
                                        <div key={task.id}>
                                            {showStayHeader && (
                                                <h3 className={`text-indigo-400 font-bold uppercase tracking-widest text-xs mb-3 ${index > 0 ? 'mt-4' : 'mt-1'}`}>
                                                    Stay a while
                                                </h3>
                                            )}
                                            {showWrappedHeader && (
                                                <h3 className={`text-indigo-400 font-bold uppercase tracking-widest text-xs mb-3 ${index > 0 ? 'mt-8' : 'mt-1'}`}>
                                                    Wrapped up
                                                </h3>
                                            )}
                                            <Card
                                                className="bg-white/5 border-white/5 shadow-none p-4 flex flex-row items-center gap-4 group hover:bg-white/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                {/* Time Pillar */}
                                                <div className="flex flex-col items-center justify-center min-w-[70px] border-r border-white/10 pr-4 pl-1">
                                                    <span className="text-lg font-bold tracking-tight text-white">
                                                        {task.time.split(' ')[0]}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
                                                        {task.time.split(' ')[1] || ''}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                                    <h3 className="text-lg font-bold leading-tight truncate text-white group-hover:text-indigo-400 transition-colors">
                                                        {task.title}
                                                    </h3>
                                                    <div className="flex-shrink-0">
                                                        <StatusBadge status={task.status} />
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-slate-600 text-[10px] uppercase tracking-wider">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 hover:text-white transition-colors group"
                        >
                            <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-red-500/70" />
                            <span>Quit Display</span>
                        </button>
                        <span>{tasks.length} Tasks</span>
                    </footer>
                </div>
            </div>

            {/* Right Side - Pure White Filler */}
            <div className={`flex-1 bg-white h-full transition-all duration-500 ease-in-out ${isExpanded ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'}`} />

        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        done: "bg-emerald-400 text-emerald-950 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]",
        "in progress": "bg-blue-400 text-blue-950 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.4)]",
        upcoming: "bg-slate-200 text-slate-900 border-slate-300",
        cancelled: "bg-red-400 text-red-950 border-red-400",
    };

    const labels = {
        done: "Completed",
        "in progress": "In Progress",
        upcoming: "Upcoming",
        cancelled: "Cancelled",
    };

    const currentStyle = styles[status as keyof typeof styles] || styles.upcoming;
    const label = labels[status as keyof typeof labels] || status;

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${currentStyle}`}>
            {label}
        </span>
    );
}
