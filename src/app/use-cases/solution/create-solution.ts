import { CreateSolutionData } from "src/app/@types/create-solution-data";
import { ForbiddenException } from "src/app/exceptions/forbidden-exception";
import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { Solution } from "src/domain/@types/solution";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { FailureRepository } from "src/domain/repository/failure-repository";
import { OrganizationRepository } from "src/domain/repository/organization-repository";
import { SolutionRepository } from "src/domain/repository/solution-repository";

export class CreateSolutionUseCase {

    constructor(
        private readonly solutionRepository: SolutionRepository,
        private readonly failureRepository: FailureRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(data: CreateSolutionData):Promise<Solution> {
        this.loggerProvider.info(`Creating solution for failure ${data.failureId} in organization ${data.organizationId}`)

        const [failure, organization, userExistsInOrganization] = await Promise.all([
            this.failureRepository.findById(data.failureId),
            this.organizationRepository.findById(data.organizationId),
            this.organizationRepository.findUserExistsInOrganization(data.userCreatedId, data.organizationId)
        ])

        if(!failure) throw new ResourceNotFoundException("Failure not found")
        if(!organization) throw new ResourceNotFoundException("Organization not found")
        if(!userExistsInOrganization) throw new ForbiddenException("User not found in organization")

        if(failure.organizationId !== data.organizationId) throw new ForbiddenException("User not allowed to create solution for this failure")

        const dateNow = new Date()

        const solution: Solution = {
            description: data.description,
            failureId: data.failureId,
            organizationId: data.organizationId,
            userCreatedId: data.userCreatedId,
            links: data.links,
            createdAt: dateNow,
            updatedAt: dateNow
        }

        const createdSolution = await this.solutionRepository.create(solution)

        this.loggerProvider.info(`Solution created successfully for failure ${data.failureId} in organization ${data.organizationId}`)

        return createdSolution
    }

}