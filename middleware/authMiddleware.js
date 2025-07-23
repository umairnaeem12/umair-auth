import jwt from "jsonwebtoken";
import { globalPg } from "../utils/globalPg"; // adjust path if needed

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const projectId = req.headers["x-project-id"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  if (!projectId) {
    return res.status(400).json({ error: "Missing x-project-id header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 🔍 Get jwtSecret directly from control DB
    const result = await globalPg.query(
      `SELECT jwt_secret FROM "Project" WHERE id = $1 LIMIT 1`,
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const jwtSecret = result.rows[0].jwt_secret;

    const decoded = jwt.verify(token, jwtSecret);

    req.user = decoded;
    req.userId = decoded.userId;
    req.projectId = projectId;

    next();
  } catch (err) {
    console.error("🔐 Auth Middleware Error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
