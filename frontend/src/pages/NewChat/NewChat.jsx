import { useEffect, useRef } from "react";
import { useChat } from "../../hooks/useChat";
import ModeToggle from "../../components/ModeToggle/ModeToggle";
import ChatBubble from "../../components/ChatBubble/ChatBubble";
import TopicPills from "../../components/TopicPills/TopicPills";
import ChatInput from "../../components/ChatInput/ChatInput";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import styles from "./NewChat.module.css";
import { useLocation } from "react-router-dom";

export default function NewChat() {
    const {
        messages,
        status,
        videoUrl,
        mode,
        setMode,
        submit,
        isExplaining,
        cancel,
        sessionLoading,
        userScrolledUpRef,
    } = useChat();
    const bottomRef = useRef(null);
    const messagesRef = useRef(null);
    const isLoading = status === "pending" || status === "rendering";
    const isEmpty = messages.length === 0;

    const location = useLocation();
    const prefillSent = useRef(false);

    const handleScroll = () => {
        const el = messagesRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        userScrolledUpRef.current = !atBottom;
    };

    useEffect(() => {
        if (userScrolledUpRef.current) return;
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (location.state?.prefill && !prefillSent.current) {
            prefillSent.current = true;
            submit(location.state.prefill);
        }
    }, [location.state, submit]);

    return (
        <div className={styles.page}>
            <ModeToggle mode={mode} setMode={setMode} />

            {mode === "video" ? (
                <VideoPlayer videoUrl={videoUrl} status={status} />
            ) : isEmpty ? (
                <div className={styles.emptyState}>
                    <div className={styles.inputArea}>
                        <TopicPills onSelect={submit} />
                        <ChatInput
                            onSubmit={submit}
                            onCancel={cancel}
                            disabled={isLoading || sessionLoading}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            ) : (
                <div className={styles.chatArea}>
                    <div
                        className={styles.messages}
                        ref={messagesRef}
                        onScroll={handleScroll}
                    >
                        {messages.map((msg) => (
                            <ChatBubble
                                key={msg.id}
                                role={msg.role}
                                content={msg.content}
                            />
                        ))}
                        {isExplaining && (
                            <ChatBubble role="ai" content="Thinking…" />
                        )}
                        <div ref={bottomRef} />
                    </div>
                    <div className={styles.inputArea}>
                        <ChatInput
                            onSubmit={submit}
                            onCancel={cancel}
                            disabled={isLoading || sessionLoading}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
