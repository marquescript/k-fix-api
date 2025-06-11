import { ForbiddenException } from "src/app/exceptions/forbidden-exception";
import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { FailureStatus } from "src/domain/@types/enums/failure-status";
import { Failure } from "src/domain/@types/failure";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { FailureRepository } from "src/domain/repository/failure-repository";
import { OrganizationRepository } from "src/domain/repository/organization-repository";

type CreateFailureUseCaseData = Omit<Failure, "id" | "createdAt" | "updatedAt" | "status">

export class CreateFailureUseCase {

    constructor(
        private readonly failureRepository: FailureRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(data: CreateFailureUseCaseData): Promise<Failure>{
        this.loggerProvider.debug("CreateFailureUseCase.execute", { data })

        const organization = await this.organizationRepository.findById(data.organizationId)

        if(!organization) throw new ResourceNotFoundException("Organization not found")

        const userExistsInOrganization = await this.organizationRepository.findUserExistsInOrganization(data.userCreateId, data.organizationId)

        if(!userExistsInOrganization) throw new ForbiddenException("User not found in organization")

        const dateNow = new Date()

        const failure: Failure = {
            ...data,
            status: FailureStatus.OPEN,
            createdAt: dateNow,
            updatedAt: dateNow
        }

        const createdFailure = await this.failureRepository.create(failure)

        this.loggerProvider.info("CreateFailureUseCase.execute", {
            message: "Failure created successfully",
            failure: createdFailure
        })

        return createdFailure
    }

}