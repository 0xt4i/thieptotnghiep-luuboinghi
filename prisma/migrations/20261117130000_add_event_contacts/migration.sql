CREATE TABLE "EventContact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventContact_pkey" PRIMARY KEY ("id")
);

INSERT INTO "EventContact" ("id", "name", "phone", "sortOrder")
VALUES
    ('event-contact-thuc-man', 'Thục Mẫn', '0905.002.738', 0),
    ('event-contact-huu-tai', 'Hữu Tài', '0707.235.370', 1);
