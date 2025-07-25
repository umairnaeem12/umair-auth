import express from "express";
import {
  login,
  register,
  resetLoginOtp,
  verifyLoginOtp,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
  getProjectIdByName
} from "../controllers/auth.js";

const router = express.Router();

// ❗ These routes DON'T require x-project-id
router.get("/get-project-id", getProjectIdByName);

// ✅ These routes require x-project-id
router.use((req, res, next) => {
  const projectId = req.headers["x-project-id"];
  if (!projectId) {
    return res.status(400).json({ error: "Missing x-project-id header" });
  }
  req.projectId = projectId;
  next();
});

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyLoginOtp);
router.post("/reset-otp", resetLoginOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password", resetPassword);

export default router;
