
export class InvalidInvitationException extends Error {
    constructor(message: string){
        super(message)
        this.name = "InvalidInvitationException"
    }
}