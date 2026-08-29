import React, { useEffect, useState } from "react";
import { child, get, onValue, ref } from "firebase/database";
import { ChevronDown, ChevronUp, Gamepad2, Trophy, Users } from "lucide-react";
import type Game from "./Game";
import { GameProfile } from "./Game";
import type User from "./User";
import { UserProfile } from "./User";
import { db } from "../Firebase";

export default interface Group {
    id: string;
    name: string;
    users: string[];
    games: string[];
}

// Map top 3 ranks to specific trophy colors
const TROPHY_COLORS: Record<number, string> = {
    1: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    2: "text-slate-300 border-slate-400/30 bg-slate-400/10",
    3: "text-amber-700 border-amber-700/30 bg-amber-700/10",
};

export const GroupProfile: React.FC<{ group: Group, isTroll?: boolean, troll?: string }> = ({ group, isTroll, troll }) => {
    const [activeTab, setActiveTab] = useState<"members" | "games">("members");
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    var userList: { User: User, score: number, win: number, lose: number }[] = [];

    const [trollUser, setTrollUser] = useState<User | undefined>();

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const dbRef = ref(db);

                // Fetch & Rank Users by Score (Descending)
                if (group.users?.length) {
                    const userPromises = group.users.map(async (userId) => {
                        const snapshot = await get(child(dbRef, `users/${userId}`));
                        return snapshot.exists() ? ({ id: userId, ...snapshot.val() } as User) : null;
                    });
                    const fetchedUsers = (await Promise.all(userPromises)).filter((u): u is User => u !== null);

                    if (isMounted) setUsers(fetchedUsers);
                }

                // Fetch Games
                if (group.games?.length) {
                    const gamePromises = group.games.map(async (gameId) => {
                        const snapshot = await get(child(dbRef, `games/${gameId}`));
                        return snapshot.exists() ? ({ id: gameId, ...snapshot.val() } as Game) : null;
                    });
                    const fetchedGames = (await Promise.all(gamePromises)).filter((g): g is Game => g !== null);
                    fetchedGames.sort((a, b) => a.name.localeCompare(b.name));
                    if (isMounted) setGames(fetchedGames);
                }
            } catch (err) {
                console.error(`Failed to load data for group ${group.id}: `, err);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [group.id, group.users, group.games]);

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

    users.forEach((user) => {
        let score = 0;
        let win = 0;
        let lose = 0;

        games.forEach((game) => {
            if (game.points != null && game.users.includes(user.id)) {
                score += game.points[game.users.indexOf(user.id)];
            }
            if (game.users.includes(user.id) && game.winner !== undefined) {
                if (game.users[game.winner] == user.id) {
                    win++;
                } else {
                    lose++;
                }
            }
        })

        if (!isTroll) {
            userList = [...userList, { User: user, score: score, win: win, lose: lose }];
        } else {
            userList = [...userList, { User: trollUser!, score: score, win: win, lose: lose }];
        }
    });

    return (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden font-sans text-zinc-100">
            {/* Header / Collapse Bar */}
            <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title={isCollapsed ? "Expand group" : "Collapse group"}
                    >
                        {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                    <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                        {group.name}
                    </h2>
                </div>

                {!isCollapsed && (
                    <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-md text-xs">
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors font-medium ${activeTab === 'members'
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>Members ({group.users?.length ?? 0})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('games')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors font-medium ${activeTab === 'games'
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            <Gamepad2 className="w-3.5 h-3.5" />
                            <span>Games ({group.games?.length ?? 0})</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Collapsible Content Section */}
            {!isCollapsed && (
                <div className="p-4 bg-zinc-950/40">
                    {activeTab === "members" && (
                        <div className="space-y-2">
                            {userList.map((user, i) => {
                                const rank = i + 1;
                                const isTopThree = rank <= 3;

                                return (
                                    <div className="flex-1 min-w-0" key={user.User.id}>
                                        <UserProfile user={user.User} winRatio={{ win: user.win, lose: user.lose }} score={user.score} leading={
                                            <div className="flex items-center justify-center w-8 shrink-0">
                                                {isTopThree ? (
                                                    <div
                                                        className={`flex items-center justify-center w-7 h-7 rounded border text-xs font-bold ${TROPHY_COLORS[rank]}`}
                                                        title={`Rank #${rank}`}
                                                    >
                                                        <Trophy className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-mono font-medium text-zinc-500">
                                                        #{rank}
                                                    </span>
                                                )}
                                            </div>
                                        } />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === "games" && (
                        <div className="space-y-3">
                            {games.map((game) => (
                                <GameProfile key={game.id} game={game} isTroll={isTroll} troll={troll} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};