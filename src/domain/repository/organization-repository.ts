import { Organization } from "../@types/organization";

export interface OrganizationRepository {

    create(organization: Organization): Promise<Organization>
    findById(id: string): Promise<Organization | null>
    findUserExistsInOrganization(userId: string, organizationId: string): Promise<boolean>

}