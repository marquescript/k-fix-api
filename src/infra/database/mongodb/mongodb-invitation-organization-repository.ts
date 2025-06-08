import { Model } from "mongoose";
import { InvitationOrganizationRepository } from "src/domain/repository/invitation-organization-repository";
import InvitationOrganizationModel, { InvitationOrganizationDocument } from "./schemas/invitation-organization";
import { InvitationOrganization } from "src/domain/@types/invitation-organization";
import { InvitationStatus } from "src/domain/@types/invitation-status";

export class MongoDBInvitationOrganizationRepository implements InvitationOrganizationRepository {

    private readonly invitationOrganization: Model<InvitationOrganizationDocument>

    constructor(){
        this.invitationOrganization = InvitationOrganizationModel
    }

    async create(invitationOrganization: InvitationOrganization): Promise<InvitationOrganization> {
        return await this.invitationOrganization.create(invitationOrganization)
    }

    async findByToken(token: string): Promise<InvitationOrganization | null> {
        return await this.invitationOrganization.findOne({ token }).lean()
    }

    async updateStatus(token: string, status: InvitationStatus): Promise<void> {
        await this.invitationOrganization.updateOne({ token }, { $set: { status } })
    }

}