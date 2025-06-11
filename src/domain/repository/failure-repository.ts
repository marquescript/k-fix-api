import { ListFailuresData } from "src/app/@types/list-failures-data";
import { Failure } from "../@types/failure";

export interface FailureRepository {

    create(failure: Failure): Promise<Failure>
    findAll(data: ListFailuresData): Promise<Failure[]>
    findFailuresCountAndResolvedCount(organizationId: string): Promise<{ failuresCount: number, resolvedCount: number }>
    findFailuresCountByTag(organizationId: string): Promise<{ tag: string, count: number }[]>
    findFailuresCountByMonth(organizationId: string): Promise<{ month: string, count: number }[]>
    findFailuresCount(organizationsId: string[]): Promise<{ organizationId: string, failuresCount: number }[]>
    findById(id: string): Promise<Failure | null>

}