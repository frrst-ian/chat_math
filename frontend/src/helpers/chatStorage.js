import { supabase } from "./supabase";

export async function createSession() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id })
        .select()
        .single();
    if (error) throw error;
    return data.id;
}

export async function saveMessage(sessionId, role, content) {
    await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role,
        content,
    });
}

export async function loadSession(sessionId) {
    const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
    return data ?? [];
}

export async function getUserSessions() {
    const { data } = await supabase
        .from("chat_sessions")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });
    return data ?? [];
}

export async function updateSessionTitle(sessionId, firstMessage) {
    const title =
        firstMessage.length > 40
            ? firstMessage.slice(0, 40) + "..."
            : firstMessage;

    await supabase.from("chat_sessions").update({ title }).eq("id", sessionId);
}

export async function deleteSession(sessionId) {
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
}
