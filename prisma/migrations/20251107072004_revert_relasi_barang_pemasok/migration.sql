/*
  Warnings:

  - You are about to drop the column `pemasokId` on the `Barang` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Barang" DROP CONSTRAINT "Barang_pemasokId_fkey";

-- AlterTable
ALTER TABLE "Barang" DROP COLUMN "pemasokId";
