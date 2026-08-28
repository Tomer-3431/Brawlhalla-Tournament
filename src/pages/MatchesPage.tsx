import { useEffect, useRef, useState } from "react";
import type Game from "../Game";
import type User from "../User";
import { onValue, ref } from "firebase/database";
import { db } from "../Firebase";
import React from "react";
import { Trophy } from "lucide-react";
import { GameProfile } from "../Game";
import { createPortal } from "react-dom";
import type Connection from "../Connection";

export const MatchesPages: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [users, setUsers] = useState<Record<string, User>>({});
    const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
    const [lines, setLines] = useState<Array<{ id: string; path: string; isHighlighted: boolean; type: "winner" | "loser" | "final" }>>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const gameRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        // 1. Fetch Users
        const unsubUsers = onValue(ref(db, "users"), (snapshot) => {
            if (snapshot.exists()) {
                setUsers(snapshot.val());
            }
        });

        // 2. Fetch Games (Fixed syntax array/object parsing)
        const unsubGames = onValue(ref(db, "games"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const gamesArray: Game[] = Array.isArray(data)
                    ? data
                    : Object.keys(data).map((key) => ({ id: key, ...data[key] }));
                setGames(gamesArray);
            }
        });

        // 3. Fetch Connections
        const unsubConnections = onValue(ref(db, "connections"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const connectionsArray: Connection[] = Array.isArray(data)
                    ? data
                    : Object.keys(data).map((key) => ({ id: key, ...data[key] }));
                setConnections(connectionsArray);
            }
        });

        return () => {
            unsubGames();
            unsubUsers();
            unsubConnections();
        };
    }, []);

    const updateLines = () => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();

        const calculatedLines = connections.map((conn) => {
            const fromEl = gameRefs.current[conn.fromGameId];
            const toEl = gameRefs.current[conn.toGameId];

            if (!fromEl || !toEl) return null;

            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();

            let startX: number;
            let startY: number;
            let endX: number;
            let endY: number;
            let path: string;

            if (conn.type !== 'final') {
                startX = fromRect.right - containerRect.left;
                startY = fromRect.top + fromRect.height / 2 - containerRect.top;
                endX = toRect.left - containerRect.left;
                endY = toRect.top + toRect.height / 2 - containerRect.top;
                const controlX = startX + (endX - startX) / 2;
                path = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;
            } else {
                startX = fromRect.left + fromRect.width / 2 - containerRect.left;
                startY = fromRect.bottom - containerRect.top;
                endX = toRect.left + toRect.width / 2 - containerRect.left;
                endY = toRect.top - containerRect.top;
                const controlY = startY + (endY - startY) / 2;
                path = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;
            }

            const fromGame = games.find((g) => g.id === conn.fromGameId);
            const toGame = games.find((g) => g.id === conn.toGameId);

            // Extract user IDs from both games (supports arrays of objects or strings)
            const fromUserIds = (fromGame?.users || []).map((u: any) => typeof u === "string" ? u : u.id);
            const toUserIds = (toGame?.users || []).map((u: any) => typeof u === "string" ? u : u.id);

            const isHighlighted = hoveredUserId != null
                ? fromGame != undefined && toGame != undefined && fromUserIds.includes(hoveredUserId) && toUserIds.includes(hoveredUserId)
                && fromGame.winner != undefined && (
                    conn.type === 'winner' && fromGame.users[fromGame.winner] === hoveredUserId
                    || conn.type === 'loser' && fromGame.users[fromGame.winner] !== hoveredUserId
                    || conn.type === 'final'
                )
                : false;

            return {
                id: `${conn.fromGameId}-${conn.toGameId}`,
                path,
                isHighlighted,
                type: conn.type,
            };
        }).filter(Boolean) as Array<{ id: string; path: string; isHighlighted: boolean; type: "winner" | "loser" | "final" }>;

        setLines(calculatedLines);
    };

    useEffect(() => {
        updateLines();
    }, [games, connections, hoveredUserId]);

    const rounds = [1, 2, 3, 4, 5, 6];

    return (
        <div className="w-full h-full text-white p-6 select-none font-sans" onScroll={updateLines}>
            <h2 className="text-xl font-bold mb-6 text-zinc-100 flex items-center gap-2">
                🏆 Double Elimination Bracket
            </h2>

            <center>
                <div ref={containerRef} className="relative gap-12 min-w-[800px] pt-4 pb-12">
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 overflow-visible">
                        <defs>
                            <marker id="arrow-winner" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                            </marker>
                            <marker id="arrow-loser" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#d81616" />
                            </marker>
                            <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                            </marker>
                            <marker id="arrow-final" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#e2d40f" />
                            </marker>
                        </defs>
                        {lines.map((line) => (
                            <path
                                key={line.id}
                                d={line.path}
                                fill="none"
                                stroke={
                                    line.isHighlighted
                                        ? "#f7f310"
                                        : line.type === 'final'
                                            ? "#f5de0b"
                                            : line.type === "winner"
                                                ? "#6366f1"
                                                : "#f43f5e"
                                }
                                strokeWidth={line.isHighlighted ? 2.5 : 1.5}
                                strokeDasharray={line.type === "loser" ? "4,4" : undefined}
                                markerEnd={
                                    line.isHighlighted
                                        ? "url(#arrow-active)"
                                        : line.type === 'final'
                                            ? "url(#arrow-final)"
                                            : line.type === "winner"
                                                ? "url(#arrow-winner)"
                                                : "url(#arrow-loser)"
                                }
                                className="transition-colors duration-150"
                            />
                        ))}
                    </svg>

                    <div className="flex gap-10 items-stretch">
                        {rounds.map((r, i) => {
                            const isFinalRound = i === rounds.length - 1;
                            const roundGames = games.filter((g) => g.round === r);
                            const upperGames = roundGames.filter((g) => g.bracket === 'upper');
                            const lowerGames = roundGames.filter((g) => g.bracket === 'lower');
                            const finalGames = roundGames.filter((g) => g.bracket === 'final');

                            return (
                                <React.Fragment key={r}>
                                    <div className={`flex-1 flex flex-col min-w-[220px] z-20 ${isFinalRound ? "max-w-[280px]" : ""}`}>
                                        <div className={`text-center py-2.5 rounded-md mb-6 border ${isFinalRound
                                            ? "bg-amber-950/20 border-amber-500/30 text-amber-400"
                                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                                            }`}>
                                            {isFinalRound ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Trophy className="w-4 h-4 text-amber-400" />
                                                    <span className="font-black text-xs tracking-widest uppercase">Grand Final</span>
                                                </div>
                                            ) : (
                                                <span className="font-semibold text-xs uppercase tracking-wider">Round {r}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-around gap-6">
                                            {finalGames.length > 0 && (
                                                <div className="space-y-4">
                                                    {finalGames.map((game) => (
                                                        <GameCard
                                                            key={game.id}
                                                            game={game}
                                                            users={users}
                                                            hoveredUserId={hoveredUserId}
                                                            onHoverUser={setHoveredUserId}
                                                            innerRef={(el) => (gameRefs.current[game.id] = el)}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {upperGames.length > 0 && (
                                                <div className="space-y-4">
                                                    <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider mb-2">
                                                        Upper Bracket
                                                    </div>
                                                    {upperGames.map((game) => (
                                                        <GameCard
                                                            key={game.id}
                                                            game={game}
                                                            users={users}
                                                            hoveredUserId={hoveredUserId}
                                                            onHoverUser={setHoveredUserId}
                                                            innerRef={(el) => (gameRefs.current[game.id] = el)}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {lowerGames.length > 0 && (
                                                <div className="space-y-4 pt-6">
                                                    {upperGames.length > 0 && (<div className="space-y-4 pt-6 border-t border-zinc-800/80" />)}
                                                    <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">
                                                        Lower Bracket
                                                    </div>
                                                    {lowerGames.map((game) => (
                                                        <GameCard
                                                            key={game.id}
                                                            game={game}
                                                            users={users}
                                                            hoveredUserId={hoveredUserId}
                                                            onHoverUser={setHoveredUserId}
                                                            innerRef={(el) => (gameRefs.current[game.id] = el)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </center>
        </div>
    );
};

interface GameCardProps {
    game: Game;
    users: Record<string, User>;
    hoveredUserId: string | null;
    onHoverUser: (userId: string | null) => void;
    innerRef: (el: HTMLDivElement | null) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, users, hoveredUserId, onHoverUser, innerRef }) => {
    const participantList = game.users || [];

    // Resolve user IDs and User objects whether elements in game.users are strings or objects
    const resolvedParticipants = participantList.map((userItem: any) => {
        if (typeof userItem === "object" && userItem !== null) {
            return {
                id: userItem.id || userItem.uid,
                userObj: userItem
            };
        }
        return {
            id: userItem,
            userObj: users[userItem]
        };
    });

    const isUserInGame = hoveredUserId ? resolvedParticipants.some((p) => p.id === hoveredUserId) : false;
    const [isOpen, setOpen] = useState(false);

    return (
        <div>
            <div
                onClick={() => setOpen(true)}
                ref={innerRef}
                className={`cursor-pointer bg-zinc-900 border rounded-lg p-2.5 shadow-md transition-all ${isUserInGame
                    ? "border-amber-500/80 ring-1 ring-amber-500/20"
                    : game.bracket === 'final'
                        ? "border-amber-500/30 hover:border-amber-400"
                        : game.bracket === 'upper'
                            ? "border-cyan-800 hover:border-cyan-500"
                            : "border-rose-900 hover:border-rose-600"
                    }`}
            >
                <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-2 font-mono border-b border-zinc-800/60 pb-1.5">
                    <span className="font-semibold text-zinc-300">{game.name || game.id}</span>
                </div>

                <div className="space-y-1.5">
                    {resolvedParticipants.length === 0 ? (
                        <div className="text-xs text-zinc-600 italic py-1">TBD</div>
                    ) : (
                        resolvedParticipants.map(({ id: userId, userObj }, i) => {
                            const scoreSet1 = game.points?.[i] ?? 0;
                            const isWinner = game.winner === i;
                            const isHovered = userId && userId === hoveredUserId;

                            return (
                                <div
                                    key={`${userId || i}-${i}`}
                                    onMouseEnter={() => userId && onHoverUser(userId)}
                                    onMouseLeave={() => onHoverUser(null)}
                                    className={`flex items-center justify-between p-1.5 rounded transition-colors cursor-pointer ${isHovered
                                        ? "bg-zinc-800 text-white"
                                        : isWinner
                                            ? "bg-indigo-950/40 text-indigo-300 font-semibold"
                                            : "bg-zinc-950/70 text-zinc-300 hover:bg-zinc-800/60"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {userObj?.avatar ? (
                                            <img src={userObj.avatar} alt="" className="w-4 h-4 rounded-full shrink-0" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full bg-zinc-800 shrink-0" />
                                        )}
                                        <span className="text-xs truncate">
                                            {userObj?.username || userObj?.name || userId || "TBD"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <span className={game.bracket === 'final' ? "text-xs font-mono font-bold px-1.5 py-0.5 bg-amber-950/40 rounded border border-amber-800/50 text-amber-300"
                                            : "text-xs font-mono font-bold px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-zinc-200"}>
                                            {scoreSet1}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {isOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full shadow-2xl relative lg:max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GameProfile game={game} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};