-- AlterTable
ALTER TABLE "Barang" ADD COLUMN     "pemasokId" TEXT;

-- AddForeignKey
ALTER TABLE "Barang" ADD CONSTRAINT "Barang_pemasokId_fkey" FOREIGN KEY ("pemasokId") REFERENCES "Pemasok"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
