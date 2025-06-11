import { ForbiddenException } from "src/app/exceptions/forbidden-exception";
import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { Solution } from "src/domain/@types/solution";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { OrganizationRepository } from "src/domain/repository/organization-repository";
import { SolutionRepository } from "src/domain/repository/solution-repository";

export class GetSolutionUseCase {

    constructor(
        private readonly solutionRepository: SolutionRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(solutionId: string, organizationId: string): Promise<Solution> {
        this.loggerProvider.debug("GetSolutionUseCase.execute", { solutionId, organizationId })

        const organization = await this.organizationRepository.findById(organizationId)

        if(!organization) throw new ResourceNotFoundException("Organization not found")

        const solution = await this.solutionRepository.findById(solutionId)

        if(!solution) throw new ResourceNotFoundException("Solution not found")

        if(solution.organizationId !== organizationId) throw new ForbiddenException("Solution not found in organization")

        return solution
    }

}