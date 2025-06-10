import { ListFailuresData } from "src/app/@types/list-failures-data";
import { Failure } from "../@types/failure";

export interface FailureRepository {

    create(failure: Failure): Promise<Failure>
    findAll(data: ListFailuresData): Promise<Failure[]>

}