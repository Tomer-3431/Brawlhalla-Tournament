import { useEffect, useState, type ReactNode } from "react";
import { db } from "./Firebase";
import { get, ref } from "firebase/database";

export default interface User {
    id: string;
    username: string;
    title: string;
    avatar: string;
    isEliminated: boolean,
}

export const UserIdProfile: React.FC<{ userId: string }> = ({ userId }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;

            try {
                const dbRef = ref(db, `users/${userId}`);
                const snapshot = await get(dbRef);

                if (snapshot.exists()) {
                    setUser({ id: userId, ...snapshot.val() });
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Failed to load user data: ", err);
            }
        }

        fetchUserData();
    }, [userId]);

    return <UserProfile user={user!} />;
}
export const UserProfile: React.FC<{ user: User, leading?: ReactNode, score?: number, winRatio?: { win: number, lose: number } }> = ({ user, leading, score, winRatio }) => {
    return (
        <div className={`user-card font-sans flex items-center justify-between gap-4 transition-all duration-200 ${user.isEliminated ? "opacity-60 bg-zinc-900/50 border border-red-900/30 grayscale-[0.3]" : ""
            }`}>
            {/* Left Section: Avatar + Username */}
            <div className="user-card-left flex items-center gap-3 min-w-0 flex-1">
                {leading != null && leading}
                <div className="avatar-wrapper relative shrink-0">
                    {user?.avatar && (
                        <img
                            src={user.avatar}
                            alt={`${user.username}'s avatar`}
                            className={`avatar-image ${user.isEliminated ? "filter grayscale brightness-75" : ""}`}
                        />
                    )}
                </div>
                <div className="flex flex-row px-2 items-center truncate">
                    <span className="username font-semibold truncate">
                        {user?.username}
                    </span>
                    {user?.title && (
                        <span className="user-title text-xs text-zinc-400 ml-4 shrink-0">
                            {user.title}
                        </span>
                    )}
                </div>
            </div>

            {/* Right Section: Fixed-width group containing Elimination Badge, W/L Ratio, and Score */}
            <div className="flex items-center gap-4 shrink-0">
                {user.isEliminated && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/50 tracking-wider uppercase">
                        Eliminated
                    </span>
                )}

                {/* Win/Loss Ratio with fixed width so scores line up across all users */}
                {winRatio != undefined && (
                    <div className="font-mono text-sm font-bold text-zinc-300 w-16 text-right mr-6">
                        {winRatio.win} - {winRatio.lose}
                    </div>
                )}

                {/* Score Block */}
                {score != undefined && (
                    <div className="score-wrapper font-digital flex items-end min-w-[60px] justify-end">
                        <span className="score-value">
                            {score}
                        </span>
                        <span className="score-unit text-xs text-zinc-500 ml-1">PTS</span>
                    </div>
                )}
            </div>
        </div>
    );
};