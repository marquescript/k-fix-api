
export class ExternalServiceException extends Error {
    constructor(message: string){
        super(message)
        this.name = "ExternalServiceException"
    }
}