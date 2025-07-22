// services/initProject.js
import { globalPg } from "../utils/globalPgClient.js";
import { v4 as uuidv4 } from "uuid";

export async function initProject(req, res) {
  const { name, dbUrl, jwtSecret } = req.body;

  try {
    const id = uuidv4();

    await globalPg.query(
      `INSERT INTO "Project" (id, name, db_url, jwt_secret) VALUES ($1, $2, $3, $4)`,
      [id, name, dbUrl, jwtSecret]
    );

    return res.status(201).json({
      message: "Project initialized",
      projectId: id,
    });
  } catch (error) {
    console.error("❌ Failed to init project:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
