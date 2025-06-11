import { ForbiddenException } from "src/app/exceptions/forbidden-exception";
import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { Failure } from "src/domain/@types/failure";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { FailureRepository } from "src/domain/repository/failure-repository";
import { OrganizationRepository } from "src/domain/repository/organization-repository";

export class GetFailureUseCase {

    constructor(
        private readonly failureRepository: FailureRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(failureId: string, organizationId: string): Promise<Failure> {
        this.loggerProvider.debug("GetFailureUseCase.execute", { failureId, organizationId })

        const failure = await this.failureRepository.findById(failureId)

        if(!failure) throw new ResourceNotFoundException("Failure not found")

        const organization = await this.organizationRepository.findById(organizationId)

        if(!organization) throw new ResourceNotFoundException("Organization not found")

        if(failure.organizationId !== organizationId) throw new ForbiddenException("Failure not found in organization")

        return failure
    }

}