import express from "express";
import path from "path"; // מייבא את מודול path של Node לעבודה עם נתיבי קבצים בצורה תקינה בכל מערכת הפעלה
import { fileURLToPath } from "url"; // מייבא פונקציה להמרת URL של מודול ES (import.meta.url) לנתיב קובץ רגיל
import OpenAI from "openai"; // מייבא את ה-SDK של OpenAI כדי לבצע קריאות API לשירות

// יצירת אפליקציית Express
const app = express();
app.use(express.json()); // מאפשר לאפליקציה לפרש בקשות JSON אוטומטית

// הגדרת נתיבים לתיקיית public

const __filename = fileURLToPath(import.meta.url); // מחשב את נתיב הקובץ הנוכחי (כמו __filename ב-CommonJS) מתוך import.meta.url
const __dirname = path.dirname(__filename); // מחשב את תיקיית הקובץ הנוכחי (כמו __dirname ב-CommonJS)

// הגדרת תיקיית public כסטטית כדי לשרת קבצים כמו HTML, CSS, JS
app.use(express.static(path.join(__dirname, "public")));

// יצירת לקוח OpenAI עם מפתח API מה-Environment
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/healthz", (req, res) => res.status(200).send("ok")); // נתיב בדיקת בריאות: מחזיר 200 וטקסט "ok" כדי לוודא שהשרת חי

app.post("/api/chat", async (req, res) => {
  // מגדיר נתיב POST ל-API של צ'אט; async כי יהיו פעולות אסינכרוניות (קריאת API)
  try {
    // מתחיל בלוק try כדי לתפוס שגיאות ולמנוע קריסה/החזרת תשובות לא מסודרות

    // חילוץ message מהגוף של הבקשה
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      // בודק שהתקבל message וגם שהוא מחרוזת
      return res.status(400).json({ error: "message is required" }); // אם לא תקין, מחזיר שגיאת 400 עם JSON שמסביר מה חסר
    }

    //ק
    // קריאה ל-API של OpenAI עם ההודעה מהמשתמש
    const response = await client.responses.create({
      model: "gpt-4o-mini", // מציין באיזה מודל להשתמש
      input: message, // שולח את טקסט המשתמש כקלט למודל
    });

    // Extract a safe text output // הערה: מנסים לחלץ טקסט בצורה "בטוחה" מכמה שדות אפשריים
    const text = // מגדיר משתנה text שיכיל את הטקסט שחולץ מהתגובה
      response.output_text || (response.output?.[0]?.content?.[0]?.text ?? ""); // קודם מנסה output_text; אם לא קיים מנסה נתיב חלופי עם optional chaining; ואם גם זה לא קיים מחזיר מחרוזת ריקה

    res.json({ reply: text || "No response text received." }); // מחזיר תשובת JSON ללקוח עם reply; אם text ריק מחזיר הודעת ברירת מחדל
  } catch (err) {
    // תופס כל שגיאה שהתרחשה בתוך try (למשל כשל רשת/מפתח API חסר/בעיה בתגובה)
    console.error(err); // מדפיס את השגיאה ללוגים של השרת כדי שיהיה אפשר לדבג
    res.status(500).json({ error: "Server error" }); // מחזיר ללקוח שגיאת 500 כללית
  } // סוף try/catch
}); // סוף הגדרת הנתיב /api/chat

const port = process.env.PORT || 3000; // קובע פורט: אם יש משתנה סביבה PORT משתמש בו, אחרת ברירת מחדל 3000
app.listen(port, "0.0.0.0", () => {
  // מפעיל את השרת ומאזין על כל הכתובות (0.0.0.0) בפורט שנבחר
  console.log("Server listening on port", port); // מדפיס ללוג שהשרת עלה ולאיזה פורט הוא מאזין
}); // סוף הפעלת השרת
