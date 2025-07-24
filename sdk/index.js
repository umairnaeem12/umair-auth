// umair-auth/index.js (Frontend SDK - stateless version)

const BASE_URL = "https://umair-auth-production.up.railway.app";
let currentProjectId = null; // 🔐 Stored globally in SDK memory

// 🚀 Called once to register a new project (tenant)
export async function initProject({ name, dbUrl, jwtSecret }) {
  const res = await fetch(`${BASE_URL}/initProject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, dbUrl, jwtSecret })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Project init failed");

  currentProjectId = data.projectId; // ✅ Store projectId globally
  console.log("✅ Project initialized with ID:", currentProjectId);

  return data;
}

// ✅ Use this for any call that needs projectId
function getProjectIdOrThrow() {
  if (!currentProjectId) throw new Error("Project is not initialized. Call initProject() first.");
  return currentProjectId;
}

// ✅ Register User
export async function registerUser({ name, email, password, projectId = null }) {
  const finalProjectId = projectId || getProjectIdOrThrow();
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": finalProjectId
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}

// ✅ Login User
export async function loginUser({ email, password }) {
  const projectId = getProjectIdOrThrow();
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


export async function verifySignupOtp({ email, otp, projectName }) {
  const projectId = await getProjectIdByName(projectName);
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

export async function resendSignupOtp({ email, projectName }) {
  const projectId = await getProjectIdByName(projectName);
  const res = await fetch(`${BASE_URL}/auth/resend-signup-otp`, {
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
