import * as express from 'express';
import { BasicData } from '../security.interfaces';

export const HEADER_AUTHENTICATION: string = "authorization";

export type CredentialsValidator = (user: string, password: string) => boolean | Promise<boolean>;

export function BasicAuth(validateCredentials?: CredentialsValidator) {
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

function sendNotAllowed(res: express.Response, message: string){
    //console.log(`[BasicAuth] Request not allowed, message: ${message}`);
    res.status(401);
    res.json({status: 401, msg: message});
}

function storeCredentails(res: express.Response, username: string, passwd: string) {
    if(!res.locals){
        res.locals = {};
    }
    if(!res.locals.auth){
        res.locals.auth = {};
    }
    let basicData: BasicData = {
        username: username,
        passwd: passwd
    }
    res.locals.auth.basic = basicData;
}

var BasicAuthenticationMiddleware = function(req: express.Request, res: express.Response, next: Function) { 
    //Parses request and calls validation method
    let basicAuthEncoded = req.headers[HEADER_AUTHENTICATION];
    if(!basicAuthEncoded || typeof basicAuthEncoded !== "string"){
        sendNotAllowed(res, `[BasicAuth]: ${HEADER_AUTHENTICATION} header not found`);
        return;
    }
    let encodedPartIndex = basicAuthEncoded.indexOf('Basic ');
    if(encodedPartIndex === -1){
        sendNotAllowed(res, `[BasicAuth]: ${HEADER_AUTHENTICATION} type not valid '${basicAuthEncoded}'`);
        return;
    }
    encodedPartIndex += "Basic ".length;
    //Getting string base64
    basicAuthEncoded = basicAuthEncoded.substr(encodedPartIndex)
    let basicAuthDecoded = Buffer.from(basicAuthEncoded, 'base64').toString();
    let separatorIndex = basicAuthDecoded.indexOf(':');
    if(separatorIndex === -1){
        sendNotAllowed(res, `[BasicAuth]: character ':' doesn't found`);
        return;
    }
    let username = basicAuthDecoded.substr(0, separatorIndex);
    let passwd = basicAuthDecoded.substr(separatorIndex+1);

    if(!this.validateCredentials){
        storeCredentails(res, username, passwd);
        next();
        return;
    }

    let validation = this.validateCredentials(username, passwd);

    if (validation.then !== undefined) {
        validation.then((validated: boolean) => {
            if(!validated){
                sendNotAllowed(res, `[BasicAuth]: Credentials are not valid`);
                return;
            }
            storeCredentails(res, username, passwd);
            next();
        });
    } else {
        if(!validation) {
            sendNotAllowed(res, `[BasicAuth]: Credentials are not valid`);        
            return;
        }
        //Storing credentials values in request params
        storeCredentails(res, username, passwd);
        next();
    }
}