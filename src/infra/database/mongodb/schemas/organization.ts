import { connection, model, Schema } from "mongoose";
import { Organization } from "src/domain/@types/organization";

export type OrganizationDocument = Omit<Organization, 'id'> & Document

const schema = new Schema<OrganizationDocument>({
    name: { type: String, required: true },
    ownerId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

const modelName: string = "Organization"

const OrganizationModel = connection.models[modelName] || model<OrganizationDocument>(modelName,schema)

export default OrganizationModel