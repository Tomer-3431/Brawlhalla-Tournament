export default interface Connection {
    id: string;
    fromGameId: string;
    toGameId: string;
    type: "winner" | "loser" | "final";
}
