import { SolutionRepository } from "src/domain/repository/solution-repository";
import SolutionModel, { SolutionDocument } from "./schemas/solution";
import { Model } from "mongoose";
import { Solution } from "src/domain/@types/solution";

export class MongoDBSolutionRepository implements SolutionRepository {

    private readonly solution: Model<SolutionDocument>

    constructor(){
        this.solution = SolutionModel
    }

    async create(solution: Solution): Promise<Solution> {
        const createdSolution = await this.solution.create(solution)
        return createdSolution
    }

}