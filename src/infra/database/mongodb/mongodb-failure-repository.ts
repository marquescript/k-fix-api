import { Model } from "mongoose";
import { Failure } from "src/domain/@types/failure";
import { FailureRepository } from "src/domain/repository/failure-repository";
import FailureModel, { FailureDocument } from "./schemas/failure";
import { ListFailuresData } from "src/app/@types/list-failures-data";

export class MongoDBFailureRepository implements FailureRepository {

    private readonly failure: Model<FailureDocument>

    constructor(){
        this.failure = FailureModel
    }

    async create(failure: Failure): Promise<Failure> {
        return await this.failure.create(failure)
    }

    async findAll(data: ListFailuresData): Promise<Failure[]> {
        const { organizationId, pagination, params } = data

        const query: any = { organizationId }

        if (params) {
            if (params.title) {
                query.title = { $regex: params.title, $options: 'i' }
            }
            if (params.status) {
                query.status = params.status
            }
            if (params.criticalLevel) {
                query.criticalLevel = params.criticalLevel
            }
            if (params.tags && params.tags.length > 0) {
                query.tags = { $in: params.tags }
            }
            if (params.createdAt) {
                query.createdAt = params.createdAt
            }
        }

        const skip = pagination?.page ? (pagination.page - 1) * (pagination.limit || 10) : 0
        const limit = pagination?.limit || 10

        return await this.failure
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
    }

}