import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    GenerateBudgetEstimatePlanCommand,
    GenerateBudgetEstimatePlanCommandHandler,
} from "../../application/command";
import {
    BudgetEstimatePlanEntity,
    BudgetEstimatePlanProps,
} from "../../domain/entity";
import { BudgetEstimatePlanRequestedEvent } from "../../domain/event";
import { IBudgetEstimatePlanRepository } from "../../domain/repository";
import { BudgetEstimatePlanRepository } from "../../infrastructure/storage/repository";

describe("Testing Generate Budget Estimate Plan Command", () => {
    const budgetEstimatePlanRequestedData: GenerateBudgetEstimatePlanCommand = {
        tahun: 2023,
    };

    const budgetEstimatePlanDataResult: BudgetEstimatePlanEntity<BudgetEstimatePlanProps>[] =
        [
            new BudgetEstimatePlanEntity<BudgetEstimatePlanProps>({
                tahun: 2023,
                aktivitas: "Honorarium",
                sub_aktivitas: "HR Test",
                jumlah: 3400000,
            } as BudgetEstimatePlanProps),
            new BudgetEstimatePlanEntity<BudgetEstimatePlanProps>({
                tahun: 2023,
                aktivitas: "Layanan Kantor",
                sub_aktivitas: "Cetak KTM",
                jumlah: 350000,
            } as BudgetEstimatePlanProps),
            new BudgetEstimatePlanEntity<BudgetEstimatePlanProps>({
                tahun: 2023,
                aktivitas: "Layanan Kantor",
                sub_aktivitas: "Pulsa",
                jumlah: 400000,
            } as BudgetEstimatePlanProps),
        ];

    const [
        budgetEstimatePlanRequestedEventName,
        budgetEstimatePlanRetrievedEventName,
        generateYear,
    ] = ["BudgetEstimatePlanRequested", "BudgetEstimatePlanRetrieved", 2023];

    const budgetEstimatePlanRequestedEvent =
        new BudgetEstimatePlanRequestedEvent(
            { tahun: generateYear },
            budgetEstimatePlanRequestedEventName,
        );

    const mockData = {
        refreshBudgetEstimatePlan: jest.fn(),
        refreshBudgetEstimatePlanError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        removeSpecificListener: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn().mockImplementationOnce((eventName, callback) => {
            if (eventName === budgetEstimatePlanRetrievedEventName) {
                callback({
                    data: [
                        {
                            aktivitas: "Honorarium",
                            sub_aktivitas: "HR Test",
                            tahun: 2023,
                            jumlah: 3400000,
                        },
                        {
                            aktivitas: "Layanan Kantor",
                            sub_aktivitas: "Cetak KTM",
                            tahun: 2023,
                            jumlah: 350000,
                        },
                        {
                            aktivitas: "Layanan Kantor",
                            sub_aktivitas: "Pulsa",
                            tahun: 2023,
                            jumlah: 400000,
                        },
                    ],
                    eventName: budgetEstimatePlanRetrievedEventName,
                });
            }
        }),
        subscribeClear: jest
            .fn()
            .mockImplementationOnce((eventName, callback) => {
                if (eventName === budgetEstimatePlanRetrievedEventName) {
                    callback({
                        data: [],
                        eventName: budgetEstimatePlanRetrievedEventName,
                    });
                }
            }),
        subscribeError: jest
            .fn()
            .mockImplementationOnce((eventName, callback) => {
                if (eventName === budgetEstimatePlanRetrievedEventName) {
                    callback({
                        data: {
                            status: "error",
                            code: StatusCodes.INTERNAL_SERVER_ERROR,
                            message: "Internal Server Error",
                        },
                        eventName: budgetEstimatePlanRetrievedEventName,
                    });
                }
            }),
    };

    let mockedDatabase: Sequelize;
    let budgetEstimatePlanRepository: IBudgetEstimatePlanRepository;
    let eventBus: EventBus;
    let generateBudgetEstimatePlanCommandHandler: ICommandHandler<
        GenerateBudgetEstimatePlanCommand,
        boolean
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        budgetEstimatePlanRepository = new BudgetEstimatePlanRepository(
            mockedDatabase,
        );
        budgetEstimatePlanRepository = {
            refreshBudgetEstimatePlan: mockData.refreshBudgetEstimatePlan,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        generateBudgetEstimatePlanCommandHandler =
            new GenerateBudgetEstimatePlanCommandHandler(
                budgetEstimatePlanRepository,
                eventBus,
            );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Execute Generate Budget Estimate Plan", () => {
        it("should success execute generate budget estimate plan", async () => {
            const refresh =
                await generateBudgetEstimatePlanCommandHandler.execute(
                    budgetEstimatePlanRequestedData,
                );

            expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                budgetEstimatePlanRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                budgetEstimatePlanRequestedEventName,
                {
                    ...budgetEstimatePlanRequestedEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenCalledWith(
                budgetEstimatePlanRetrievedEventName,
                expect.any(Function),
            );
            expect(
                budgetEstimatePlanRepository.refreshBudgetEstimatePlan,
            ).toHaveBeenCalledWith(
                generateYear,
                budgetEstimatePlanDataResult.map((budgetEstimatePlanData) => {
                    return expect.objectContaining({
                        ...budgetEstimatePlanData,
                        id: expect.anything(),
                    });
                }),
            );
            expect(refresh).toBeTruthy();
        });

        it("should success execute generate budget estimate plan only clear data", async () => {
            eventBus.subscribe = mockData.subscribeClear;

            const refresh =
                await generateBudgetEstimatePlanCommandHandler.execute(
                    budgetEstimatePlanRequestedData,
                );

            expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                budgetEstimatePlanRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                budgetEstimatePlanRequestedEventName,
                {
                    ...budgetEstimatePlanRequestedEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenCalledWith(
                budgetEstimatePlanRetrievedEventName,
                expect.any(Function),
            );
            expect(
                budgetEstimatePlanRepository.refreshBudgetEstimatePlan,
            ).toHaveBeenCalledWith(generateYear);
            expect(refresh).toBeFalsy();
        });

        it("should error execute generate budget estimate plan on refresh budget estimate plan", () => {
            budgetEstimatePlanRepository.refreshBudgetEstimatePlan =
                mockData.refreshBudgetEstimatePlanError;

            try {
                generateBudgetEstimatePlanCommandHandler.execute(
                    budgetEstimatePlanRequestedData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    budgetEstimatePlanRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    budgetEstimatePlanRequestedEventName,
                    {
                        ...budgetEstimatePlanRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    budgetEstimatePlanRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    budgetEstimatePlanRepository.refreshBudgetEstimatePlan,
                ).toHaveBeenCalledWith(
                    generateYear,
                    budgetEstimatePlanDataResult.map(
                        (budgetEstimatePlanData) => {
                            return expect.objectContaining({
                                ...budgetEstimatePlanData,
                                id: expect.anything(),
                            });
                        },
                    ),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute generate budget estimate plan on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await generateBudgetEstimatePlanCommandHandler.execute(
                    budgetEstimatePlanRequestedData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    budgetEstimatePlanRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    budgetEstimatePlanRequestedEventName,
                    {
                        ...budgetEstimatePlanRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    budgetEstimatePlanRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    budgetEstimatePlanRepository.refreshBudgetEstimatePlan,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
