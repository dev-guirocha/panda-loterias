/*
  Warnings:

  - You are about to alter the column `numbers_betted` on the `Bet` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numbers_betted" JSONB NOT NULL,
    "amount_wagered" DECIMAL NOT NULL,
    "amount_won" DECIMAL NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "game_type_id" INTEGER NOT NULL,
    "bet_type_id" INTEGER NOT NULL,
    "prize_tier_id" INTEGER NOT NULL,
    "draw_result_id" INTEGER NOT NULL,
    CONSTRAINT "Bet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_game_type_id_fkey" FOREIGN KEY ("game_type_id") REFERENCES "GameType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_bet_type_id_fkey" FOREIGN KEY ("bet_type_id") REFERENCES "BetType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_prize_tier_id_fkey" FOREIGN KEY ("prize_tier_id") REFERENCES "PrizeTier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_draw_result_id_fkey" FOREIGN KEY ("draw_result_id") REFERENCES "DrawResult" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bet" ("amount_wagered", "amount_won", "bet_type_id", "created_at", "draw_result_id", "game_type_id", "id", "numbers_betted", "prize_tier_id", "status", "user_id") SELECT "amount_wagered", "amount_won", "bet_type_id", "created_at", "draw_result_id", "game_type_id", "id", "numbers_betted", "prize_tier_id", "status", "user_id" FROM "Bet";
DROP TABLE "Bet";
ALTER TABLE "new_Bet" RENAME TO "Bet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
