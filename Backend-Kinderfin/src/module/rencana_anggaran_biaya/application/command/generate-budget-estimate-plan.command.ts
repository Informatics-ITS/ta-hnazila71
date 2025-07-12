import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    BudgetEstimatePlanEntity,
    BudgetEstimatePlanProps,
} from "../../domain/entity";
import { BudgetEstimatePlanRequestedEvent } from "../../domain/event";
import { IBudgetEstimatePlanRepository } from "../../domain/repository";

export interface GenerateBudgetEstimatePlanCommand {
    tahun: number;
}

export class GenerateBudgetEstimatePlanCommandHandler
    implements ICommandHandler<GenerateBudgetEstimatePlanCommand, boolean>
{
    constructor(
        private readonly budgetEstimatePlanRepository: IBudgetEstimatePlanRepository,
        private readonly eventBus: EventBus,
    ) {}

    async execute(
        command: GenerateBudgetEstimatePlanCommand,
    ): Promise<boolean> {
        const { tahun } = command;
        try {
            this.eventBus.removeSpecificListener("BudgetEstimatePlanRetrieved");
            this.eventBus.publish(
                "BudgetEstimatePlanRequested",
                new BudgetEstimatePlanRequestedEvent(
                    { tahun: tahun },
                    "BudgetEstimatePlanRequested",
                ),
            );
            let budgetEstimatePlans = [] as BudgetEstimatePlanProps[];
            await new Promise<void>((resolve, reject) => {
                this.eventBus.subscribe(
                    "BudgetEstimatePlanRetrieved",
                    async (generatedBudgetEstimatePlan: any) => {
                        try {
                            if (
                                generatedBudgetEstimatePlan.data.status ==
                                "error"
                            ) {
                                throw new ApplicationError(
                                    generatedBudgetEstimatePlan.data.code,
                                    generatedBudgetEstimatePlan.data.message,
                                );
                            }
                            budgetEstimatePlans =
                                generatedBudgetEstimatePlan.data;
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    },
                );
            });
            if (budgetEstimatePlans.length != 0) {
                await this.budgetEstimatePlanRepository.refreshBudgetEstimatePlan(
                    tahun,
                    budgetEstimatePlans.map((budgetEstimatePlan) => {
                        return new BudgetEstimatePlanEntity<BudgetEstimatePlanProps>(
                            budgetEstimatePlan,
                        );
                    }),
                );
                return true;
            }
            await this.budgetEstimatePlanRepository.refreshBudgetEstimatePlan(
                tahun,
            );
            return false;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
