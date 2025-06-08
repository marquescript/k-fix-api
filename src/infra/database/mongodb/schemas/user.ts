import { User } from "src/domain/@types/user"
import { Schema, Document, model, connection } from "mongoose"

export type UserDocument = Omit<User, 'id'> & Document

const schema = new Schema<UserDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

const modelName: string = "User"

const UserModel = connection.models[modelName] || model<UserDocument>(modelName, schema)

export default UserModel