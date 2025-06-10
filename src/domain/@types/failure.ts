import { CriticalLevel } from "./enums/critical-level";
import { FailureStatus } from "./enums/failure-status";

export interface Failure {

    id?: string;
    title: string;
    description: string;
    expectedBehavior: string;
    actualBehavior: string;
    tags: string[];
    criticalLevel: CriticalLevel;
    status: FailureStatus;
    organizationId: string;
    userCreateId: string;
    createdAt: Date;
    updatedAt: Date;

}