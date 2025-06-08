import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent, Context } from "aws-lambda";
import { JsonWebTokenAdapter } from "src/infra/adapters/jsonwebtoken-adapter";

const handlerJwtAuthorizer = async (
    event: APIGatewayRequestAuthorizerEvent, 
    _: Context
): Promise<APIGatewayAuthorizerResult> => {
    const token = event?.headers?.authorization?.split(" ")[1]

    const jsonwebtokenAdapter = new JsonWebTokenAdapter()

    try{
        if(!token) {
            throw new Error("Unauthorized")
        }

        const sub = jsonwebtokenAdapter.verifyAccessToken(token)

        if(!sub) {
            throw new Error("Unauthorized")
        }

        const methodArn = event.methodArn || 'arn:aws:execute-api:*:*:*/*/*/*';
        const policy = generatePolicy(sub, 'Allow', methodArn, { userId: sub })
        return policy;
    }catch(error: unknown){
        throw new Error("Unauthorized")
    }
}

// Função auxiliar para gerar a política IAM
function generatePolicy(
    principalId: string, 
    effect: 'Allow' | 'Deny', 
    resource: string, 
    context?: any
): APIGatewayAuthorizerResult {

    const authResponse: APIGatewayAuthorizerResult = {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource
                }
            ]
        }
    }

    if(context) {
        authResponse.context = context
    }

    return authResponse
}

export const handler = handlerJwtAuthorizer