/*
  Warnings:

  - You are about to drop the column `sectionId` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nrcId` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nrcId` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Assessment" DROP CONSTRAINT "Assessment_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Enrollment" DROP CONSTRAINT "Enrollment_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Section" DROP CONSTRAINT "Section_courseId_fkey";

-- AlterTable
ALTER TABLE "public"."Assessment" DROP COLUMN "sectionId",
ADD COLUMN     "nrcId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Enrollment" DROP COLUMN "sectionId",
ADD COLUMN     "nrcId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Section";

-- CreateTable
CREATE TABLE "public"."Nrc" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "schedule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nrc_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Nrc" ADD CONSTRAINT "Nrc_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_nrcId_fkey" FOREIGN KEY ("nrcId") REFERENCES "public"."Nrc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_nrcId_fkey" FOREIGN KEY ("nrcId") REFERENCES "public"."Nrc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
