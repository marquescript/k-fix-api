import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { Organization } from "src/domain/@types/organization";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { OrganizationRepository } from "src/domain/repository/organization-repository";
import { UserRepository } from "src/domain/repository/user-repository";

export class ListUserOrganizationsUseCase {

    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly userRepository: UserRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(userId: string): Promise<Organization[]> {
        this.loggerProvider.debug("ListUserOrganizationsUseCase.execute", { userId })

        const user = await this.userRepository.findById(userId)

        if(!user) throw new ResourceNotFoundException("User not found")

        return await this.organizationRepository.findUserOrganizations(userId)
    }

}