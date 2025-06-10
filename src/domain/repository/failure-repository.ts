import { Failure } from "../@types/failure";

export interface FailureRepository {

    create(failure: Failure): Promise<Failure>

}