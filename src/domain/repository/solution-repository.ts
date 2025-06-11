import { Solution } from "../@types/solution";

export interface SolutionRepository {

    create(solution: Solution): Promise<Solution>;

}