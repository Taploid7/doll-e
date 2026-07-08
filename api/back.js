import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://taploid7.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(455).json({ error: "Method not allowed" });
    }

    try {
        const { word, hintContext, followupQuestion, isGeneralChat } = req.body;

        if (isGeneralChat) {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are Charlotte's companion AI. The game simulation has finished. Answer the user's question politely and concisely in Traditional Chinese (繁體中文): "${followupQuestion}"`,
            });
            return res.status(200).json({ hint: response.text.trim() });
        }

        if (!word || !hintContext) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        let prompt = `You are a helpful AI assistant for a vocabulary game based on a children's tech book. 
The user needs help guessing the vocabulary word: "${word}" to fill in the blank for this sentence: "${hintContext}".
Provide a helpful, encouraging hint in Traditional Chinese (繁體中文) to help them understand or guess the word. Do not give away the exact answer directly. Keep it short and under 3 lines.`;

        if (followupQuestion) {
            prompt = `You are a helpful AI assistant for a vocabulary game based on a children's tech book.
The current target vocabulary word is "${word}" and the context sentence is "${hintContext}".
The user has opened a live chat channel and asked this specific follow-up question: "${followupQuestion}".
Answer their question directly and concisely in Traditional Chinese (繁體中文). Do not give away the exact answer directly. Keep it short.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return res.status(200).json({ hint: response.text.trim() });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}