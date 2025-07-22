import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { initProject } from "./services/initProject.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.post("/initProject", initProject)

app.listen(4000, () => console.log("Server running at http://localhost:4000"));
