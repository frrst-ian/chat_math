import { useState, useEffect, useRef, useCallback } from "react";
import { startChat, pollJob } from "../helpers/api";
import { useAuth } from "../context/AuthContext";

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [jobId, setJobId] = useState(null);
    const [status, setStatus] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [mode, setMode] = useState("chat");
    const intervalRef = useRef(null);
    const explanationAddedRef = useRef(false);

    const {token} = useAuth()

    const addMessage = (role, content) =>
        setMessages((prev) => [...prev, { role, content, id: Date.now() }]);

    const submit = useCallback(async (topic) => {
        explanationAddedRef.current = false;

        if (!topic.trim()) return;

        addMessage("user", topic);
        setStatus("pending");
        setIsExplaining(true);
        setVideoUrl(null);

        try {
            const { job_id } = await startChat(topic.trim(), token);
            setJobId(job_id);
        } catch {
            addMessage("ai", "Something went wrong. Please try again.");
            setStatus(null);
            setIsExplaining(false);
        }
    }, [token]);

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
                    addMessage("ai", data.explanation);
                    addMessage(
                        "hint",
                        "Switch to Video Mode to watch the animation.",
                    );
                    setIsExplaining(false);
                }

                if (data.video_url) {
                    setVideoUrl(data.video_url);
                }

                if (data.status === "done" || data.status === "failed") {
                    clearInterval(intervalRef.current);
                    if (data.status === "failed") {
                        addMessage(
                            "ai",
                            "Couldn't generate the animation. Try a different topic.",
                        );
                        setIsExplaining(false);
                    }
                }
            } catch {
                clearInterval(intervalRef.current);
            }
        }, 8000);

        return () => clearInterval(intervalRef.current);
    }, [jobId]);

    return { messages, status, videoUrl, mode, setMode, submit, isExplaining, cancel };
}
