-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "dbUrl" TEXT NOT NULL,
    "jwtSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
