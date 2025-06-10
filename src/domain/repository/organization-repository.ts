import { InvitationOrganization } from "../@types/invitation-organization";
import { Organization } from "../@types/organization";
import { User } from "../@types/user";

export interface OrganizationRepository {

    create(organization: Organization): Promise<Organization>
    findById(id: string): Promise<Organization | null>
    findUserExistsInOrganization(userId: string, organizationId: string): Promise<boolean>
    addUserToOrganization(invitationOrganization: InvitationOrganization, user: User): Promise<void>
    findUserOrganizations(userId: string): Promise<Organization[]>

}