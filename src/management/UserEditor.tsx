import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import type User from "../types/User";
import { db } from "../Firebase";
import { deleteUser, updateUser } from "./utils";

export const UserEditor: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [hasImgError, setHasImgError] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = onValue(ref(db, "users"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: User[] = Object.keys(data).map((id) => ({ id, ...data[id] }));
                setUsers(list);
            } else setUsers([]);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setHasImgError(false);
    }, [selectedUser?.avatar]);

    const handleCreateNew = async () => {
        const newUserData: Omit<User, "id"> = {
            username: "New User",
            title: "",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=new",
            isEliminated: false
        };
        const newId = btoa(`${Date.now()}`)
        if (newId) {
            setSelectedUser({ id: newId, ...newUserData });
        }
    };

    const handleDelete = async (userId: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            await deleteUser(userId);
            setSelectedUser(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            await updateUser(selectedUser.id, selectedUser);
            alert("User saved successfully.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <select
                    value={selectedUser?.id || ""}
                    onChange={(e) => {
                        const u = users.find((item) => item.id === e.target.value);
                        setSelectedUser(u || null);
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                >
                    <option value="">-- Select User --</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.username} ({u.id})
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-bold text-white shrink-0"
                >
                    <Plus className="w-4 h-4" /> Create User
                </button>
            </div>

            {selectedUser && (
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <h3 className="text-sm font-semibold text-zinc-300">Editing: {selectedUser.id}</h3>
                        <button
                            type="button"
                            onClick={() => handleDelete(selectedUser.id)}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                        >
                            <Trash2 className="w-4 h-4" /> Delete User
                        </button>
                    </div>

                    <div>
                        <label className="text-xs text-zinc-400 block mb-1">Username</label>
                        <input
                            type="text"
                            value={selectedUser.username}
                            onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                        />
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Title</label>
                            <input
                                type="text"
                                value={selectedUser.title}
                                onChange={(e) => setSelectedUser({ ...selectedUser, title: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-400 block mb-1">Eliminated</label>
                            <input
                                type="checkbox"
                                checked={selectedUser.isEliminated}
                                onChange={(e) => setSelectedUser({ ...selectedUser, isEliminated: e.target.checked })}
                                className="bg-zinc-950 border border-zinc-800 rounded px-3 text-white mt-4"
                            />
                        </div>
                    </div>

                    {/* Avatar Field & Live Preview */}
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 block">Avatar URL</label>
                        <input
                            type="text"
                            value={selectedUser.avatar}
                            onChange={(e) => setSelectedUser({ ...selectedUser, avatar: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                        />

                        {/* Live Avatar Preview */}
                        <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-md">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 flex items-center justify-center shrink-0">
                                {selectedUser.avatar ? (
                                    <img
                                        src={selectedUser.avatar}
                                        alt="Avatar preview"
                                        className="w-full h-full object-cover"
                                        onError={() => setHasImgError(true)}
                                    />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-zinc-600" />
                                )}
                            </div>
                            <div className="text-xs text-zinc-400">
                                <span className="font-semibold text-zinc-200 block">Avatar Preview</span>
                                {hasImgError ? (
                                    <span className="text-rose-400">Invalid image URL</span>
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white"
                    >
                        Save User
                    </button>
                </form>
            )
            }
        </div >
    );
};
