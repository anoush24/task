import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} from "../controllers/task.controller.js";
import { protect, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

// Admin-only stats route (must be before /:id to avoid conflict)
router.get("/admin/stats", protect, isAdmin, getTaskStats);

// CRUD routes
router.route("/")
  .get(protect, getTasks)
  .post(protect, createTask);

router.route("/:id")
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

export default router;