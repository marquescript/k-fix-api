import { connection, model, Schema } from "mongoose";

export type UserOrganizationDocument = {
    userId: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new Schema<UserOrganizationDocument>({
    userId: { type: String, required: true },
    organizationId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

const modelName: string = "User_Organization"

const UserOrganizationModel = connection.models[modelName] || model<UserOrganizationDocument>(modelName, schema)

export default UserOrganizationModel