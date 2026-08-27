import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { Radio, Trophy } from "lucide-react";
import type Game from "../Game";
import type User from "../User";
import { db } from "../Firebase";

export default function Home() {
    const [liveGames, setLiveGames] = useState<Game[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, User>>({});

    useEffect(() => {
        const unsubGames = onValue(ref(db, "games"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: Game[] = Object.keys(data)
                    .map((id) => ({ id, ...data[id] }))
                    .filter((g) => g.isLive);
                setLiveGames(list);
            } else {
                setLiveGames([]);
            }
        });

        const unsubUsers = onValue(ref(db, "users"), (snapshot) => {
            if (snapshot.exists()) {
                setUsersMap(snapshot.val());
            }
        });

        return () => {
            unsubGames();
            unsubUsers();
        };
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto p-6 space-y-8 font-sans">
            <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    Tournament Dashboard
                </h2>
                <p className="text-zinc-400 text-sm mt-1">Real-time match status and active games</p>
            </div>

            {/* Live Matches Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                        Matches Live Now
                    </h3>
                    {liveGames.length > 0 && (
                        <span className="ml-2 text-xs font-mono font-bold px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                            {liveGames.length} ACTIVE
                        </span>
                    )}
                </div>

                {liveGames.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-zinc-500 space-y-2">
                        <Radio className="w-8 h-8 mx-auto text-zinc-700" />
                        <p className="font-medium text-sm">No live games being played right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {liveGames.map((game) => (
                            <div
                                key={game.id}
                                className="bg-zinc-900 border border-red-500/30 rounded-xl p-5 shadow-xl relative overflow-hidden"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                                            {game.group || "Match"} • Round {game.round}
                                        </span>
                                        <h4 className="text-lg font-bold text-white">{game.name}</h4>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded-full animate-pulse">
                                        <Radio className="w-3.5 h-3.5" /> LIVE
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {(game.users || []).map((userId, idx) => {
                                        const userObj = usersMap[userId];
                                        const score = game.points?.[idx] ?? 0;
                                        const isWinner = game.winner === idx;

                                        return (
                                            <div
                                                key={`${userId}-${idx}`}
                                                className={`flex items-center justify-between p-2.5 rounded-lg border ${
                                                    isWinner
                                                        ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                                                        : "bg-zinc-950/70 border-zinc-800 text-zinc-200"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {userObj?.avatar ? (
                                                        <img
                                                            src={userObj.avatar}
                                                            alt=""
                                                            className="w-7 h-7 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                                                            ?
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-semibold truncate">
                                                        {userObj?.username || userId || "TBD"}
                                                    </span>
                                                    {isWinner && (
                                                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                                    )}
                                                </div>
                                                <span className="font-mono text-base font-bold text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                                    {score}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}