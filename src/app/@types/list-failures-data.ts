import { CriticalLevel } from "src/domain/@types/enums/critical-level";
import { FailureStatus } from "src/domain/@types/enums/failure-status";

export interface ListFailuresData {
    pagination?: {
        page?: number;
        limit?: number;
    }    
    params?: {
        title?: string;
        status?: FailureStatus;
        criticalLevel?: CriticalLevel;
        tags?: string[];
        createdAt?: Date;
    }
    organizationId: string;
}