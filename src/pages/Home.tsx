import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { Radio } from "lucide-react";
import type Game from "../types/Game";
import { db } from "../Firebase";
import { GameProfile } from "../types/Game";

export default function Home() {
    const [liveGames, setLiveGames] = useState<Game[]>([]);

    const [troll, setTroll] = useState<string>('');
    const [isTroll, setIsTroll] = useState<boolean>(false);

    useEffect(() => {
        const unsubGames = onValue(ref(db, "games"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list: Game[] = Object.keys(data)
                    .map((id) => ({ id, ...data[id] }))
                    .filter((g) => g.isLive);
                setLiveGames(list);
            } else {
                setLiveGames([]);
            }
        });

        const trollRef = ref(db, "funshit/everyoneIsTamir");
        const unsubTroll = onValue(trollRef, (snapshot) => {
            if (snapshot.exists()) {
                setTroll(snapshot.val());
            } else {
                setTroll('');
            }
        });

        const isTrollRef = ref(db, "funshit/isEveryoneIsTamir");
        const unsubIsTroll = onValue(isTrollRef, (snapshot) => {
            if (snapshot.exists()) {
                setIsTroll(snapshot.val());
            } else {
                setIsTroll(false);
            }
        });

        return () => {
            unsubGames();
            unsubIsTroll();
            unsubTroll();
        };
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto p-6 space-y-8 font-sans">
            <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    Tournament Dashboard
                </h2>
                <p className="text-zinc-400 text-sm mt-1">Real-time match status and active games</p>
            </div>

            {/* Live Matches Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                        Matches Live Now
                    </h3>
                    {liveGames.length > 0 && (
                        <span className="ml-2 text-xs font-mono font-bold px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                            {liveGames.length} ACTIVE
                        </span>
                    )}
                </div>

                {liveGames.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-zinc-500 space-y-2">
                        <Radio className="w-8 h-8 mx-auto text-zinc-700" />
                        <p className="font-medium text-sm">No live games being played right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {liveGames.map((game) => (
                            <div
                                key={game.id}
                            >
                                <GameProfile game={game} isTroll={isTroll} troll={troll} />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}