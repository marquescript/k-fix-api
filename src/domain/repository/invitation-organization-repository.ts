import { InvitationOrganization } from "../@types/invitation-organization";

export interface InvitationOrganizationRepository {

    create(invitationOrganization: InvitationOrganization): Promise<InvitationOrganization>

}