CREATE TABLE "EventSchedule" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "familyTime" TEXT,
    "friendsTime" TEXT,
    "otherTime" TEXT,
    CONSTRAINT "EventSchedule_pkey" PRIMARY KEY ("id")
);
