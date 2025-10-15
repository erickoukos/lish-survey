-- AlterTable
ALTER TABLE "survey_config" ALTER COLUMN "surveySetId" SET NOT NULL;

-- AlterTable
ALTER TABLE "survey_responses" ALTER COLUMN "surveySetId" SET NOT NULL;

-- AlterTable
ALTER TABLE "survey_sections" ALTER COLUMN "surveySetId" SET NOT NULL;

-- AlterTable
ALTER TABLE "survey_questions" ALTER COLUMN "surveySetId" SET NOT NULL;
