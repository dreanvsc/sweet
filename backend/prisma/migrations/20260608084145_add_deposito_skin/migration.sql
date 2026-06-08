-- AlterTable
ALTER TABLE "Caixa" ADD COLUMN     "isEvento" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contaVerificada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pedidoVerificacao" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Giveaway" (
    "id" SERIAL NOT NULL,
    "premioNome" TEXT NOT NULL,
    "premioImagem" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "depositoMinimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diasDeposito" INTEGER NOT NULL DEFAULT 7,
    "terminaEm" TIMESTAMP(3),
    "participantesMinimos" INTEGER NOT NULL DEFAULT 0,
    "horasContagem" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "serverSeed" TEXT,
    "publicSeed" TEXT,
    "vencedorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Giveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipanteGiveaway" (
    "id" SERIAL NOT NULL,
    "giveawayId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipanteGiveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerEvento" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "imagem" TEXT NOT NULL DEFAULT 'https://link-da-imagem-padrao.jpg',
    "titulo" TEXT NOT NULL DEFAULT 'HIGH RISK ZONE',
    "descricao" TEXT NOT NULL DEFAULT 'Abre as caixas exclusivas deste evento...',
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BannerEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositoSkin" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "skinNome" TEXT NOT NULL,
    "skinImagem" TEXT NOT NULL,
    "skinAssetId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepositoSkin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParticipanteGiveaway_giveawayId_userId_key" ON "ParticipanteGiveaway"("giveawayId", "userId");

-- AddForeignKey
ALTER TABLE "Giveaway" ADD CONSTRAINT "Giveaway_vencedorId_fkey" FOREIGN KEY ("vencedorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteGiveaway" ADD CONSTRAINT "ParticipanteGiveaway_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "Giveaway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteGiveaway" ADD CONSTRAINT "ParticipanteGiveaway_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositoSkin" ADD CONSTRAINT "DepositoSkin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
