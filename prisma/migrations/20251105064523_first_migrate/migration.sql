-- CreateTable
CREATE TABLE "Barang" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "batasMin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pemasok" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kontak" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pemasok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tujuan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tujuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "pemasokId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoItem" (
    "id" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "barangId" TEXT NOT NULL,
    "jumlahPesan" INTEGER NOT NULL,

    CONSTRAINT "PoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemBarcode" (
    "barcode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "barangId" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemBarcode_pkey" PRIMARY KEY ("barcode")
);

-- CreateTable
CREATE TABLE "OutboundLog" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referensi" TEXT,
    "tujuanId" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,

    CONSTRAINT "OutboundLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pemasok_nama_key" ON "Pemasok"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Tujuan_nama_key" ON "Tujuan"("nama");

-- CreateIndex
CREATE INDEX "PoItem_poId_idx" ON "PoItem"("poId");

-- CreateIndex
CREATE INDEX "PoItem_barangId_idx" ON "PoItem"("barangId");

-- CreateIndex
CREATE UNIQUE INDEX "PoItem_poId_barangId_key" ON "PoItem"("poId", "barangId");

-- CreateIndex
CREATE INDEX "ItemBarcode_barangId_idx" ON "ItemBarcode"("barangId");

-- CreateIndex
CREATE INDEX "ItemBarcode_poId_idx" ON "ItemBarcode"("poId");

-- CreateIndex
CREATE INDEX "ItemBarcode_status_idx" ON "ItemBarcode"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OutboundLog_barcode_key" ON "OutboundLog"("barcode");

-- CreateIndex
CREATE INDEX "OutboundLog_tujuanId_idx" ON "OutboundLog"("tujuanId");

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_pemasokId_fkey" FOREIGN KEY ("pemasokId") REFERENCES "Pemasok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItem" ADD CONSTRAINT "PoItem_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItem" ADD CONSTRAINT "PoItem_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemBarcode" ADD CONSTRAINT "ItemBarcode_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemBarcode" ADD CONSTRAINT "ItemBarcode_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundLog" ADD CONSTRAINT "OutboundLog_tujuanId_fkey" FOREIGN KEY ("tujuanId") REFERENCES "Tujuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundLog" ADD CONSTRAINT "OutboundLog_barcode_fkey" FOREIGN KEY ("barcode") REFERENCES "ItemBarcode"("barcode") ON DELETE RESTRICT ON UPDATE CASCADE;
