const BASE = import.meta.env.VITE_API_URL ?? "";

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

export const startChat = (topic, token) =>
    fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ topic }),
    }).then((r) => r.json());

export const pollJob = (jobId, token) =>
    fetch(`${BASE}/api/jobs/${jobId}`, {
        headers: authHeaders(token),
    }).then((r) => r.json());

export const getTopics = (token) =>
    fetch(`${BASE}/api/topics`, {
        headers: authHeaders(token),
    }).then((r) => r.json());
