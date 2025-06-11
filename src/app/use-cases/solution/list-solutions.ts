import { ForbiddenException } from "src/app/exceptions/forbidden-exception";
import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { Solution } from "src/domain/@types/solution";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { FailureRepository } from "src/domain/repository/failure-repository";
import { OrganizationRepository } from "src/domain/repository/organization-repository";
import { SolutionRepository } from "src/domain/repository/solution-repository";

export class ListSolutionsUseCase {

    constructor(
        private readonly solutionRepository: SolutionRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly failureRepository: FailureRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(failureId: string, organizationId: string, page: number = 1, limit: number = 10): Promise<{ solutions: Solution[], total: number, page: number, limit: number, totalPages: number }> {
        this.loggerProvider.debug("ListSolutionsUseCase.execute", { failureId, organizationId, page, limit })

        const organization = await this.organizationRepository.findById(organizationId)

        if(!organization) throw new ResourceNotFoundException("Organization not found")

        const failure = await this.failureRepository.findById(failureId)

        if(!failure) throw new ResourceNotFoundException("Failure not found")

        if(failure.organizationId !== organizationId) throw new ForbiddenException("Failure not found in organization")

        const { solutions, total } = await this.solutionRepository.findAll(failureId, page, limit)
        
        const totalPages = Math.ceil(total / limit)

        return {
            solutions,
            total,
            page,
            limit,
            totalPages
        }
    }
}