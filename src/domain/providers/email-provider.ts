
export interface SendEmailData {
    guestEmail: string;
    template: string;
    title: string;
}

export interface EmailProvider {

    sendEmail(data: SendEmailData): Promise<void>

}