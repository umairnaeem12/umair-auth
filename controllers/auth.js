import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    verifyForgotOtpSchema,
    verifySignupOtpSchema,
} from "../validation/auth.js";

import {
    loginUser,
    registerUser,
    verifySignupOtp,
    resetOtp,
    forgotYourPassword,
    verifyForgetOtp,
    resetYourPassword,
} from "../services/auth.js";

export async function register(req, res) {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return res
            .status(400)
            .json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const projectId = req.projectId;
        const response = await registerUser(projectId, result.data);
        res.status(201).json(response);
    } catch (error) {
        console.error("Register Controller Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
}

export async function login(req, res) {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const response = await loginUser(result.data, req.projectId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Login Controller Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
}

export async function verifyLoginOtp(req, res) {
  const result = verifySignupOtpSchema.safeParse(req.body);
  if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }
    
    const projectId = req.headers["x-project-id"] || req.body.projectId || req.projectId;
    console.log("🚀 ~ verifyLoginOtp ~ projectId:", projectId)
  if (!projectId) {
    return res.status(400).json({ error: "Missing project ID" });
  }

  try {
    const response = await verifySignupOtp(result.data, projectId);
    res.status(200).json(response);
  } catch (error) {
    console.error("Verify Signup OTP Controller Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
}

export async function resetLoginOtp(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const response = await resetOtp(email, req.projectId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Reset OTP Controller Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
}

export async function forgotPassword(req, res) {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const response = await forgotYourPassword(result.data.email, req.projectId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Forgot Password Controller Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
}

export async function verifyForgotOtp(req, res) {
    const result = verifyForgotOtpSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const response = await verifyForgetOtp(result.data, req.projectId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Verify Forgot OTP Controller Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
}

export async function resetPassword(req, res) {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const response = await resetYourPassword(result.data, req.projectId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Reset Password Controller Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
}
