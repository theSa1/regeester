/*
  Warnings:

  - Added the required column `email` to the `FormSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `FormSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Form" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bannerUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acceptResponsesUntil" DATETIME,
    "maxResponses" INTEGER,
    "requireAuthentication" BOOLEAN NOT NULL DEFAULT false,
    "allowMultipleSubmissions" BOOLEAN NOT NULL DEFAULT true,
    "eventName" TEXT,
    "eventDate" TEXT,
    "eventTime" TEXT,
    "venueAddress" TEXT,
    "venueName" TEXT,
    "eventDescription" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "nameFieldPlaceholder" TEXT,
    "nameFieldHelpText" TEXT,
    "emailFieldPlaceholder" TEXT,
    "emailFieldHelpText" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Form_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Form" ("createdAt", "createdBy", "description", "id", "isActive", "isPublished", "title", "updatedAt") SELECT "createdAt", "createdBy", "description", "id", "isActive", "isPublished", "title", "updatedAt" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
CREATE INDEX "Form_createdBy_idx" ON "Form"("createdBy");
CREATE INDEX "Form_isPublished_isActive_idx" ON "Form"("isPublished", "isActive");
CREATE TABLE "new_FormSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "submittedBy" TEXT,
    "data" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormSubmission_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FormSubmission" ("data", "formId", "id", "ipAddress", "submittedAt", "submittedBy", "userAgent") SELECT "data", "formId", "id", "ipAddress", "submittedAt", "submittedBy", "userAgent" FROM "FormSubmission";
DROP TABLE "FormSubmission";
ALTER TABLE "new_FormSubmission" RENAME TO "FormSubmission";
CREATE INDEX "FormSubmission_formId_idx" ON "FormSubmission"("formId");
CREATE INDEX "FormSubmission_submittedBy_idx" ON "FormSubmission"("submittedBy");
CREATE INDEX "FormSubmission_formId_submittedAt_idx" ON "FormSubmission"("formId", "submittedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
