import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter } as any);
}

const prisma = createPrismaClient();

async function main() {
  await prisma.song.deleteMany();

  await prisma.song.createMany({
    data: [
      {
        id: "humble-kdot",
        title: "HUMBLE.",
        artist: "Kendrick Lamar",
        album: "DAMN.",
        year: 2017,
        level: "intermediate",
        coverUrl: null,
        geniusUrl: "https://genius.com/Kendrick-lamar-humble-lyrics",
        duration: 177,
        tags: JSON.stringify(["west coast", "introspective", "slang-heavy"]),
      },
      {
        id: "ny-state-nas",
        title: "N.Y. State of Mind",
        artist: "Nas",
        album: "Illmatic",
        year: 1994,
        level: "advanced",
        coverUrl: null,
        geniusUrl: "https://genius.com/Nas-ny-state-of-mind-lyrics",
        duration: 293,
        tags: JSON.stringify(["east coast", "storytelling", "dense-vocab"]),
      },
      {
        id: "empire-jz",
        title: "Empire State of Mind",
        artist: "Jay-Z ft. Alicia Keys",
        album: "The Blueprint 3",
        year: 2009,
        level: "beginner",
        coverUrl: null,
        geniusUrl: "https://genius.com/Jay-z-empire-state-of-mind-lyrics",
        duration: 276,
        tags: JSON.stringify(["new york", "cultural", "narrative"]),
      },
      {
        id: "alright-kdot",
        title: "Alright",
        artist: "Kendrick Lamar",
        album: "To Pimp a Butterfly",
        year: 2015,
        level: "beginner",
        coverUrl: null,
        geniusUrl: "https://genius.com/Kendrick-lamar-alright-lyrics",
        duration: 219,
        tags: JSON.stringify(["anthem", "social", "accessible"]),
      },
    ],
  });

  console.log("Seeded 4 songs successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
