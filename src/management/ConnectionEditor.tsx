import React, { useState, useEffect } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { Plus, Trash2, GitCommit, ArrowRight, RefreshCw } from "lucide-react";
import type Connection from "../Connection";
import type Game from "../Game";
import { db } from "../Firebase";
import { createConnection, updateConnection, deleteConnection } from "./utils";

export const ConnectionEditor: React.FC = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
    const [filterGameId, setFilterGameId] = useState<string>("");

    // Load Connections & Games from Firebase
    useEffect(() => {
        const unsubConnections = onValue(ref(db, "connections"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: Connection[] = Object.keys(data).map((id) => ({ id, ...data[id] }));
                setConnections(list);
            } else setConnections([]);
        });

        const unsubGames = onValue(ref(db, "games"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: Game[] = Object.keys(data).map((id) => ({ id, ...data[id] }));
                list.sort((a, b) => a.name.localeCompare(b.name));
                setGames(list);
            } else setGames([]);
        });

        return () => {
            unsubConnections();
            unsubGames();
        };
    }, []);

    const handleCreateNew = async () => {
        const newConnectionData: Omit<Connection, "id"> = {
            fromGameId: games[0]?.id || "",
            toGameId: games[1]?.id || "",
            type: "winner"
        };
        const newId = await createConnection(newConnectionData);
        if (newId) {
            setSelectedConnection({ id: newId, ...newConnectionData });
        }
    };

    const handleDelete = async (connectionId: string) => {
        if (confirm("Are you sure you want to delete this connection?")) {
            await deleteConnection(connectionId);
            setSelectedConnection(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedConnection) {
            await updateConnection(selectedConnection.id, selectedConnection);
            alert("Connection saved successfully.");
        }
    };

    // Filter connections list by selected game filter
    const filteredConnections = filterGameId
        ? connections.filter((c) => c.fromGameId === filterGameId || c.toGameId === filterGameId)
        : connections;

    const getGameName = (id: string) => games.find((g) => g.id === id)?.name || id;

    const connectionsList: Connection[] = [
        { id: "C0", fromGameId: "M0", toGameId: "M3", type: "loser" },
        { id: "C1", fromGameId: "M0", toGameId: "M4", type: "loser" },
        { id: "C2", fromGameId: "M0", toGameId: "M2", type: "winner" },
        { id: "C3", fromGameId: "M1", toGameId: "M3", type: "loser" },
        { id: "C4", fromGameId: "M1", toGameId: "M5", type: "winner" },
        { id: "C5", fromGameId: "M2", toGameId: "M4", type: "loser" },
        { id: "C6", fromGameId: "M2", toGameId: "M5", type: "winner" },
        { id: "C7", fromGameId: "M3", toGameId: "M6", type: "winner" },
        { id: "C8", fromGameId: "M4", toGameId: "M6", type: "winner" },
        { id: "C9", fromGameId: "M5", toGameId: "M7", type: "loser" },
        { id: "C10", fromGameId: "M5", toGameId: "F1", type: "winner" },
        { id: "C11", fromGameId: "M6", toGameId: "M7", type: "winner" },
        { id: "C12", fromGameId: "M7", toGameId: "F1", type: "winner" },
        { id: "C13", fromGameId: "F1", toGameId: "F2", type: "final" },
    ];

    const matchesList: Game[] = [
        { id: "M0", name: "Match 0", group: "Double Elimination", users: [], round: 0, bracket: 'upper', winnerAdvance: 'Match 2', loserAdvance: 'Loser Bracket' },
        { id: "M1", name: "Match 1", group: "Double Elimination", users: [], round: 1, bracket: 'upper', winnerAdvance: 'Match 5', loserAdvance: 'Match 3' },
        { id: "M2", name: "Match 2", group: "Double Elimination", users: [], round: 1, bracket: 'upper', winnerAdvance: 'Match 5', loserAdvance: 'Match 4' },
        { id: "M3", name: "Match 3", group: "Double Elimination", users: [], round: 2, bracket: 'lower', winnerAdvance: 'Match 6', loserAdvance: 'Eliminated' },
        { id: "M4", name: "Match 4", group: "Double Elimination", users: [], round: 2, bracket: 'lower', winnerAdvance: 'Match 6', loserAdvance: 'Eliminated' },
        { id: "M5", name: "Match 5", group: "Double Elimination", users: [], round: 2, bracket: 'upper', winnerAdvance: 'Final 1', loserAdvance: 'Match 7' },
        { id: "M6", name: "Match 6", group: "Double Elimination", users: [], round: 3, bracket: 'lower', winnerAdvance: 'Match 7', loserAdvance: 'Eliminated' },
        { id: "M7", name: "Match 7", group: "Double Elimination", users: [], round: 4, bracket: 'lower', winnerAdvance: 'Final 1', loserAdvance: 'Eliminated' },
        { id: "F1", name: "Final 1", group: "Finals", users: [], round: 5, bracket: 'final' },
        { id: "F2", name: "Final 2", group: "Finals", users: [], round: 5, bracket: 'final' },
    ];

    async function resetMatches() {
        for (const match of matchesList) {
            const gameRef = ref(db, `games/${match.id}`);
            try {
                await remove(gameRef);
                await set(gameRef, match);
            } catch (err) {
                console.error(`Failed to sync ${match.id}:`, err);
            }
        }
    }

    async function resetConnections() {
        for (const connection of connectionsList) {
            const connectionRef = ref(db, `connections/${connection.id}`);
            try {
                await remove(connectionRef);
                await set(connectionRef, connection);
            } catch (err) {
                console.error(`Failed to sync ${connection.id}:`, err);
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Top Bar with Header Action Button & Main Controls */}
            <div className="space-y-4 border-b border-zinc-800 pb-4">
                {/* Header Row with Top Action Button */}
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                        <GitCommit className="w-5 h-5 text-indigo-400" /> Bracket Connections
                    </h2>

                    {/* Top Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                resetConnections();
                                resetMatches();
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-semibold text-zinc-300 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reset Arrows and Matches
                        </button>

                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-bold text-white shrink-0 shadow transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Create Connection
                        </button>
                    </div>
                </div>

                {/* Control Bar: Selectors */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex-1 flex gap-2">
                        <select
                            value={selectedConnection?.id || ""}
                            onChange={(e) => {
                                const c = connections.find((item) => item.id === e.target.value);
                                setSelectedConnection(c || null);
                            }}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white text-xs"
                        >
                            <option value="">-- Select Connection --</option>
                            {filteredConnections.map((c) => (
                                <option key={c.id} value={c.id}>
                                    [{c.type.toUpperCase()}] {getGameName(c.fromGameId)} ➔ {getGameName(c.toGameId)} ({c.id})
                                </option>
                            ))}
                        </select>

                        {/* Filter by Game */}
                        <select
                            value={filterGameId}
                            onChange={(e) => setFilterGameId(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-400 text-xs shrink-0"
                        >
                            <option value="">All Games</option>
                            {games.map((g) => (
                                <option key={g.id} value={g.id}>
                                    Filter: {g.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Editing Form */}
            {selectedConnection && (
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            Editing Connection: {selectedConnection.id}
                        </h3>
                        <button
                            type="button"
                            onClick={() => handleDelete(selectedConnection.id)}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Connection
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Source Game Selection */}
                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">From Game (Source)</label>
                            <select
                                value={selectedConnection.fromGameId}
                                onChange={(e) => setSelectedConnection({ ...selectedConnection, fromGameId: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white text-xs"
                            >
                                <option value="">-- Select Source Game --</option>
                                {games.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} ({g.id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Destination Game Selection */}
                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">To Game (Destination)</label>
                            <select
                                value={selectedConnection.toGameId}
                                onChange={(e) => setSelectedConnection({ ...selectedConnection, toGameId: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white text-xs"
                            >
                                <option value="">-- Select Destination Game --</option>
                                {games.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} ({g.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Connection Type */}
                    <div>
                        <label className="text-xs text-zinc-400 block mb-1">Connection Advancement Type</label>
                        <select
                            value={selectedConnection.type}
                            onChange={(e) =>
                                setSelectedConnection({
                                    ...selectedConnection,
                                    type: e.target.value as "winner" | "loser" | "final"
                                })
                            }
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white text-xs"
                        >
                            <option value="winner">Winner Advancement (Solid Line / Indigo)</option>
                            <option value="loser">Loser Advancement (Dashed Line / Red)</option>
                            <option value="final">Final Advancement (Grand Final / Amber)</option>
                        </select>
                    </div>

                    {/* Live Connection Path Preview Card */}
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-md flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-indigo-400">{getGameName(selectedConnection.fromGameId)}</span>
                            <ArrowRight className="w-4 h-4 text-zinc-500" />
                            <span className="font-semibold text-emerald-400">{getGameName(selectedConnection.toGameId)}</span>
                        </div>
                        <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedConnection.type === "winner"
                                ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                                : selectedConnection.type === "loser"
                                    ? "bg-rose-950 text-rose-300 border border-rose-800"
                                    : "bg-amber-950 text-amber-300 border border-amber-800"
                                }`}
                        >
                            {selectedConnection.type}
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white"
                    >
                        Save Connection
                    </button>
                </form>
            )}
        </div>
    );
};