import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/healthz", (req, res) => res.status(200).send("ok"));

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: message,
    });

    // Extract a safe text output
    const text =
      response.output_text || (response.output?.[0]?.content?.[0]?.text ?? "");

    res.json({ reply: text || "No response text received." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log("Server listening on port", port);
});
