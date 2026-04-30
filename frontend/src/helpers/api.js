const BASE = import.meta.env.VITE_API_URL ?? "";

export const startChat = (topic) =>
    fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
    }).then((r) => r.json());

export const pollJob = (jobId) =>
    fetch(`${BASE}/api/jobs/${jobId}`).then((r) => r.json());

export const getTopics = () =>
    fetch(`${BASE}/api/topics`).then((r) => r.json());