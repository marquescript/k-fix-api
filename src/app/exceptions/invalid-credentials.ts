
export class InvalidCredentialsException extends Error {
    
    constructor(error: string){
        super(error)
        this.name = "InvalidCredentialsException"
    }

}