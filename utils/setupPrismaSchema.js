import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function pushPrismaSchemaToDatabase(dbUrl, projectId) {
  const tmpDir = "./prisma/tenants";
  const schemaPath = `${tmpDir}/schema-${projectId}.prisma`;

  // ✅ Ensure ./tmp directory exists
  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir);
  }

  const schemaContent = `
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["clientExtensions"]
  output = "./prisma/tenants/generated-${projectId}"
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
    // 1. Write the temp schema file
    await writeFile(schemaPath, schemaContent);

    // 2. Push the schema to DB
    await execAsync(`npx prisma db push --schema=${schemaPath}`);

    // 3. Generate the Prisma client for that schema
    await execAsync(`npx prisma generate --schema=${schemaPath}`);

    // 4. Optional: brief delay to allow schema availability
    await new Promise(res => setTimeout(res, 1000));

    // 5. Cleanup
    await unlink(schemaPath);

    console.log(`✅ Schema pushed and client generated for ${projectId}`);
  } catch (error) {
    console.error("❌ Prisma DB Push Error:", error);
    throw new Error("Failed to push Prisma schema to user DB");
  }
}
