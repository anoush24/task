import express from "express";
import { register, login, refreshToken, logout, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication endpoints
 */

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;