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
    
    async findAll(failureId: string, page: number, limit: number): Promise<{ solutions: Solution[], total: number }> {
        const skip = (page - 1) * limit;
        
        const [solutions, total] = await Promise.all([
            this.solution.find({ failureId })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            this.solution.countDocuments({ failureId })
        ]);

        return {
            solutions,
            total
        };
    }

}