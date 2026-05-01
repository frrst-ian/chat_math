import { useEffect, useRef } from "react";
import { useChat } from "../../hooks/useChat";
import ModeToggle from "../../components/ModeToggle/ModeToggle";
import ChatBubble from "../../components/ChatBubble/ChatBubble";
import TopicPills from "../../components/TopicPills/TopicPills";
import ChatInput from "../../components/ChatInput/ChatInput";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import styles from "./NewChat.module.css";

export default function NewChat() {
    const { messages, status, videoUrl, mode, setMode, submit, isExplaining, cancel } = useChat();
    const bottomRef = useRef(null);
    const isLoading = status === "pending" || status === "rendering";
    const isEmpty = messages.length === 0;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className={styles.page}>
            <ModeToggle mode={mode} setMode={setMode} />

            {mode === "video" ? (
                <VideoPlayer videoUrl={videoUrl} status={status} />
            ) : isEmpty ? (
                <div className={styles.emptyState}>
                    <div className={styles.inputArea}>
                        <TopicPills onSelect={submit} />
                        <ChatInput onSubmit={submit} onCancel={cancel} disabled={isLoading} isLoading={isLoading} />
                    </div>
                </div>
            ) : (
                <div className={styles.chatArea}>
                    <div className={styles.messages}>
                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
                        ))}
                        {isExplaining && <ChatBubble role="ai" content="Thinking…" />}
                        <div ref={bottomRef} />
                    </div>
                    <div className={styles.inputArea}>
                       <ChatInput onSubmit={submit} onCancel={cancel} disabled={isLoading} isLoading={isLoading} />
                    </div>
                </div>
            )}
        </div>
    );
}