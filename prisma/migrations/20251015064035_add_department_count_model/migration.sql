-- CreateTable
CREATE TABLE "department_counts" (
    "id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "staffCount" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_counts_pkey" PRIMARY KEY ("id")
);
