# umair-auth

**Frontend SDK** for the Umair Auth API — lets you add full authentication to your app with one line of code. No backend required.

## 🚀 Features

- 🔐 Register & Login with OTP
- 🧠 Multi-tenant support (dynamic DB per project)
- 📨 Email-based signup, login, and password reset
- ✅ JWT-based login authentication
- 🪄 Minimal setup for frontend devs — no backend code needed!

---

## 📦 Installation

```bash
npm install umair-auth
```

---

## ⚙️ Setup

Before calling any auth method, initialize your project once:

```js
import { initProject } from 'umair-auth';

const { projectId } = await initProject({
  name: "Your App Name",
  dbUrl: "postgresql://your-user:your-pass@host:port/dbname?sslmode=require",
  jwtSecret: "your-secret-key"
});
```

Store `projectId` for use in all following API calls.

---

## 🧪 Usage

### ✅ Register User

```js
import { registerUser } from 'umair-auth';

await registerUser({
  name: "",
  email: "",
  password: "",
  projectId
});
```

---

### 🔐 Login User (Sends OTP)

```js
import { loginUser } from 'umair-auth';

await loginUser({
  email: "",
  password: "",
  projectId
});
```

---

### 📧 Verify Signup/Login OTP

```js
import { verifySignupOtp } from 'umair-auth';

await verifySignupOtp({
  email: "",
  otp: "",
  projectId
});
```

---

### 🔁 Resend Signup OTP

```js
import { resendSignupOtp } from 'umair-auth';

await resendSignupOtp({
  email: "",
  projectId
});
```

---

### 🔑 Forgot Password

```js
import { forgotPassword } from 'umair-auth';

await forgotPassword({
  email: "",
  projectId
});
```

---

### 🔐 Verify Forgot OTP

```js
import { verifyForgotOtp } from 'umair-auth';

await verifyForgotOtp({
  email: "",
  otp: "",
  projectId
});
```

---

### 🔁 Reset Password

```js
import { resetPassword } from 'umair-auth';

await resetPassword({
  email: "",
  newPassword: "",
  projectId
});
```

---

## 🧠 Notes

- Every function requires a valid `projectId` (received from `initProject`)
- Tokens returned from `registerUser` and `verifySignupOtp` are JWTs
- OTPs are sent via email (configured in your backend service)

---

## 🛠️ Coming Soon

- Google / Facebook social login
- Admin dashboard for tenant & user management
- Magic links and passwordless login

---

## 🧑‍💻 Author

Made with 💻 by **Umair Naeem**

---

## 📜 License

MIT