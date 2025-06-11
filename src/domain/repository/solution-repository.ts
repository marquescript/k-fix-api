import { Solution } from "../@types/solution";

export interface SolutionRepository {

    create(solution: Solution): Promise<Solution>;
    findAll(failureId: string, page: number, limit: number): Promise<{ solutions: Solution[], total: number }>;
    findById(solutionId: string): Promise<Solution | null>;

}