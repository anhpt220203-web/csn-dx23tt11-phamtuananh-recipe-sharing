-- DropIndex
DROP INDEX "verification_token_key";

-- Rename the column so existing verification tokens remain available.
ALTER TABLE "verification" RENAME COLUMN "token" TO "value";
