import { Organization } from "../@types/organization";

export interface OrganizationRepository {

    create(organization: Organization): Promise<Organization>

}