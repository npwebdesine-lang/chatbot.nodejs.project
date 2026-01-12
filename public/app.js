const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

function addBubble(text, who = "me") {
  const div = document.createElement("div");
  div.className = `bubble ${who}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (!msg) return;

  addBubble(msg, "me");
  input.value = "";
  input.focus();

  sendBtn.disabled = true;

  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || "Request failed");
    addBubble(data.reply, "bot");
  } catch (err) {
    addBubble("שגיאה: " + err.message, "bot");
  } finally {
    sendBtn.disabled = false;
  }
});
