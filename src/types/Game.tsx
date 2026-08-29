import React, { useEffect, useState } from "react";
import { child, get, onValue, ref } from "firebase/database";
import { db } from "../Firebase";
import { ArrowRight, Gamepad2, Radio, Skull, Trophy } from "lucide-react";
import type User from "./User";

export default interface Game {
    id: string;
    name: string;
    group: string;
    users: string[];
    winner?: number;
    winnerAdvance?: string;
    loserAdvance?: string;
    points?: number[];
    round: number;
    bracket: 'upper' | 'lower' | 'final';
    isLive?: boolean;
}

export const GameProfile: React.FC<{ game: Game, isTroll?: boolean, troll?: string }> = ({ game, isTroll, troll }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [trollUser, setTrollUser] = useState<User | undefined>();

    useEffect(() => {
        let isMounted = true;

        const fetchUsersData = async () => {
            try {
                const dbRef = ref(db, "/users");
                const userPromises = game.users.map(async (userId) => {
                    const userRef = child(dbRef, `/${userId}`);
                    const snapshot = await get(userRef);
                    return snapshot.exists() ? ({ id: userId, ...snapshot.val() } as User) : null;
                });

                const fetchedUsers = await Promise.all(userPromises);
                const validUsers = fetchedUsers.filter((u): u is User => u !== null);

                if (isMounted) {
                    setUsers(validUsers);
                }
            } catch (err) {
                console.error(`Failed to load users from game ${game.id}: `, err);
            }
        };

        fetchUsersData();

        return () => {
            isMounted = false;
        };
    }, [game.id, game.users]);

    useEffect(() => {
        const unsubTrollUser = onValue(ref(db, `users/${troll}`), (snapshot) => {
            if (snapshot.exists()) {
                setTrollUser({ id: troll, ...snapshot.val() });
            } else {
                setTrollUser(undefined);
            }
        });

        return () => {
            unsubTrollUser();
        }
    }, [troll]);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 font-sans">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-950 border border-indigo-800/50 rounded-lg text-indigo-400">
                            <Gamepad2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                                    {game.group}
                                </span>
                                {game.isLive && (
                                    <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 font-bold px-2 py-0.5 rounded-full animate-pulse">
                                        <Radio className="w-3 h-3" /> LIVE
                                    </span>
                                )}
                            </div>
                            <h4 className="text-2xl font-bold text-white tracking-wide">
                                {game.name}
                            </h4>
                        </div>
                    </div>
                </div>

                {(game.winnerAdvance || game.loserAdvance) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-2">
                        {game.winnerAdvance && (
                            <div className="flex items-center justify-between p-3 bg-gray-950 border border-emerald-900/40 rounded-lg text-xs">
                                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                                    <Trophy className="w-3.5 h-3.5" /> Winner Advances To:
                                </span>
                                <span className="text-gray-200 font-semibold flex items-center gap-1">
                                    {game.winnerAdvance} <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                                </span>
                            </div>
                        )}

                        {game.loserAdvance && (
                            <div className="flex items-center justify-between p-3 bg-gray-950 border border-amber-900/40 rounded-lg text-xs">
                                {game.loserAdvance == 'Eliminated'
                                    ? (
                                        <div>
                                            <span className="text-red-500 font-medium flex items-center gap-1.5">
                                                <Skull className="w-3.5 h-3.5" /> Loser is Eliminated
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-6 w-full">
                                            <span className="text-amber-400 font-medium flex items-center gap-1.5">
                                                <Skull className="w-3.5 h-3.5" /> Loser Next Game:
                                            </span>
                                            <span className="text-gray-200 font-semibold flex items-center gap-1">
                                                {game.loserAdvance} <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                                            </span>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                )
                }

                <br />

                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-3">
                    Participants & Final Scores
                </h3>

                <div className="space-y-3">
                    {users.map((user, i) => {
                        const isWinner = i === game.winner;

                        return (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isWinner
                                    ? 'bg-gray-800/80 border-yellow-500/50 shadow-md'
                                    : 'bg-gray-800/40 border-gray-800 hover:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`relative p-0.5 rounded-full border-2 ${isWinner ? 'border-yellow-400' : 'border-indigo-500'} overflow-hidden shrink-0`}>
                                        <img
                                            src={!isTroll ? user.avatar : trollUser?.avatar}
                                            alt={`${user.username}'s avatar`}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-lg text-white">
                                            {!isTroll ? user.username : trollUser?.username}
                                        </span>
                                        {!isTroll
                                            ? user?.title && (
                                                <span className="user-title text-xs text-zinc-400 ml-4 shrink-0">
                                                    {user.title}
                                                </span>
                                            )
                                            : trollUser?.title && (
                                                <span className="user-title text-xs text-zinc-400 ml-4 shrink-0">
                                                    {trollUser.title}
                                                </span>

                                            )}
                                        {isWinner && (
                                            <span className="text-xs font-bold px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
                                                WINNER
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {game.points && (
                                    <div className="score-wrapper font-digital flex items-center gap-1 font-mono text-xl font-bold text-yellow-400 tracking-wider">
                                        <span>{game.points[i]}</span>
                                        <span className="text-sm text-gray-400 font-sans">pts</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div >
        </div >
    );
};