import express from "express";
import cors from "cors"; // ✅ Import CORS
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { dataBaseSetup } from "./controllers/dbSetup.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.post("/setup", dataBaseSetup);

app.listen(4000, () => console.log("Server running at http://localhost:4000"));
