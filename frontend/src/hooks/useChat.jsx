import { useState, useEffect, useRef, useCallback } from "react";
import { startChat, pollJob, generateSessionTitle } from "../helpers/api";
import { useAuth } from "../context/AuthContext";
import {
    createSession,
    saveMessage,
    loadSession,
    updateSessionTitle,
} from "../helpers/chatStorage";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Video } from "lucide-react";

export function useChat() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [jobId, setJobId] = useState(null);
    const [status, setStatus] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [mode, setMode] = useState("chat");
    const [currentSessionId, setCurrentSessionId] = useState(sessionId ?? null);
    const [sessionLoading, setSessionLoading] = useState(!!sessionId);
    const intervalRef = useRef(null);
    const explanationAddedRef = useRef(false);
    const setModeRef = useRef(setMode);
    const userScrolledUpRef = useRef(false);
    const pendingTopicRef = useRef(null);
    const { token } = useAuth();

    useEffect(() => {
        setModeRef.current = setMode;
    }, [setMode]);

    useEffect(() => {
        if (!sessionId) return;
        setSessionLoading(true);
        setCurrentSessionId(sessionId);
        loadSession(sessionId)
            .then((msgs) => {
                setMessages(
                    msgs.map((m) => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                    })),
                );
            })
            .finally(() => setSessionLoading(false));
    }, [sessionId]);

    const addMessage = useCallback(
        async (role, content, sid) => {
            const msg = { role, content, id: Date.now() };
            setMessages((prev) => [...prev, msg]);
            const targetSid = sid ?? currentSessionId;
            if (targetSid) {
                await saveMessage(targetSid, role, content);
            }
        },
        [currentSessionId],
    );

    const submit = useCallback(
        async (topic) => {
            explanationAddedRef.current = false;
            if (!topic.trim()) return;

            let sid = currentSessionId;
            if (!sid) {
                sid = await createSession();
                setCurrentSessionId(sid);
                await updateSessionTitle(sid, topic);
                navigate(`/chat/${sid}`, { replace: true });
            }

            pendingTopicRef.current = { topic, sid };
            await addMessage("user", topic, sid);
            setStatus("pending");
            setIsExplaining(true);
            setVideoUrl(null);
            userScrolledUpRef.current = false;

            try {
                const { job_id } = await startChat(
                    topic.trim(),
                    token,
                    !!videoUrl,
                );
                setJobId(job_id);
            } catch {
                await addMessage(
                    "ai",
                    "Something went wrong. Please try again.",
                    sid,
                );
                setStatus(null);
                setIsExplaining(false);
            }
        },
        [token, currentSessionId, navigate, addMessage, videoUrl],
    );

    const cancel = useCallback(() => {
        clearInterval(intervalRef.current);
        setStatus(null);
        setIsExplaining(false);
        setJobId(null);
    }, []);

    useEffect(() => {
        if (!jobId || status === "done" || status === "failed") return;

        intervalRef.current = setInterval(async () => {
            try {
                const data = await pollJob(jobId, token);
                setStatus(data.status);

                if (data.explanation && !explanationAddedRef.current) {
                    explanationAddedRef.current = true;
                    await addMessage("ai", data.explanation);
                    await addMessage(
                        "hint",
                        "Switch to Video Mode to watch the animation.",
                    );
                    setIsExplaining(false);

                    // Regenerate a smarter session title from the topic
                    const pending = pendingTopicRef.current;
                    if (pending) {
                        generateSessionTitle(pending.topic, token)
                            .then(({ title }) => {
                                if (title)
                                    updateSessionTitle(pending.sid, title);
                            })
                            .catch(() => {});
                        pendingTopicRef.current = null;
                    }
                }

                if (data.video_url) {
                    setVideoUrl(data.video_url);
                    toast(
                        (t) => (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                }}
                            >
                                <Video size={16} strokeWidth={1.75} />
                                <span style={{ fontSize: "0.875rem" }}>
                                    Animation is ready
                                </span>
                                <button
                                    onClick={() => {
                                        setModeRef.current("video");
                                        toast.dismiss(t.id);
                                    }}
                                    style={{
                                        background: "#097ff6",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "0.35rem 0.75rem",
                                        fontSize: "0.8rem",
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Watch Now
                                </button>
                            </div>
                        ),
                        {
                            duration: 8000,
                            style: {
                                background: "#1e2128",
                                color: "#e4fafd",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "12px",
                            },
                        },
                    );
                }

                if (data.status === "done" || data.status === "failed") {
                    clearInterval(intervalRef.current);
                    if (data.status === "failed") {
                        await addMessage(
                            "ai",
                            "Couldn't generate the animation.",
                        );
                        setIsExplaining(false);
                        toast.error("Animation failed to render.", {
                            style: {
                                background: "#1e2128",
                                color: "#e4fafd",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "12px",
                            },
                        });
                    }
                }
            } catch {
                clearInterval(intervalRef.current);
            }
        }, 8000);

        return () => clearInterval(intervalRef.current);
    }, [jobId]);

    return {
        messages,
        status,
        videoUrl,
        mode,
        setMode,
        submit,
        isExplaining,
        cancel,
        currentSessionId,
        sessionLoading,
        userScrolledUpRef,
    };
}
