require("dotenv").config();
const express = require("express");
const cors = require("cors");

// --- FIX для Render: добавляем fetch ---
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

// разрешаем CORS (чтобы фронтенд на другом домене работал)
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
  })
);

// ==================== TELEGRAM ENDPOINT ====================
app.post("/api/telegram", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const TOKEN = process.env.TG_BOT_TOKEN;
  const CHAT_ID = process.env.TG_CHAT_ID;

  if (!TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: "Missing TG credentials" });
  }

  try {
    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });

    const json = await r.json();
    return res.json(json);
  } catch (err) {
    console.error("TG ERROR:", err);
    return res.status(500).json({ error: "Telegram error" });
  }
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server running on", PORT));
