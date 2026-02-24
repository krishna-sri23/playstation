const { io } = require("socket.io-client");
const readline = require("readline");

const URL = "http://localhost:3000";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const userId = Number(process.argv[2]);
if (!userId) {
  console.log("Usage: node interactive-chat.cjs <userId>");
  console.log("Example: node interactive-chat.cjs 1");
  process.exit(1);
}

const socket = io(URL);
let currentSessionId = null;

socket.on("connect", () => {
  console.log("Connected as User " + userId + " (socket: " + socket.id + ")");
  socket.emit("user-online", userId);
});

socket.on("user-status-changed", ({ userId: uid, status }) => {
  console.log(">> User " + uid + " is now " + status);
});

socket.on("chat-started", ({ sessionId, chatId, withUserId }) => {
  currentSessionId = sessionId;
  console.log(">> Chat started with User " + withUserId + " (sessionId: " + sessionId + ")");
  console.log("   Type messages and press Enter to send. Commands:");
  console.log("   /end   — end the chat session");
});

socket.on("receive-message", ({ senderId, content, timestamp }) => {
  if (String(senderId) !== String(userId)) {
    console.log("[User " + senderId + "]: " + content);
  }
});

socket.on("chat-ended", ({ sessionId, chatId, messageCount }) => {
  console.log(">> Chat ended! " + messageCount + " messages saved to database.");
  currentSessionId = null;
});

socket.on("error", ({ message }) => {
  console.log(">> Error: " + message);
});

// Read user input
rl.on("line", (line) => {
  const input = line.trim();
  if (!input) return;

  if (input.startsWith("/start ")) {
    const otherUserId = Number(input.split(" ")[1]);
    console.log("Starting chat with User " + otherUserId + "...");
    socket.emit("start-chat", { user1Id: userId, user2Id: otherUserId });
  } else if (input === "/end") {
    if (!currentSessionId) {
      console.log("No active chat session.");
    } else {
      socket.emit("end-chat", { sessionId: currentSessionId });
    }
  } else {
    if (!currentSessionId) {
      console.log("No active chat. Use: /start <userId>");
    } else {
      socket.emit("send-message", { sessionId: currentSessionId, senderId: userId, content: input });
    }
  }
});

console.log("Commands:");
console.log("  /start <userId>  — start a chat with another user");
console.log("  /end             — end the current chat");
console.log("  <any text>       — send a message");
console.log("");
