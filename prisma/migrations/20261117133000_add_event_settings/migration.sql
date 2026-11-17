CREATE TABLE "EventSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "deadline" TEXT NOT NULL,
    CONSTRAINT "EventSetting_pkey" PRIMARY KEY ("id")
);

INSERT INTO "EventSetting" ("id", "deadline")
VALUES (1, '2026-11-21T23:59:59+07:00');
