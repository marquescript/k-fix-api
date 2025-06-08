import { ForbiddenException } from "src/app/exceptions/forbidden-exception";
import { InvalidInvitationException } from "src/app/exceptions/invalid-invitation-exception";
import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { InvitationStatus } from "src/domain/@types/invitation-status";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { InvitationOrganizationRepository } from "src/domain/repository/invitation-organization-repository";
import { OrganizationRepository } from "src/domain/repository/organization-repository";
import { UserRepository } from "src/domain/repository/user-repository";

interface AcceptOrganizationInvitationData {
    token: string;
    userId: string;
}

export class AcceptOrganizationInvitationUseCase {

    constructor(
        private readonly invitationOrganizationRepository: InvitationOrganizationRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly userRepository: UserRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(
        { token, userId }: AcceptOrganizationInvitationData
    ): Promise<void> {
        this.loggerProvider.debug("AcceptOrganizationInvitationUseCase.execute", { token, userId })

        const invitationOrganization = await this.invitationOrganizationRepository.findByToken(token)
        const user = await this.userRepository.findById(userId)

        if(!user) throw new ResourceNotFoundException("User not found")

        if(!invitationOrganization) throw new ResourceNotFoundException("Invitation organization not found")

        if(invitationOrganization.status !== InvitationStatus.PENDING || 
            invitationOrganization.expirationDate < new Date()) 
        {
            await this.invitationOrganizationRepository.updateStatus(token, InvitationStatus.EXPIRED)
            throw new InvalidInvitationException("Invalid invitation organization")
        }

        if(invitationOrganization.guestEmail !== user.email) throw new ForbiddenException("User is not the guest of the invitation organization")

        await this.organizationRepository.addUserToOrganization(invitationOrganization, user)
        this.loggerProvider.info("User added to organization", { userId, organizationId: invitationOrganization.organizationId })
    }

}