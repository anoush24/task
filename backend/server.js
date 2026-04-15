import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";



const app = express();
const PORT = process.env.PORT || 5000;

// security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// cors
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // needed for httpOnly cookies
  })
);

// body parsing and cookie parsing
app.use(express.json({ limit: "10kb" })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// logging (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// api docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "TaskFlow API Docs",
    customCss: ".swagger-ui .topbar { background-color: #10b981; }",
  })
);

// api routes(versioned)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);

// health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "TaskFlow API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// database connection and server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Docs at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });