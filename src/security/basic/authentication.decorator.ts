import * as express from 'express';

export const HEADER_AUTHENTICATION: string = "authorization";

export type CredentialsValidator = (user: string, password: string) => boolean;

export function BasicAuth(validateCredentials: CredentialsValidator) {
    return function (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>){
        if(!descriptor.value.middlewares){
            descriptor.value.middlewares = [];
        }
        BasicAuthenticationMiddleware = BasicAuthenticationMiddleware.bind(descriptor.value);
        descriptor.value.validateCredentials = validateCredentials;
        descriptor.value.middlewares.push(BasicAuthenticationMiddleware);
        return descriptor;
    }
}

function sendNotAllowed(res: express.Response){
    res.status(401);
    res.json({status: 401, msg: "NOT_ALLOWED"});
}

function BasicAuthenticationMiddleware(req: express.Request, res: express.Response, next: Function) { 
    //Parses request and calls validation method
    let basicAuthEncoded = req.headers[HEADER_AUTHENTICATION];
    if(!basicAuthEncoded || typeof basicAuthEncoded !== "string"){
        console.log(`[BasicAuth]: ${HEADER_AUTHENTICATION} header not found`);
        sendNotAllowed(res);
        return;
    }
    let encodedPartIndex = basicAuthEncoded.indexOf('Basic ');
    if(encodedPartIndex === -1){
        console.log(`[BasicAuth]: ${HEADER_AUTHENTICATION} type not valid ${basicAuthEncoded}`);
        sendNotAllowed(res);
        return;
    }
    encodedPartIndex += "Basic ".length;
    //Getting string base64
    basicAuthEncoded = basicAuthEncoded.substr(encodedPartIndex)
    let basicAuthDecoded = Buffer.from(basicAuthEncoded, 'base64').toString();
    let separatorIndex = basicAuthDecoded.indexOf(':');
    if(separatorIndex === -1){
        sendNotAllowed(res);
        return;
    }

    if (!this.validateCredentials(basicAuthDecoded.substr(0, separatorIndex), basicAuthDecoded.substr(separatorIndex+1))){
        console.log(`[BasicAuth]: Credentials are not valid`);
        sendNotAllowed(res);        
        return;
    }
    next();
}