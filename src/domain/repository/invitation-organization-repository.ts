import { InvitationOrganization } from "../@types/invitation-organization";
import { InvitationStatus } from "../@types/enums/invitation-status";

export interface InvitationOrganizationRepository {

    create(invitationOrganization: InvitationOrganization): Promise<InvitationOrganization>
    findByToken(token: string): Promise<InvitationOrganization | null>
    updateStatus(token: string, status: InvitationStatus): Promise<void>

}