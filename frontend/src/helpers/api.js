const BASE = import.meta.env.VITE_API_URL ?? "";

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

export const startChat = (topic, token, hasVideo = false) =>
    fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ topic, has_video: hasVideo }),
    }).then((r) => r.json());

export const pollJob = (jobId, token) =>
    fetch(`${BASE}/api/jobs/${jobId}`, {
        headers: authHeaders(token),
    }).then((r) => r.json());

export const getTopics = (token) =>
    fetch(`${BASE}/api/topics`, {
        headers: authHeaders(token),
    }).then((r) => r.json());

export const getRecommendations = (token) =>
    fetch(`${BASE}/api/recommendations`, {
        headers: authHeaders(token),
    }).then((r) => r.json());

export const generateRecommendation = (topic, token) =>
    fetch(`${BASE}/api/recommendations/generate`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ topic }),
    }).then((r) => r.json());
