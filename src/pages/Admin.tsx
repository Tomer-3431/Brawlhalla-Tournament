import React, { useEffect, useState } from 'react';
import { Zap, Settings, Trophy, Users, PartyPopper, Gamepad2Icon } from 'lucide-react';
import { GameLiveEditor } from '../management/GameLiveEditor';
import { GameFullEditor } from '../management/GameFullEditor';
import { UserEditor } from '../management/UserEditor';
import { GroupEditor } from '../management/GroupEditor';
import { ConnectionEditor } from '../management/ConnectionEditor';
import { FunShit } from '../fun/Funshit';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export const Admin: React.FC = () => {
    const [tab, setTab] = useState<
        "fun-shit" | "edit-users" | "edit-games" | "edit-groups" | "scorekeeper" | "edit-matches"
    >("fun-shit");
    const navigate = useNavigate();

    useEffect(() => {
        var isAdmin = false;
        if (window.location.hostname === "localhost"
            || window.location.hostname === "127.0.0.1"
        ) {
            isAdmin = true;
        }

        const getCookie = Cookies.get(import.meta.env.VITE_ADMIN_KEY);

        if (getCookie === 'true') {
            isAdmin = true;
        }

        if (!isAdmin) {
            navigate("/home");
        }
    })

    return (
        <div className={`w-full mx-auto p-4 font-sans text-zinc-100 max-w-5xl`}>
            {/* Header Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                <button
                    onClick={() => setTab("fun-shit")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors ${tab === "fun-shit" ? "bg-amber-600 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                >
                    <PartyPopper className="w-4 h-4" /> Fun Shit
                </button>
                <button
                    onClick={() => setTab("edit-users")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors ${tab === "edit-users" ? "bg-rose-950 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                >
                    <Users className="w-4 h-4" /> Edit Users
                </button>
                <button
                    onClick={() => setTab("edit-games")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors ${tab === "edit-games" ? "bg-emerald-950 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                >
                    <Settings className="w-4 h-4" /> Edit Games
                </button>
                <button
                    onClick={() => setTab("edit-groups")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors ${tab === "edit-groups" ? "bg-cyan-800 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                >
                    <Trophy className="w-4 h-4" /> Edit Groups
                </button>
                <button
                    onClick={() => setTab("scorekeeper")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors ${tab === "scorekeeper" ? "bg-violet-950 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                >
                    <Zap className="w-4 h-4" /> Live Scorekeeper
                </button>
                <button
                    onClick={() => setTab("edit-matches")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors ${tab === "edit-matches" ? "bg-indigo-950 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                >
                    <Gamepad2Icon className="w-4 h-4" /> Edit Matches
                </button>
            </div>

            {/* View Switching */}
            <div className={`bg-zinc-900 border border-zinc-800 rounded-lg p-6`}>
                {tab === "fun-shit" && <FunShit />}
                {tab === "edit-users" && <UserEditor />}
                {tab === "edit-games" && <GameFullEditor />}
                {tab === "edit-groups" && <GroupEditor />}
                {tab === "scorekeeper" && <GameLiveEditor />}
                {tab === "edit-matches" && <ConnectionEditor />}
            </div>
        </div>
    );
};