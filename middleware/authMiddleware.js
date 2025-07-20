import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const projectId = req.headers["x-project-id"];

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  if (!projectId) {
    return res.status(400).json({ error: "Missing project ID" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 🔑 Fetch correct JWT secret from control DB
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: "Invalid project ID" });
    }

    const decoded = jwt.verify(token, project.jwtSecret);

    req.user = decoded; // { userId }
    req.projectId = projectId;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
