-- CreateTable
CREATE TABLE "survey_sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_sets_name_key" ON "survey_sets"("name");

-- AlterTable
ALTER TABLE "survey_config" ADD COLUMN "surveySetId" TEXT;

-- AlterTable
ALTER TABLE "survey_responses" ADD COLUMN "surveySetId" TEXT;

-- AlterTable
ALTER TABLE "survey_sections" ADD COLUMN "surveySetId" TEXT;

-- AlterTable
ALTER TABLE "survey_questions" ADD COLUMN "surveySetId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "survey_sections_surveySetId_sectionKey_key" ON "survey_sections"("surveySetId", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "survey_questions_surveySetId_section_questionNumber_key" ON "survey_questions"("surveySetId", "section", "questionNumber");

-- AddForeignKey
ALTER TABLE "survey_config" ADD CONSTRAINT "survey_config_surveySetId_fkey" FOREIGN KEY ("surveySetId") REFERENCES "survey_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_surveySetId_fkey" FOREIGN KEY ("surveySetId") REFERENCES "survey_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_sections" ADD CONSTRAINT "survey_sections_surveySetId_fkey" FOREIGN KEY ("surveySetId") REFERENCES "survey_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_surveySetId_fkey" FOREIGN KEY ("surveySetId") REFERENCES "survey_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
