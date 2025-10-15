-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "virtual_credits" DECIMAL NOT NULL DEFAULT 1000.00,
    "is_admin" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "GameType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "PrizeTier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "start_prize" INTEGER NOT NULL,
    "end_prize" INTEGER NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "DrawSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "draw_time" TEXT NOT NULL,
    "bet_close_time" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BetType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PayoutRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payout_rate" DECIMAL NOT NULL,
    "bet_type_id" INTEGER NOT NULL,
    "prize_tier_id" INTEGER NOT NULL,
    CONSTRAINT "PayoutRule_bet_type_id_fkey" FOREIGN KEY ("bet_type_id") REFERENCES "BetType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PayoutRule_prize_tier_id_fkey" FOREIGN KEY ("prize_tier_id") REFERENCES "PrizeTier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrawResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "draw_date" DATETIME NOT NULL,
    "prize1_number" TEXT,
    "prize2_number" TEXT,
    "prize3_number" TEXT,
    "prize4_number" TEXT,
    "prize5_number" TEXT,
    "prize6_number" TEXT,
    "prize7_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "draw_schedule_id" INTEGER NOT NULL,
    CONSTRAINT "DrawResult_draw_schedule_id_fkey" FOREIGN KEY ("draw_schedule_id") REFERENCES "DrawSchedule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numbers_betted" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GameType_name_key" ON "GameType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PrizeTier_name_key" ON "PrizeTier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DrawSchedule_name_key" ON "DrawSchedule"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BetType_name_key" ON "BetType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutRule_bet_type_id_prize_tier_id_key" ON "PayoutRule"("bet_type_id", "prize_tier_id");

-- CreateIndex
CREATE UNIQUE INDEX "DrawResult_draw_schedule_id_draw_date_key" ON "DrawResult"("draw_schedule_id", "draw_date");
