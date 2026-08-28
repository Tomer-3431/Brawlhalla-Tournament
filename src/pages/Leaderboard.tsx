import { useEffect, useState } from "react";
import type User from "../User";
import { off, onValue, ref } from "firebase/database";
import { db } from "../Firebase";
import { UserProfile } from "../User";
import { Trophy } from "lucide-react";
import type Game from "../Game";

export function Leaderboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    var usersList: { User: User, score: number, win: number, lose: number }[] = [];

    useEffect(() => {
        const usersRef = ref(db, '/users');
        const gamesRef = ref(db, '/games');

        onValue(
            usersRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();

                    const usersList: User[] = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key]
                    }));

                    setUsers(usersList);
                } else {
                    setUsers([]);
                }
            }, (err) => {
                console.error('Firebase read error: ', err);
            }
        );

        onValue(
            gamesRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();

                    const gamesList: Game[] = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key]
                    }));

                    setGames(gamesList);
                } else {
                    setGames([]);
                }
            }, (err) => {
                console.error('Firebase read error: ', err);
            }
        )

        return () => {
            off(usersRef);
            off(gamesRef);
        }
    }, []);

    users.forEach((user) => {
        let score = 0;
        let win = 0;
        let lose = 0;
        games.forEach((game) => {
            if (game.points && game.users.includes(user.id)) {
                score += game.points[game.users.indexOf(user.id)];
            }
            if (game.users && game.users.includes(user.id) && game.winner != undefined) {
                if (game.users[game.winner] === user.id) {
                    win++;
                } else {
                    lose++;
                }
            }
        })


        usersList = [...usersList, { User: user, score: score, win: win, lose: lose }];
    });

    usersList.sort((a, b) => {
        const aEliminated = a.User.isEliminated ? 1 : 0;
        const bEliminated = b.User.isEliminated ? 1 : 0;
        if (aEliminated !== bEliminated) {
            return aEliminated - bEliminated;
        }

        if (b.score !== a.score) {
            return b.score - a.score;
        }

        const aTotal = (a.win ?? 0) + (a.lose ?? 0);
        const bTotal = (b.win ?? 0) + (b.lose ?? 0);

        const aRatio = aTotal > 0 ? (a.win / aTotal) : 0;
        const bRatio = bTotal > 0 ? (b.win / bTotal) : 0;
        if (bRatio !== aRatio) {
            return bRatio - aRatio;
        }

        // 4. Name (Alphabetical A-Z)
        return a.User.username.localeCompare(b.User.username);
    });

    return (
        <div>
            <h2>Leaderboard Page</h2>
            <br />
            {
                usersList.map((user, i) => {
                    const rank = i + 1;
                    const isTopThree = rank <= 3;
                    return (
                        <div className="m-2" key={i}>
                            <UserProfile user={user.User} score={user.score} winRatio={{ win: user.win, lose: user.lose }} leading={<div className="flex items-center justify-center w-8 shrink-0">
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
                            </div>} />
                        </div>
                    );
                })
            }
        </div>
    );
}

const TROPHY_COLORS: Record<number, string> = {
    1: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    2: "text-slate-300 border-slate-400/30 bg-slate-400/10",
    3: "text-amber-700 border-amber-700/30 bg-amber-700/10",
};