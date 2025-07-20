import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

export async function pushPrismaSchemaToDatabase(dbUrl, projectId) {
  const tmpDir = "./tmp";
  const schemaPath = `${tmpDir}/schema-${projectId}.prisma`;

  // ✅ Ensure ./tmp directory exists
  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir);
  }

  const schemaContent = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = "${dbUrl}"
}

model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  password     String
  isVerified   Boolean  @default(false)
  otpCode      String?
  otpExpiresAt DateTime?
  createdAt    DateTime @default(now())
}
`;

  try {
    // 1. Write schema file
    await writeFile(schemaPath, schemaContent);

    // 2. Push schema to DB using Prisma
    await execAsync(`npx prisma db push --schema=${schemaPath}`);

    // 3. Cleanup
    await unlink(schemaPath);
  } catch (error) {
    console.error("❌ Prisma DB Push Error:", error);
    throw new Error("Failed to push Prisma schema to user DB");
  }
}
