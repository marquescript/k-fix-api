import { EmailProvider, SendEmailData } from "src/domain/providers/email-provider";
import { env } from "../config/validate-env";
import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { sesClient } from "../config/ses-client";

export class AWSSESAdapter implements EmailProvider{

    async sendEmail(
        { guestEmail, template, title }: SendEmailData
    ): Promise<void> {

        const sendEmailParams = {
            FromEmailAddress: env.SENDER_EMAIL,
            Destination: {
                ToAddresses: [guestEmail]
            },
            Content: {
                Simple: {
                    Subject: {
                        Data: title,
                        Charset: "UTF-8"
                    },
                    Body: {
                        Html: {
                            Data: template,
                            Charset: "UTF-8"
                        }
                    }
                }
            }
        }

        const command = new SendEmailCommand(sendEmailParams)
        await sesClient.send(command)
    }
}