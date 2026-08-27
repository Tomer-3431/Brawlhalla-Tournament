import React, { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { Radio } from "lucide-react";
import type Game from "../Game";
import type User from "../User";
import { db } from "../Firebase";
import { updateGameLive } from "./utils";

export const GameLiveEditor: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, User>>({});
    const [selectedGameId, setSelectedGameId] = useState<string>("");
    const [points, setPoints] = useState<number[]>([]);
    const [winner, setWinner] = useState<number | undefined>(undefined);

    useEffect(() => {
        const unsubscribeGames = onValue(ref(db, "games"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: Game[] = Object.keys(data).map((id) => ({ id, ...data[id] }));
                setGames(list);
                if (!selectedGameId && list.length > 0) {
                    setSelectedGameId(list[0].id);
                }
            } else {
                setGames([]);
            }
        });

        const unsubscribeUsers = onValue(ref(db, "users"), (snapshot) => {
            if (snapshot.exists()) {
                setUsersMap(snapshot.val());
            }
        });

        return () => {
            unsubscribeGames();
            unsubscribeUsers();
        };
    }, []);

    const activeGame = games.find((g) => g.id === selectedGameId);

    useEffect(() => {
        if (activeGame) {
            const gameUsers = activeGame.users || [];
            setPoints(activeGame.points || gameUsers.map(() => 0));
            setWinner(activeGame.winner);
        }
    }, [selectedGameId, activeGame]);

    const handleToggleLive = () => {
        if (!activeGame) return;
        const nextStatus = !activeGame.isLive;
        update(ref(db, `games/${activeGame.id}`), { isLive: nextStatus });
    };

    const handleScoreChange = (index: number, delta: number) => {
        const updated = [...points];
        updated[index] = Math.max(0, (updated[index] || 0) + delta);
        setPoints(updated);
        if (activeGame) updateGameLive(activeGame.id, updated, winner);
    };

    const handleSetWinner = (index: number) => {
        const nextWinner = winner === index ? -1 : index;
        setWinner(nextWinner);
        if (activeGame) updateGameLive(activeGame.id, points, nextWinner);
    };

    const handleToggleElimination = (userId: string) => {
        const currentUser = usersMap[userId];
        if (!currentUser) return;
        const newStatus = !currentUser.isEliminated;
        update(ref(db, `users/${userId}`), { isEliminated: newStatus });
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Select Live Game
                </label>
                <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                >
                    <option value="">-- Select Game --</option>
                    {games.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.name || g.id} {g.isLive ? "🔴 (LIVE)" : ""} ({(g.users || []).length} users)
                        </option>
                    ))}
                </select>
            </div>

            {/* Live Controls Header & Status Toggle */}
            {activeGame ? (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-300 uppercase">
                                Live Controls: {activeGame.name || activeGame.id}
                            </h3>
                            <span className="text-xs text-zinc-500 font-normal">
                                {(activeGame.users || []).length} Participants
                            </span>
                        </div>

                        {/* Live Status Toggle */}
                        <button
                            type="button"
                            onClick={handleToggleLive}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                                activeGame.isLive
                                    ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 animate-pulse"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                            }`}
                        >
                            <Radio className="w-4 h-4" />
                            {activeGame.isLive ? "END LIVE BROADCAST" : "SET MATCH LIVE"}
                        </button>
                    </div>

                    {(activeGame.users || []).length === 0 ? (
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-500 italic text-center">
                            No users in this game yet. Add users to this game in the Game Editor to edit live scores.
                        </div>
                    ) : (
                        (activeGame.users || []).map((userId, idx) => {
                            const userObj = usersMap[userId];
                            const isEliminated = userObj?.isEliminated ?? false;

                            return (
                                <div
                                    key={userId}
                                    className={`flex items-center justify-between p-4 bg-zinc-950 border rounded-lg transition-all ${
                                        winner === idx ? "border-amber-500/50" : "border-zinc-800"
                                    } ${isEliminated ? "opacity-60 bg-red-950/10" : ""}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {userObj?.avatar ? (
                                            <img
                                                src={userObj.avatar}
                                                alt={userObj.username}
                                                className={`w-10 h-10 rounded-full object-cover border ${
                                                    isEliminated ? "border-red-800 filter grayscale" : "border-zinc-700"
                                                }`}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 border border-zinc-700">
                                                ?
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className={`font-semibold ${isEliminated ? "line-through text-zinc-400" : "text-white"}`}>
                                                {userObj?.username || userId}
                                            </span>
                                            {isEliminated && (
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-red-500">
                                                    Eliminated
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleScoreChange(idx, -1)}
                                                className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 font-bold text-white"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center font-mono text-xl font-bold text-amber-400">
                                                {points[idx] ?? 0}
                                            </span>
                                            <button
                                                onClick={() => handleScoreChange(idx, 1)}
                                                className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 font-bold text-white"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleSetWinner(idx)}
                                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                                                winner === idx
                                                    ? "bg-amber-500 text-zinc-950"
                                                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                                            }`}
                                        >
                                            {winner === idx ? "WINNER" : "Set Winner"}
                                        </button>

                                        <button
                                            onClick={() => handleToggleElimination(userId)}
                                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                                                isEliminated
                                                    ? "bg-red-950/60 text-red-400 border-red-800 hover:bg-red-900/80"
                                                    : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-red-400 hover:border-red-900"
                                            }`}
                                        >
                                            {isEliminated ? "Eliminated" : "Eliminate"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <p className="text-zinc-500 text-sm">Select a game from the dropdown to edit live scores.</p>
            )}
        </div>
    );
};
