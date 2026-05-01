import { useState, useEffect, useRef, useCallback } from "react";
import { startChat, pollJob } from "../helpers/api";

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [jobId, setJobId] = useState(null);
    const [status, setStatus] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [mode, setMode] = useState("chat");
    const intervalRef = useRef(null);
    const explanationAddedRef = useRef(false);

    const addMessage = (role, content) =>
        setMessages((prev) => [...prev, { role, content, id: Date.now() }]);

    const submit = useCallback(async (topic) => {
        explanationAddedRef.current = false;

        if (!topic.trim()) return;

        addMessage("user", topic);
        setStatus("pending");
        setVideoUrl(null);

        try {
            const { job_id } = await startChat(topic.trim());
            setJobId(job_id);
        } catch {
            addMessage("ai", "Something went wrong. Please try again.");
            setStatus(null);
        }
    }, []);

    useEffect(() => {
        if (!jobId || status === "done" || status === "failed") return;

        intervalRef.current = setInterval(async () => {
            try {
                const data = await pollJob(jobId);
                setStatus(data.status);

                if (data.explanation && !explanationAddedRef.current) {
                    explanationAddedRef.current = true;
                    addMessage("ai", data.explanation);
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
                    }
                }
            } catch {
                clearInterval(intervalRef.current);
            }
        }, 8000);

        return () => clearInterval(intervalRef.current);
    }, [jobId]);

    return { messages, status, videoUrl, mode, setMode, submit };
}
