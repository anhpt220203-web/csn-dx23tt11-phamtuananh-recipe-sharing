-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "cookTime" INTEGER,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "ingredients" TEXT[],
ADD COLUMN     "servings" INTEGER,
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "steps" TEXT[];
