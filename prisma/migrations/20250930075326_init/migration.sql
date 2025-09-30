-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "awareness" TEXT NOT NULL,
    "urgentTrainings" TEXT NOT NULL,
    "urgentTrainingsOther" TEXT,
    "financeWellnessNeeds" TEXT NOT NULL,
    "cultureWellnessNeeds" TEXT NOT NULL,
    "cultureWellnessOther" TEXT,
    "digitalSkillsNeeds" TEXT NOT NULL,
    "digitalSkillsOther" TEXT,
    "professionalDevNeeds" TEXT NOT NULL,
    "professionalDevOther" TEXT,
    "confidenceLevel" TEXT NOT NULL,
    "facedUnsureSituation" BOOLEAN NOT NULL,
    "unsureSituationDescription" TEXT,
    "observedIssues" TEXT NOT NULL,
    "observedIssuesOther" TEXT,
    "knewReportingChannel" TEXT NOT NULL,
    "trainingMethod" TEXT NOT NULL,
    "trainingMethodOther" TEXT,
    "refresherFrequency" TEXT NOT NULL,
    "prioritizedPolicies" TEXT NOT NULL,
    "prioritizationReason" TEXT NOT NULL,
    "policyChallenges" TEXT NOT NULL,
    "complianceSuggestions" TEXT NOT NULL,
    "generalComments" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Policy Awareness Survey',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_config_pkey" PRIMARY KEY ("id")
);
