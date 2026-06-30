import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')))

const PORT = 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));

app.post("/api/chat", async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!Array.isArray(conversation)) throw new Error("Pesan harus array");

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.9,
        systemInstruction: "Kamu adalah asisten produktivitas yang ahli. Bantu pengguna untuk fokus, mengatur waktu, dan menyelesaikan tugas. Gunakan bahasa Indonesia yang santai tapi tetap profesional dan memberikan solusi praktis.",
      },
    });
    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: e.message });
  }
});
