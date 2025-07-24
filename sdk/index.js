const BASE_URL = "https://umair-auth-production.up.railway.app"; // or localhost during dev

// 🚀 Register new project
export async function initProject({ name, dbUrl, jwtSecret }) {
  const res = await fetch(`${BASE_URL}/initProject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, dbUrl, jwtSecret })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Project init failed");
  return data; // { projectId, ... }
}

// ✅ Register User
export async function registerUser({ name, email, password, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}

// ✅ Login User (sends OTP)
export async function loginUser({ email, password, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

// ✅ Verify signup OTP
export async function verifySignupOtp({ email, otp, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/verify-signup-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ email, otp })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "OTP verification failed");
  return data;
}

// ✅ Resend signup OTP
export async function resendSignupOtp({ email, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/reset-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Resend OTP failed");
  return data;
}

// ✅ Forgot password (send OTP)
export async function forgotPassword({ email, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send OTP");
  return data;
}

// ✅ Verify forgot password OTP
export async function verifyForgotOtp({ email, otp, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/verify-forgot-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ email, otp })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "OTP verification failed");
  return data;
}

// ✅ Reset password
export async function resetPassword({ email, newPassword, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ email, newPassword })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Password reset failed");
  return data;
}
