-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT,
    "year" INTEGER,
    "level" TEXT NOT NULL,
    "coverUrl" TEXT,
    "geniusUrl" TEXT,
    "duration" INTEGER,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "lyrics" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LyricsLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "songId" TEXT NOT NULL,
    "lineIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "startMs" INTEGER,
    "endMs" INTEGER,
    "translation" TEXT,
    "culturalNote" TEXT,
    "enrichedAt" DATETIME,
    CONSTRAINT "LyricsLine_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordEnrichment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "songId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "lineIndex" INTEGER NOT NULL,
    CONSTRAINT "WordEnrichment_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
