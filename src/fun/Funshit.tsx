import React, { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { Megaphone, Radio, Square, Clock, MessageSquareText, DollarSign } from "lucide-react";
import { db } from "../Firebase";

export const FunShit: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [duration, setDuration] = useState<number>(30);
    const [currentDuration, setCurrentDuration] = useState<number>(-1);
    const [sponsersDuration, setSponsersDuration] = useState<number>(30);
    const [currentSponsersDuration, setCurrentSponsersDuration] = useState<number>(-1);

    // Listen to current broadcast status from Firebase
    useEffect(() => {
        const durationRef = ref(db, "funshit/breakingNewsTimer");
        const unsubDuration = onValue(durationRef, (snapshot) => {
            if (snapshot.exists()) {
                setCurrentDuration(snapshot.val());
            } else {
                setCurrentDuration(-1);
            }
        });

        const sponsersRef = ref(db, "funshit/sponsersDuration");
        const unsubSponsers = onValue(sponsersRef, (snapshot) => {
            if (snapshot.exists()) {
                setCurrentSponsersDuration(snapshot.val());
            } else {
                setCurrentSponsersDuration(-1);
            }
        });

        return () => {
            unsubDuration();
            unsubSponsers();
        }
    }, []);

    // Active countdown loop when broadcast is live
    useEffect(() => {
        if (currentDuration <= 0) return;

        const timer = setInterval(() => {
            const nextValue = currentDuration - 1;
            const finalValue = nextValue <= 0 ? -1 : nextValue;
            set(ref(db, "funshit/breakingNewsTimer"), finalValue);
        }, 1000);

        return () => clearInterval(timer);
    }, [currentDuration]);

    useEffect(() => {
        if (currentSponsersDuration <= 0) return;

        const timer = setInterval(() => {
            const nextValue = currentSponsersDuration - 1;
            const finalValue = nextValue <= 0 ? -1 : nextValue;
            set(ref(db, "funshit/sponsersDuration"), finalValue);
        }, 1000);

        return () => clearInterval(timer);
    }, [currentSponsersDuration]);

    const handleSendBroadcast = () => {
        if (duration > 0 && message.trim() !== "") {
            // Write both the custom floating message and the duration timer
            set(ref(db, "funshit/breakingNewsTitle"), message);
            set(ref(db, "funshit/breakingNewsTimer"), duration);
        }
    };

    const handleSendSponser = () => {
        if (sponsersDuration > 0) {
            set(ref(db, "funshit/sponsersDuration"), sponsersDuration);
        }
    };

    const handleStopBroadcast = () => {
        set(ref(db, "funshit/breakingNewsTimer"), -1);
    };

    const handleStopSponser = () => {
        set(ref(db, "funshit/sponsersDuration"), -1);
    };

    const isLive = currentDuration > 0;
    const isSponsersLive = currentSponsersDuration > 0;

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 font-sans">

            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 mr-8">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-950/60 border border-red-800/60 rounded-xl text-red-500">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Broadcast Alert</h2>
                            <p className="text-xs text-zinc-400">Send immediate breaking news to all users</p>
                        </div>
                    </div>
                    {isLive && (
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded-full animate-pulse">
                            <Radio className="w-3.5 h-3.5" /> {currentDuration}s LIVE
                        </span>
                    )}
                </div>

                {/* Form Controls */}
                <div className="space-y-4">
                    {/* Text Input */}
                    <div>
                        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                            <MessageSquareText className="w-4 h-4 text-amber-400" /> Floating News Message
                        </label>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isLive}
                            placeholder="Enter alert text..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 disabled:opacity-50 transition-colors"
                        />
                    </div>

                    {/* Time Input */}
                    <div>
                        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" /> Broadcast Duration (Seconds)
                        </label>
                        <input
                            type="number"
                            min="5"
                            max="300"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            disabled={isLive}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-red-500 disabled:opacity-50 transition-colors"
                        />
                    </div>
                </div>

                {/* Big Action Button */}
                <div className="pt-2">
                    {isLive ? (
                        <button
                            type="button"
                            onClick={handleStopBroadcast}
                            className="w-full py-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-red-400 font-extrabold text-base uppercase tracking-wider border border-zinc-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Square className="w-5 h-5 fill-current" /> Stop Broadcast Immediately
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSendBroadcast}
                            className="w-full py-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-black text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-red-400/30"
                        >
                            <Radio className="w-6 h-6 animate-pulse" /> SEND BREAKING NEWS
                        </button>
                    )}
                </div>

            </div>
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 ml-8">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-950/60 border border-green-800/60 rounded-xl text-green-500">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Sponsers Alert</h2>
                            <p className="text-xs text-zinc-400">Send immediate sponsers to all users</p>
                        </div>
                    </div>
                    {isSponsersLive && (
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/40 rounded-full animate-pulse">
                            <Radio className="w-3.5 h-3.5" /> {currentSponsersDuration}s LIVE
                        </span>
                    )}
                </div>

                {/* Form Controls */}
                <div className="space-y-4">
                    {/* Time Input */}
                    <div>
                        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" /> Sponsers Duration (Seconds)
                        </label>
                        <input
                            type="number"
                            min="5"
                            max="300"
                            value={sponsersDuration}
                            onChange={(e) => setSponsersDuration(Number(e.target.value))}
                            disabled={isSponsersLive}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-green-500 disabled:opacity-50 transition-colors"
                        />
                    </div>
                </div>

                {/* Big Action Button */}
                <div className="pt-2">
                    {isSponsersLive ? (
                        <button
                            type="button"
                            onClick={handleStopSponser}
                            className="w-full py-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-green-400 font-extrabold text-base uppercase tracking-wider border border-zinc-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Square className="w-5 h-5 fill-current" /> Stop Sponsers Immediately
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSendSponser}
                            className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-black text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-emerald-400/30"
                        >
                            <Radio className="w-6 h-6 animate-pulse" /> SEND SPONSERS
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};