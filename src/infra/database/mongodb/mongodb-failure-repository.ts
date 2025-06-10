import { Model } from "mongoose";
import { Failure } from "src/domain/@types/failure";
import { FailureRepository } from "src/domain/repository/failure-repository";
import FailureModel, { FailureDocument } from "./schemas/failure";

export class MongoDBFailureRepository implements FailureRepository {

    private readonly failure: Model<FailureDocument>

    constructor(){
        this.failure = FailureModel
    }

    async create(failure: Failure): Promise<Failure> {
        return await this.failure.create(failure)
    }

}