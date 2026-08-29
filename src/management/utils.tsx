import { ref, update, set, remove, push } from "firebase/database";
import type User from "../types/User";
import { db } from "../Firebase";
import type Game from "../types/Game";
import type Group from "../types/Group";
import type Connection from "../types/Connection";

// User Helpers
export async function createUser(data: Omit<User, "id">) {
    const newRef = push(ref(db, "users"));
    await set(newRef, data);
    return newRef.key;
}
export async function updateUser(userId: string, data: Partial<User>) {
    await update(ref(db, `users/${userId}`), data);
}
export async function deleteUser(userId: string) {
    await remove(ref(db, `users/${userId}`));
}

// Game Helpers
export async function createGame(data: Omit<Game, "id">) {
    const newRef = push(ref(db, "games"));
    await set(newRef, data);
    return newRef.key;
}
export async function updateGameFull(gameId: string, data: Partial<Game>) {
    await update(ref(db, `games/${gameId}`), data);
}
export async function deleteGame(gameId: string) {
    await remove(ref(db, `games/${gameId}`));
}
export async function updateGameLive(gameId: string, points: number[], winner?: number) {
    const payload: Record<string, any> = { points };
    if (winner !== undefined) {
        payload.winner = winner;
    }
    await update(ref(db, `games/${gameId}`), payload);
}

// Group Helpers
export async function createGroup(data: Omit<Group, "id">) {
    const newRef = push(ref(db, "groups"));
    await set(newRef, data);
    return newRef.key;
}
export async function updateGroup(groupId: string, data: Partial<Group>) {
    await update(ref(db, `groups/${groupId}`), data);
}
export async function deleteGroup(groupId: string) {
    await remove(ref(db, `groups/${groupId}`));
}

export async function createConnection(data: Omit<Connection, "id">) {
    const newRef = push(ref(db, "connections"));
    await set(newRef, data);
    return newRef.key;
}
export async function updateConnection(connectionId: string, data: Partial<Connection>) {
    await update(ref(db, `connections/${connectionId}`), data);
}
export async function deleteConnection(connectionId: string) {
    await remove(ref(db, `connections/${connectionId}`));
}