import { connection, model, Schema } from "mongoose";
import { InvitationOrganization } from "src/domain/@types/invitation-organization";

export type InvitationOrganizationDocument = Omit<InvitationOrganization, 'id'> & Document

const schema = new Schema<InvitationOrganizationDocument>({
    token: { type: String, required: true },
    guestEmail: { type: String, required: true },
    organizationId: { type: String, required: true },
    userWhoInvitedId: { type: String, required: true },
    status: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

const modelName: string = "Invitation_Organization"

const InvitationOrganizationModel = connection.models[modelName] || model<InvitationOrganizationDocument>(modelName, schema)

export default InvitationOrganizationModel