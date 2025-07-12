import { MasterDataEntity, MasterDataProps } from "../../domain/entity";

describe("Testing Master Data Entity", () => {
    const mockMasterData: MasterDataProps =
    {
        id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
        tipe: "Jenis Pembayaran",
        nilai: "Daftar Ujian",
        aturan: "Nomor Pendaftaran",
        deskripsi:
            "Jenis pembayaran untuk pendaftaran calon mahasiswa PIKTI",
    }

    describe("Constructor New Master Data Entity", () => {
        it("should success match new master data entity", async () => {
            const newMasterData = new MasterDataEntity<MasterDataProps>(mockMasterData)

            expect(newMasterData.id).toEqual(mockMasterData.id);
            expect(newMasterData.getTipe()).toEqual(mockMasterData.tipe);
            expect(newMasterData.getNilai()).toEqual(mockMasterData.nilai);
            expect(newMasterData.getAturan()).toEqual(mockMasterData.aturan);
            expect(newMasterData.getDeskripsi()).toEqual(mockMasterData.deskripsi);
        });
    });
});
