import { ListFailuresData } from "src/app/@types/list-failures-data";
import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { Failure } from "src/domain/@types/failure";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { FailureRepository } from "src/domain/repository/failure-repository";
import { OrganizationRepository } from "src/domain/repository/organization-repository";

export class ListFailuresUseCase {

    constructor(
        private readonly failureRepository: FailureRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(data: ListFailuresData): Promise<Failure[]> {
        this.loggerProvider.debug("ListFailuresUseCase.execute", { data })

        const organization = await this.organizationRepository.findById(data.organizationId)

        if(!organization) throw new ResourceNotFoundException("Organization not found")

        const failures = await this.failureRepository.findAll(data)
        return failures
    }
    

}