import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { Organization } from "src/domain/@types/organization";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { OrganizationRepository } from "src/domain/repository/organization-repository";
import { UserRepository } from "src/domain/repository/user-repository";

interface CreateOrganizationData {
    ownerId: string;
    name: string;
}

export class CreateOrganizationUseCase {

    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly userRepository: UserRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute({ ownerId, name }: CreateOrganizationData): Promise<Organization>{
        this.loggerProvider.debug("CreateOrganizationUseCase.execute", { ownerId, name })

        const user = await this.userRepository.findById(ownerId)

        if(!user) throw new ResourceNotFoundException("User not found")

        const dateNow = new Date()

        const organization: Organization = {
            ownerId,
            name,
            createdAt: dateNow,
            updatedAt: dateNow
        }

        return await this.organizationRepository.create(organization)
    }

}