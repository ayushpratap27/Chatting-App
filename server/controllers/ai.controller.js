import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Model to use — llama-3.3-70b-versatile is fast and high-quality on Groq
const MODEL = "llama-3.3-70b-versatile";
const MAX_MESSAGES = 60;

// Format messages into a readable transcript for the AI
const formatTranscript = (messages) =>
    messages
        .slice(-MAX_MESSAGES)
        .map((m) => `[${m.senderName}]: ${m.content}`)
        .join("\n");

export const summarize = async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(503).send("AI service is not configured. Add GROQ_API_KEY to server .env");
        }

        const { messages, type, mode } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).send("Messages array is required");
        }

        // Only process text messages (skip file-only messages)
        const textMessages = messages.filter((m) => m.content && m.content.trim());
        if (textMessages.length === 0) {
            return res.status(400).send("No text messages to summarize");
        }

        // ── Per-user breakdown mode ──────────────────────────────────────────
        if (mode === "per-user") {
            const grouped = {};
            textMessages.slice(-MAX_MESSAGES).forEach((m) => {
                const name = m.senderName || "Unknown";
                if (!grouped[name]) grouped[name] = [];
                grouped[name].push(m.content);
            });

            const senderNames = Object.keys(grouped);
            if (senderNames.length === 0) {
                return res.status(400).send("No messages to summarize");
            }

            const groupedText = senderNames
                .map(
                    (name) =>
                        `[${name}]:\n${grouped[name].map((c) => `- ${c}`).join("\n")}`
                )
                .join("\n\n");

            const exampleOutput = JSON.stringify(
                Object.fromEntries(senderNames.map((n) => [n, "1-2 sentence summary"]))
            );

            const prompt = `You are a concise chat assistant. For each person below, write a 1-2 sentence summary of what they contributed to this group conversation. Be specific and mention key points they raised.\n\n${groupedText}\n\nRespond ONLY with valid JSON matching this structure:\n${exampleOutput}`;

            const completion = await groq.chat.completions.create({
                model: MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3,
                max_tokens: 1024,
            });

            let perUser;
            try {
                perUser = JSON.parse(completion.choices[0].message.content);
            } catch {
                return res.status(500).send("Failed to parse AI response");
            }

            return res.status(200).json({ perUser });
        }

        // ── Overall summary mode ─────────────────────────────────────────────
        const chatContext =
            type === "dm"
                ? "a private direct message conversation"
                : "a group channel conversation";

        const prompt = `You are a concise and friendly chat assistant. Summarize the following unread messages from ${chatContext}. Keep it to 2-4 sentences. Capture the key topics, decisions, and any action items. Write in a natural, readable tone.\n\nMessages:\n${formatTranscript(textMessages)}`;

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 512,
        });

        const summary = completion.choices[0].message.content.trim();
        return res.status(200).json({ summary });
    } catch (error) {
        console.error("AI summarize error:", error.message);
        return res.status(500).send("Failed to generate summary");
    }
};
