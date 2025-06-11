import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { FailureRepository } from "src/domain/repository/failure-repository";
import { OrganizationRepository } from "src/domain/repository/organization-repository";

interface ReportOrganizationResponse {
    totalFailures: number
    totalResolved: number
    tags: { tag: string, count: number }[]
    months: { month: string, count: number }[]
}

export class ReportOrganizationUseCase {

    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly failureRepository: FailureRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(organizationId: string): Promise<ReportOrganizationResponse> {
        this.loggerProvider.info("use-cases.organization.reportOrganization", {
            organizationId
        })

        const organization = await this.organizationRepository.findById(organizationId)

        if (!organization) throw new ResourceNotFoundException("Organization not found")

        const [countFailures, countByTag, countByMonth] = await Promise.all([
            this.failureRepository.findFailuresCountAndResolvedCount(organizationId),
            this.failureRepository.findFailuresCountByTag(organizationId),
            this.failureRepository.findFailuresCountByMonth(organizationId)
        ])

        return {
            totalFailures: countFailures.failuresCount,
            totalResolved: countFailures.resolvedCount,
            tags: countByTag,
            months: countByMonth
        }
    }

}