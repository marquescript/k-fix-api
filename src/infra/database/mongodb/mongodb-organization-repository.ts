import { OrganizationRepository } from "src/domain/repository/organization-repository";
import OrganizationModel, { OrganizationDocument } from "./schemas/organization";
import { Model } from "mongoose";
import { Organization } from "src/domain/@types/organization";
import UserOrganizationModel, { UserOrganizationDocument } from "./schemas/user-organization";
import mongoose from "mongoose";
import { User } from "src/domain/@types/user";

export class MongoDBOrganizationRepository implements OrganizationRepository {

    private readonly organization: Model<OrganizationDocument>
    private readonly userOrganization: Model<UserOrganizationDocument>

    constructor(){
        this.organization = OrganizationModel
        this.userOrganization = UserOrganizationModel
    }

    async create(organization: Organization): Promise<Organization> {
        const session = await mongoose.startSession()
        
        try {
            session.startTransaction()
            
            const [newOrganization] = await this.organization.create([organization], { session })
            
            const userOrganization: UserOrganizationDocument = {
                userId: organization.ownerId,
                organizationId: newOrganization.id,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            
            await this.userOrganization.create([userOrganization], { session })
            
            await session.commitTransaction()
            return newOrganization
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    async findById(id: string): Promise<Organization | null> {
        return await this.organization.findById(id).lean()
    }

    async findUserExistsInOrganization(userId: string, organizationId: string): Promise<boolean> {
        const userOrganization =  await this.userOrganization.findOne({
            userId, 
            organizationId
        }).lean()
        return !!userOrganization
    }

}