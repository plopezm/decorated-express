import * as express from 'express';

export const HEADER_AUTHENTICATION: string = "authorization";

export type JWTCredentialsValidator = (jwt: any) => boolean;

export function JWTAuth(validateCredentials: JWTCredentialsValidator) {
    return function (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>){
        if(!descriptor.value.middlewares){
            descriptor.value.middlewares = [];
        }
        JWTAuthenticationMiddleware = JWTAuthenticationMiddleware.bind(descriptor.value);
        descriptor.value.validateCredentials = validateCredentials;
        descriptor.value.middlewares.push(JWTAuthenticationMiddleware);
        return descriptor;
    }
}

function sendNotAllowed(res: express.Response, message: string){
    res.status(401);
    res.json({status: 401, msg: message});
}

var JWTAuthenticationMiddleware = function(req: express.Request, res: express.Response, next: Function) { 
    const authpreffix = "Bearer ";
    //Parses request and calls validation method
    let jwtToken = req.headers[HEADER_AUTHENTICATION];
    if(!jwtToken || typeof jwtToken !== "string"){
        sendNotAllowed(res, `[BasicAuth]: ${HEADER_AUTHENTICATION} header not found`);
        return;
    }
    let encodedPartIndex = jwtToken.indexOf(authpreffix);
    if(encodedPartIndex === -1){
        sendNotAllowed(res, `[BasicAuth]: ${HEADER_AUTHENTICATION} type not valid '${jwtToken}'`);
        return;
    }
    encodedPartIndex += authpreffix.length;
    //Getting string token
    jwtToken = jwtToken.substr(encodedPartIndex)
    
    


    next();
}