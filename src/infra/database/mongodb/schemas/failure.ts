import { connection, model, Schema } from "mongoose";
import { Failure } from "src/domain/@types/failure";

export type FailureDocument = Omit<Failure, 'id'> & Document

const schema = new Schema<FailureDocument>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    expectedBehavior: { type: String, required: true },
    actualBehavior: { type: String, required: true },
    tags: { type: [String], required: true },
    criticalLevel: { type: String, required: true },
    status: { type: String, required: true },
    organizationId: { type: String, required: true },
    userCreateId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

const modelName: string = "Failure"

const FailureModel = connection.models[modelName] || model<FailureDocument>(modelName, schema)

export default FailureModel