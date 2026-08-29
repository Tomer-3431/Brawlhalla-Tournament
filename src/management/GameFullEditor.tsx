import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { Plus, Trash2, UserPlus, X } from "lucide-react";
import type Game from "../types/Game";
import type User from "../types/User";
import { db } from "../Firebase";
import { deleteGame, updateGameFull } from "./utils";

export const GameFullEditor: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState<string>("");

    useEffect(() => {
        const unsubGames = onValue(ref(db, "games"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: Game[] = Object.keys(data).map((id) => ({ id, ...data[id] }));
                setGames(list);
            } else setGames([]);
        });

        const unsubUsers = onValue(ref(db, "users"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: User[] = Object.keys(data).map((id) => ({ id, ...data[id] }));
                setAllUsers(list);
            } else setAllUsers([]);
        });

        return () => {
            unsubGames();
            unsubUsers();
        };
    }, []);

    const handleCreateNew = async () => {
        const newGameData: Omit<Game, "id"> = {
            name: "New Game",
            group: "",
            users: [],
            points: [],
            round: 0,
            bracket: "upper"
        };
        const newId = btoa(`${Date.now()}`);
        if (newId) {
            setSelectedGame({ id: newId, ...newGameData });
        }
    };

    const handleDelete = async (gameId: string) => {
        if (confirm("Are you sure you want to delete this game?")) {
            await deleteGame(gameId);
            setSelectedGame(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGame) {
            // Check removed so games can save with 0 users
            await updateGameFull(selectedGame.id, selectedGame);
            alert("Game saved successfully.");
        }
    };

    const handleAddUserToGame = () => {
        if (!selectedGame || !selectedUserIdToAdd) return;
        const currentUsers = selectedGame?.users || [];
        if (currentUsers.includes(selectedUserIdToAdd)) {
            alert("User already in game.");
            return;
        }

        const updatedUsers = [...currentUsers, selectedUserIdToAdd];
        const updatedPoints = [...(selectedGame.points || []), 0];

        setSelectedGame({
            ...selectedGame,
            users: updatedUsers,
            points: updatedPoints,
        });
        setSelectedUserIdToAdd("");
    };

    const handleRemoveUserFromGame = (idx: number) => {
        if (!selectedGame) return;
        const currentUsers = selectedGame.users || [];
        const currentPoints = selectedGame.points || [];

        const updatedUsers = currentUsers.filter((_, i) => i !== idx);
        const updatedPoints = currentPoints.filter((_, i) => i !== idx);
        let updatedWinner = selectedGame.winner;

        if (selectedGame.winner === idx) {
            updatedWinner = undefined;
        } else if (selectedGame.winner !== undefined && selectedGame.winner > idx) {
            updatedWinner = selectedGame.winner - 1;
        }

        setSelectedGame({
            ...selectedGame,
            users: updatedUsers,
            points: updatedPoints,
            winner: updatedWinner,
        });
    };

    const handleScoreChange = (index: number, val: number) => {
        if (!selectedGame) return;
        const currentUsers = selectedGame.users || [];
        const updatedPoints = [...(selectedGame.points || currentUsers.map(() => 0))];
        updatedPoints[index] = val;
        setSelectedGame({ ...selectedGame, points: updatedPoints });
    };

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between gap-4">
                <select
                    value={selectedGame?.id || ""}
                    onChange={(e) => {
                        const g = games.find((item) => item.id === e.target.value);
                        setSelectedGame(g || null);
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                >
                    <option value="">-- Select Game --</option>
                    {games.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.name} ({g.group})
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-bold text-white shrink-0"
                >
                    <Plus className="w-4 h-4" /> Create Game
                </button>
            </div>

            {selectedGame && (
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <h3 className="text-sm font-semibold text-zinc-300">Editing: {selectedGame.id}</h3>
                        <button
                            type="button"
                            onClick={() => handleDelete(selectedGame.id)}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Game
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Game Name</label>
                            <input
                                type="text"
                                value={selectedGame.name || ""}
                                onChange={(e) => setSelectedGame({ ...selectedGame, name: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Group ID</label>
                            <input
                                type="text"
                                value={selectedGame.group || ""}
                                onChange={(e) => setSelectedGame({ ...selectedGame, group: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Winner Advance Target</label>
                            <input
                                type="text"
                                value={selectedGame.winnerAdvance || ""}
                                onChange={(e) => setSelectedGame({ ...selectedGame, winnerAdvance: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Loser Advance Target</label>
                            <input
                                type="text"
                                value={selectedGame.loserAdvance || ""}
                                onChange={(e) => setSelectedGame({ ...selectedGame, loserAdvance: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Round Number</label>
                            <input
                                type="number"
                                min={0}
                                value={selectedGame.round ?? 0}
                                onChange={(e) => setSelectedGame({ ...selectedGame, round: parseInt(e.target.value) || 0 })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white font-mono"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Bracket</label>
                            <select
                                value={selectedGame.bracket || "upper"}
                                onChange={(e) => setSelectedGame({ ...selectedGame, bracket: e.target.value as 'upper' | 'lower' | 'final' })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                            >
                                <option value="upper">Upper Bracket</option>
                                <option value="lower">Lower Bracket</option>
                                <option value="final">Finals</option>
                            </select>
                        </div>
                    </div>

                    {/* Users, Scores & Winner Section */}
                    <div className="space-y-3 pt-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                            Participants, Scores & Winner
                        </label>

                        {/* Add existing user dropdown */}
                        <div className="flex gap-2">
                            <select
                                value={selectedUserIdToAdd}
                                onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white"
                            >
                                <option value="">-- Choose User to Add --</option>
                                {allUsers.map((u) => {
                                    if ((selectedGame.users || []).includes(u.id)) {
                                        return null;
                                    }
                                    return (
                                        <option key={u.id} value={u.id}>
                                            {u.username} ({u.id})
                                        </option>
                                    );
                                })}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddUserToGame}
                                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-semibold text-white"
                            >
                                <UserPlus className="w-3.5 h-3.5" /> Add User
                            </button>
                        </div>

                        {/* Participant list with scores and winner selection */}
                        <div className="space-y-2">
                            {(selectedGame.users || []).map((userId, i) => {
                                const userObj = allUsers.find((u) => u.id === userId);
                                const isWinner = selectedGame.winner === i;

                                return (
                                    <div
                                        key={userId}
                                        className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-md"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveUserFromGame(i)}
                                                className="text-zinc-500 hover:text-rose-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="avatar-wrapper">
                                                <img
                                                    src={`${userObj?.avatar ?? ""}`}
                                                    alt={`${userObj?.username ?? ""}'s avatar`}
                                                    className="avatar-image"
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-white">
                                                {userObj ? userObj.username : userId}
                                            </span>
                                            <span className="user-title">
                                                {userObj?.title}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Score Field */}
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-zinc-500">Pts:</span>
                                                <input
                                                    type="number"
                                                    value={selectedGame.points?.[i] ?? 0}
                                                    onChange={(e) => handleScoreChange(i, parseInt(e.target.value) || 0)}
                                                    className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-center font-mono font-bold text-amber-400"
                                                />
                                            </div>

                                            {/* Winner Toggle */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedGame({
                                                        ...selectedGame,
                                                        winner: isWinner ? undefined : i,
                                                    })
                                                }
                                                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${isWinner
                                                    ? "bg-amber-500 text-zinc-950"
                                                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                                                    }`}
                                            >
                                                {isWinner ? "WINNER" : "Set Winner"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white"
                    >
                        Save Game Settings
                    </button>
                </form>
            )}
        </div>
    );
};