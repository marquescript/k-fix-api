import { ForbiddenException } from "src/app/exceptions/forbidden-exception";
import { ResourceAlreadyExistsException } from "src/app/exceptions/resource-already-exists";
import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { InvitationOrganization } from "src/domain/@types/invitation-organization";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { InvitationOrganizationRepository } from "src/domain/repository/invitation-organization-repository";
import { OrganizationRepository } from "src/domain/repository/organization-repository";
import { UserRepository } from "src/domain/repository/user-repository";
import crypto from "crypto";
import { InvitationStatus } from "src/domain/@types/invitation-status";
import { EmailProvider } from "src/domain/providers/email-provider";
import { ExternalServiceException } from "src/app/exceptions/external-service-exception";
import { templateInvitationOrganizationEmail } from "src/app/utils/template-invitation-organization-email";

interface SendOrganizationInvitationData {
    organizationId: string;
    userWhoInvitedId: string;
    guestEmail: string;
    urlRedirect: string;
    frontendBaseUrl: string;
}

export class SendOrganizationInvitationUseCase {

    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly userRepository: UserRepository,
        private readonly invitationOrganizationRepository: InvitationOrganizationRepository,
        private readonly emailProvider: EmailProvider,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(
        { 
            organizationId, 
            userWhoInvitedId, 
            guestEmail,
            frontendBaseUrl, 
            urlRedirect
        }: SendOrganizationInvitationData
    ): Promise<void>{
        this.loggerProvider.debug("AddUserToOrganizationUseCase.execute", { organizationId, userWhoInvitedId, guestEmail })

        const [organization, userWhoInvited, emailExists] = await Promise.all([
            this.organizationRepository.findById(organizationId),
            this.userRepository.findById(userWhoInvitedId),
            this.userRepository.findByEmail(guestEmail)
        ])
        
        if(!organization) throw new ResourceNotFoundException("Organization not found")
        if(organization.ownerId !== userWhoInvitedId) throw new ForbiddenException("User who invited is not the owner of the organization")
        if(!userWhoInvited) throw new ResourceNotFoundException("User who invited not found")

        if(emailExists && emailExists.id){
            const userAlreadyBelongsToOrganization = await this.organizationRepository.findUserExistsInOrganization(emailExists.id, organizationId)
            if(userAlreadyBelongsToOrganization) throw new ResourceAlreadyExistsException("User already exists in organization")
        }

        const dateNow = new Date()
        const expirationDate = new Date(dateNow.getTime() + 24 * 60 * 60 * 1000)

        const token = crypto.randomBytes(32).toString("hex")

        const invitationOrganization: InvitationOrganization = {
            token,
            guestEmail,
            status: InvitationStatus.PENDING,
            organizationId,
            userWhoInvitedId,
            expirationDate,
            createdAt: dateNow,
            updatedAt: dateNow,
        }

        await this.invitationOrganizationRepository.create(invitationOrganization)
        this.loggerProvider.info("Invitation organization created", { invitationOrganization })

        const template = templateInvitationOrganizationEmail(
            organization.name,
            `${frontendBaseUrl}${urlRedirect}${token}`
        )

        try{
            await this.emailProvider.sendEmail({
                guestEmail,
                template,
                title: "Convite para organização",
            })
            this.loggerProvider.info("Invitation organization email sent", { invitationOrganization })
        }catch(error){
            this.loggerProvider.error("Error sending invitation organization email", { error })
            throw new ExternalServiceException("Error sending invitation organization email")
        }
    }
}