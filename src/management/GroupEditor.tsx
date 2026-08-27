import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { Plus, TagPlus, Trash2, UserPlus, X } from "lucide-react";
import type Group from "../Group";
import { db } from "../Firebase";
import { deleteGroup, updateGroup } from "./utils";
import type User from "../User";
import type Game from "../Game";

export const GroupEditor: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allGames, setAllGames] = useState<Game[]>([]);
    const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState<string>("");
    const [selectedGameIdToAdd, setSelectedGameIdToAdd] = useState<string>("");

    useEffect(() => {
        const unsubGroups = onValue(ref(db, "groups"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: Group[] = Object.keys(data).map((id) => ({ id, ...data[id] }));
                setGroups(list);
            } else setGroups([]);
        });

        const unsubGames = onValue(ref(db, "games"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: Game[] = Object.keys(data).map((id) => ({ id, ...data[id] }));
                setAllGames(list);
            } else setAllGames([]);
        });

        const unsubUsers = onValue(ref(db, "users"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: User[] = Object.keys(data).map((id) => ({ id, ...data[id] }));
                setAllUsers(list);
            } else setAllUsers([]);
        });

        return () => {
            unsubGroups();
            unsubGames();
            unsubUsers();
        };
    }, []);

    const handleCreateNew = async () => {
        const newGroupData: Omit<Group, "id"> = {
            name: "New Group",
            users: [],
            games: [],
        };
        const newId = btoa(`${Date.now()}`);
        if (newId) {
            setSelectedGroup({ id: newId, ...newGroupData });
        }
    };

    const handleDelete = async (groupId: string) => {
        if (confirm("Are you sure you want to delete this group?")) {
            await deleteGroup(groupId);
            setSelectedGroup(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGroup) {
            if (selectedGroup.users.length == 0) {
                alert("No users Where chosen\nDid not create new group");
                return;
            }
            if (selectedGroup.games.length == 0) {
                alert("No games Where chosen\nDid not create new group");
                return;
            }
            await updateGroup(selectedGroup.id, selectedGroup);
            alert("Group saved successfully.");
        }
    };

    const handleAddUserToGroap = () => {
        if (!selectedGroup || !selectedUserIdToAdd) return;
        if (selectedGroup.users.includes(selectedUserIdToAdd)) {
            alert("User already in group.");
            return;
        }

        const updatedUsers = [...selectedGroup.users, selectedUserIdToAdd];

        setSelectedGroup({
            ...selectedGroup,
            users: updatedUsers
        });
        setSelectedUserIdToAdd("");
    };

    const handleAddGameToGroap = () => {
        if (!selectedGroup || !selectedGameIdToAdd) return;
        if (selectedGroup.games.includes(selectedGameIdToAdd)) {
            alert("Game already in group.");
            return;
        }

        const updatedGames = [...selectedGroup.games, selectedGameIdToAdd];

        setSelectedGroup({
            ...selectedGroup,
            games: updatedGames,
        });
        setSelectedGameIdToAdd("");
    };

    const handleRemoveUserFromGroup = (i: number) => {
        if (!selectedGroup) return;

        const updatedUsers = selectedGroup.users.filter((_, j) => j !== i);

        setSelectedGroup({
            ...selectedGroup,
            users: updatedUsers,
        });
    };

    const handleRemoveGameFromGroup = (i: number) => {
        if (!selectedGroup) return;

        const updatedGames = selectedGroup.games.filter((_, j) => j !== i);

        setSelectedGroup({
            ...selectedGroup,
            games: updatedGames,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <select
                    value={selectedGroup?.id || ""}
                    onChange={(e) => {
                        const g = groups.find((item) => item.id === e.target.value);
                        setSelectedGroup(g || null);
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                >
                    <option value="">-- Select Group --</option>
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.name} ({g.id})
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-bold text-white shrink-0"
                >
                    <Plus className="w-4 h-4" /> Create Group
                </button>
            </div>

            {selectedGroup && (
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <h3 className="text-sm font-semibold text-zinc-300">Editing: {selectedGroup.id}</h3>
                        <button
                            type="button"
                            onClick={() => handleDelete(selectedGroup.id)}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Group
                        </button>
                    </div>

                    <div>
                        <label className="text-xs text-zinc-400 block mb-1">Group Name</label>
                        <input
                            type="text"
                            value={selectedGroup.name}
                            onChange={(e) => setSelectedGroup({ ...selectedGroup, name: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="text-xs text-zinc-400 block mb-1">
                            User IDs (comma separated)
                        </label>

                        <div className="flex gap-2">
                            <select
                                value={selectedUserIdToAdd}
                                onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white"
                            >
                                <option value="">-- Choose User to Add --</option>
                                {allUsers.map((u) => {
                                    if (selectedGroup.users.includes(u.id)) {
                                        return;
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
                                onClick={handleAddUserToGroap}
                                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-semibold text-white"
                            >
                                <UserPlus className="w-3.5 h-3.5" /> Add User
                            </button>
                        </div>

                        <div className="space-y-2">
                            {selectedGroup.users.map((userId, i) => {
                                const userObj = allUsers.find((u) => u.id === userId);

                                return (
                                    <div
                                        key={userId}
                                        className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-md"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveUserFromGroup(i)}
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

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="space-y-3 pt-2">
                        <label className="text-xs text-zinc-400 block mb-1">
                            Game IDs (comma separated)
                        </label>


                        <div className="flex gap-2">
                            <select
                                value={selectedGameIdToAdd}
                                onChange={(e) => setSelectedGameIdToAdd(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white"
                            >
                                <option value="">-- Choose Game to Add --</option>
                                {allGames.map((g) => {
                                    if (selectedGroup.games.includes(g.id)) {
                                        return;
                                    }
                                    return (
                                        <option key={g.id} value={g.id}>
                                            {g.name} ({g.id})
                                        </option>
                                    );
                                })}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddGameToGroap}
                                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-semibold text-white"
                            >
                                <TagPlus className="w-3.5 h-3.5" /> Add Game
                            </button>
                        </div>

                        <div className="space-y-2">
                            {selectedGroup.games.map((gameId, i) => {
                                const gameObj = allGames.find((g) => g.id === gameId);

                                return (
                                    <div
                                        key={gameId}
                                        className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-md"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGameFromGroup(i)}
                                                className="text-zinc-500 hover:text-rose-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <span className="text-sm font-semibold text-white">
                                                {gameObj?.name ?? gameId}
                                            </span>
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
                        Save Group
                    </button>
                </form>
            )}
        </div>
    );
};