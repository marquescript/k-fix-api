import { Model } from "mongoose";
import { InvitationOrganizationRepository } from "src/domain/repository/invitation-organization-repository";
import InvitationOrganizationModel, { InvitationOrganizationDocument } from "./schemas/invitation-organization";
import { InvitationOrganization } from "src/domain/@types/invitation-organization";

export class MongoDBInvitationOrganizationRepository implements InvitationOrganizationRepository {

    private readonly invitationOrganization: Model<InvitationOrganizationDocument>

    constructor(){
        this.invitationOrganization = InvitationOrganizationModel
    }

    async create(invitationOrganization: InvitationOrganization): Promise<InvitationOrganization> {
        return await this.invitationOrganization.create(invitationOrganization)
    }

}