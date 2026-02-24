/*
- import 'dotenv/config' — loads .env first, before anything else uses process.env
- express.json() — parses incoming JSON request bodies so you can access req.body
- sequelize.authenticate() — tests the DB connection, throws error if it can't connect
- sequelize.sync() — creates tables for all your defined models if they don't exist yet
- process.exit(1) — kills the app if DB connection fails (no point running without a DB)
- SIGINT — you press Ctrl+C in terminal
- SIGTERM — docker stop, kill <pid>, or process managers like PM2 send this
- uncaughtException — an error was thrown and nothing caught it
- unhandledRejection — a Promise rejected and no .catch() handled it
*/
import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import sequelize from "./config/db.js";
import redisClient from "./config/redis.js";
import { errorHandler } from './middlewares/errorHandler.js';
import "./models/index.js";
import routes from "./routes/index.js";
import { setupSocket } from "./socket/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and attach socket.io
const server = http.createServer(app);
setupSocket(server);

// Parse JSON request bodies
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running fine" });
});

app.use("/api", routes);

app.use(errorHandler);

// Start server and connect to DB
const start = async () => {
  try {
    await redisClient.connect();
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync({
        alter: true
    });
    console.log("Models synced");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
start();

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close();
  await redisClient.quit();
  await sequelize.close();
  console.log("Database and Redis connections closed");
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C
process.on("SIGTERM", () => shutdown("SIGTERM")); // Docker stop / kill command
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
