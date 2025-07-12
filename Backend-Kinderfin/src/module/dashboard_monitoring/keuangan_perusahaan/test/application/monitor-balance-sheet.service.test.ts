import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    IMonitorBalanceSheetApplicationService,
    MonitorBalanceSheetApplicationService,
} from "../../application/query";
import { BalanceSheetEntity } from "../../domain/entity";
import { Asset, Liability } from "../../domain/value_object";

describe("Testing Monitor Balance Sheet Service", () => {
    const balanceSheetDataResultSubscribe = {
        saldo_tahun_lalu: 3000000,
        saldo_penerimaan_program_reguler: 7000000,
        saldo_kerja_sama: 2000000,
        kas: 12000000,
        piutang_usaha: 1000000,
        inventaris: 500000,
        penyusutan_inventaris: 50000,
        pendapatan_yang_belum_diterima: null,
        hutang_usaha: 500000,
        hutang_bank: 700000,
        laba_ditahan: 12250000,
    };

    const balanceSheetResult = new BalanceSheetEntity(2023);
    balanceSheetResult.setAktiva(
        new Asset(12000000, 1000000, 500000, 50000, null),
    );
    balanceSheetResult.setTotalAktiva(13450000);
    balanceSheetResult.setPasiva(new Liability(500000, 700000, 12250000));
    balanceSheetResult.setTotalPasiva(13450000);

    const [
        balanceSheetPostDataRequestedEventName,
        balanceSheetPostDataRetrievedEventName,
    ] = ["BalanceSheetPostDataRequested", "BalanceSheetPostDataRetrieved"];

    const mockData = {
        json: jest.fn(),
        removeSpecificListener: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === balanceSheetPostDataRetrievedEventName) {
                callback({
                    data: balanceSheetDataResultSubscribe,
                    eventName: balanceSheetPostDataRetrievedEventName,
                });
            }
        }),
        subscribeError: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === balanceSheetPostDataRetrievedEventName) {
                callback({
                    data: {
                        status: "error",
                        code: StatusCodes.INTERNAL_SERVER_ERROR,
                        message: "Internal Server Error",
                    },
                    eventName: balanceSheetPostDataRetrievedEventName,
                });
            }
        }),
    };

    let eventBus: EventBus;
    let monitorBalanceSheetApplicationService: IMonitorBalanceSheetApplicationService;

    beforeEach(() => {
        jest.clearAllMocks();
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        monitorBalanceSheetApplicationService =
            new MonitorBalanceSheetApplicationService(eventBus);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const year = 2023;
    const requestEvent = {
        data: { tahun: year },
    };
    describe("Monitor Balance Sheet Service", () => {
        it("should success retrieve balance sheet data", async () => {
            const balanceSheet =
                await monitorBalanceSheetApplicationService.retrieveBalanceSheetData(
                    year,
                );

            expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                balanceSheetPostDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                balanceSheetPostDataRequestedEventName,
                {
                    ...requestEvent,
                    eventName: balanceSheetPostDataRequestedEventName,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenCalledWith(
                balanceSheetPostDataRetrievedEventName,
                expect.any(Function),
            );
            expect(balanceSheet).toEqual(
                expect.objectContaining({
                    ...balanceSheetResult,
                    id: expect.anything(),
                }),
            );
        });

        it("should error retrieve balance sheet data on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await monitorBalanceSheetApplicationService.retrieveBalanceSheetData(
                    year,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    balanceSheetPostDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    balanceSheetPostDataRequestedEventName,
                    {
                        ...requestEvent,
                        eventName: balanceSheetPostDataRequestedEventName,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    balanceSheetPostDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
