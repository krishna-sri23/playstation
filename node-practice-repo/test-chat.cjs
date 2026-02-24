const { io } = require("socket.io-client");

const URL = "http://localhost:3000";

// Connect as User 1
const socket1 = io(URL);
// Connect as User 2
const socket2 = io(URL);

let onlineCount = 0;

// --- User 1 listeners ---
socket1.on("connect", () => {
  console.log("[User1] Connected:", socket1.id);
  socket1.emit("user-online", 1);
});

socket1.on("chat-started", ({ sessionId, chatId, withUserId }) => {
  console.log("[User1] Chat started! sessionId=" + sessionId + ", chatId=" + chatId + ", with user " + withUserId);

  // Send a message after chat starts
  console.log("[User1] Sending: Hello from User 1!");
  socket1.emit("send-message", { sessionId, senderId: 1, content: "Hello from User 1!" });

  // User 2 replies after a short delay
  setTimeout(() => {
    console.log("[User2] Sending: Hey! User 2 here!");
    socket2.emit("send-message", { sessionId, senderId: 2, content: "Hey! User 2 here!" });
  }, 1000);

  // End chat after messages are exchanged
  setTimeout(() => {
    console.log("\n[User1] Ending chat...");
    socket1.emit("end-chat", { sessionId });
  }, 3000);
});

socket1.on("receive-message", ({ sessionId, senderId, content, timestamp }) => {
  console.log("[User1] Received message from user " + senderId + ': "' + content + '" at ' + timestamp);
});

socket1.on("chat-ended", ({ sessionId, chatId, messageCount }) => {
  console.log("[User1] Chat ended! " + messageCount + " messages flushed to MySQL");
  console.log("\n--- Test complete! Check REST endpoints: ---");
  console.log("curl http://localhost:3000/api/chats/user/1");
  console.log("curl http://localhost:3000/api/chats/" + chatId + "/history");
  setTimeout(() => process.exit(0), 1000);
});

// --- User 2 listeners ---
socket2.on("connect", () => {
  console.log("[User2] Connected:", socket2.id);
  socket2.emit("user-online", 2);
});

socket2.on("chat-started", ({ sessionId, chatId, withUserId }) => {
  console.log("[User2] Chat started! sessionId=" + sessionId + ", chatId=" + chatId + ", with user " + withUserId);
});

socket2.on("receive-message", ({ sessionId, senderId, content, timestamp }) => {
  console.log("[User2] Received message from user " + senderId + ': "' + content + '" at ' + timestamp);
});

socket2.on("chat-ended", ({ sessionId, chatId, messageCount }) => {
  console.log("[User2] Chat ended! " + messageCount + " messages flushed to MySQL");
});

// --- Start the chat once both users are online ---
socket1.on("user-status-changed", ({ userId, status }) => {
  if (status === "online") onlineCount++;
  if (onlineCount === 2) {
    console.log("\n--- Both users online. Starting chat... ---\n");
    socket1.emit("start-chat", { user1Id: 1, user2Id: 2 });
  }
});
