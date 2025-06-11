import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { Organization } from "src/domain/@types/organization";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { FailureRepository } from "src/domain/repository/failure-repository";
import { OrganizationRepository } from "src/domain/repository/organization-repository";
import { UserRepository } from "src/domain/repository/user-repository";

interface ListUserOrganizationsResponse extends Organization {
    failuresCount: number;
    membersCount: number;
}

export class ListUserOrganizationsUseCase {

    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly userRepository: UserRepository,
        private readonly failureRepository: FailureRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(userId: string): Promise<ListUserOrganizationsResponse[]> {
        this.loggerProvider.debug("ListUserOrganizationsUseCase.execute", { userId })

        const user = await this.userRepository.findById(userId)

        if(!user) throw new ResourceNotFoundException("User not found")

        const organizations =  await this.organizationRepository.findUserOrganizations(userId)
        const organizationsId = organizations.map(organization => organization.id).filter(organizationId => organizationId !== undefined)

        if(organizationsId.length === 0) return []

        const [failuresCount, organizationsMembersCount] = await Promise.all([
            this.failureRepository.findFailuresCount(organizationsId),
            this.organizationRepository.findUserOrganizationsCount(organizationsId)
        ])

        const organizationsWithFailuresCountAndMembersCount = organizations.map(organization => ({
            ...organization,
            failuresCount: failuresCount.find((failure: { organizationId: string; failuresCount: number }) => failure.organizationId === organization.id)?.failuresCount || 0,
            membersCount: organizationsMembersCount.find((member: { organizationId: string; count: number }) => member.organizationId === organization.id)?.count || 0
        }))

        return organizationsWithFailuresCountAndMembersCount
    }

}