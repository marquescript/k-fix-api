import { model } from "mongoose";
import { connection, Schema } from "mongoose";
import { Solution } from "src/domain/@types/solution";

export type SolutionDocument = Omit<Solution, 'id'> & Document

const schema = new Schema<SolutionDocument>({
    failureId: { type: String, required: true },
    organizationId: { type: String, required: true },
    userCreatedId: { type: String, required: true },
    description: { type: String, required: true },
    links: { type: [{ link: String, description: String }], required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

const modelName: string = "Solution"

const SolutionModel = connection.models[modelName] || model<SolutionDocument>(modelName, schema)

export default SolutionModel