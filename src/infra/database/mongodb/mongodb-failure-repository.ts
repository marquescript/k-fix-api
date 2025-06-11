import { Model } from "mongoose";
import { Failure } from "src/domain/@types/failure";
import { FailureRepository } from "src/domain/repository/failure-repository";
import FailureModel, { FailureDocument } from "./schemas/failure";
import { ListFailuresData } from "src/app/@types/list-failures-data";
import { FailureStatus } from "src/domain/@types/enums/failure-status";

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
    async  findFailuresCountAndResolvedCount(organizationId: string): Promise<{ failuresCount: number, resolvedCount: number }> {
        const [totalCount, resolvedCount] = await Promise.all([
            this.failure.countDocuments({ organizationId }),
            this.failure.countDocuments({ organizationId, status: FailureStatus.CLOSED })
        ])
        return {
            failuresCount: totalCount,
            resolvedCount
        }
    }

    async findFailuresCountByTag(organizationId: string): Promise<{ tag: string, count: number }[]> {
        const tags = await this.failure.aggregate([
            { $match: { organizationId } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $project: { _id: 0, tag: "$_id", count: 1 } }
        ])
        return tags
    }

    async findFailuresCountByMonth(organizationId: string): Promise<{ month: string, monthName: string, count: number }[]> {
        const months = await this.failure.aggregate([
            { $match: { organizationId } },
            { $group: { 
                _id: { 
                    $dateToString: { format: "%Y-%m", date: "$createdAt" } 
                }, 
                count: { $sum: 1 } 
            }},
            { $project: { 
                _id: 0, 
                month: "$_id", 
                monthName: {
                    $switch: {
                        branches: [
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "01"] }, then: "Janeiro" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "02"] }, then: "Fevereiro" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "03"] }, then: "Março" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "04"] }, then: "Abril" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "05"] }, then: "Maio" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "06"] }, then: "Junho" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "07"] }, then: "Julho" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "08"] }, then: "Agosto" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "09"] }, then: "Setembro" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "10"] }, then: "Outubro" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "11"] }, then: "Novembro" },
                            { case: { $eq: [{ $substr: ["$_id", 5, 2] }, "12"] }, then: "Dezembro" }
                        ],
                        default: "Desconhecido"
                    }
                },
                count: 1 
            }}
        ])
        return months
    }

}