import * as express from 'express';
import * as jwtlib from "jsonwebtoken";
import { SignCallback, VerifyOptions, SignOptions } from 'jsonwebtoken';
export { VerifyOptions, SignOptions } from 'jsonwebtoken';
import { JWTData } from '../security.interfaces';

export const HEADER_AUTHENTICATION: string = "authorization";

export function JWTAuth(cert: string, options?: VerifyOptions) {
    return function (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>){
        if(!descriptor.value.middlewares){
            descriptor.value.middlewares = [];
        }
        JWTAuthenticationMiddleware = JWTAuthenticationMiddleware.bind(descriptor.value);
        descriptor.value.jwt = {options: options};
        descriptor.value.jwt = {cert: cert};
        descriptor.value.middlewares.push(JWTAuthenticationMiddleware);
        return descriptor;
    }
}

var JWTAuthenticationMiddleware = function(req: express.Request, res: express.Response, next: Function) { 
    const authpreffix = "Bearer ";
    //Parses request and calls validation method
    let jwtToken = req.headers[HEADER_AUTHENTICATION];
    if(!jwtToken || typeof jwtToken !== "string"){
        sendNotAllowed(res, `[JWTAuth]: ${HEADER_AUTHENTICATION} header not found`);
        return;
    }
    let encodedPartIndex = jwtToken.indexOf(authpreffix);
    if(encodedPartIndex === -1){
        sendNotAllowed(res, `[JWTAuth]: ${HEADER_AUTHENTICATION} type not valid '${jwtToken}'`);
        return;
    }
    encodedPartIndex += authpreffix.length;
    //Getting string token
    jwtToken = jwtToken.substr(encodedPartIndex)

    jwtlib.verify(jwtToken, this.jwt.cert, this.jwt.options, function(err: any, decoded: any) {      
        if (err) {
            sendNotAllowed(res, err);
            return
        } else {
          storeCredentails(res, decoded);
          next();
        }
    });
}

function sendNotAllowed(res: express.Response, message: string){
    //console.log(`[JWT] Request not allowed, message: ${message}`);
    res.status(401);
    res.json({status: 401, msg: message});
}

function storeCredentails(res: express.Response, payload: any) {
    if (!res.locals) {
        res.locals = {};
    }
    if (!res.locals.auth){
        res.locals.auth = {};
    }
    let jwtData: JWTData = {
        payload: payload
    }
    res.locals.auth.jwt = jwtData;
}

export class JWTFactory {
    static generateToken(secret: string, payload: any, options: SignOptions = {expiresIn: 1440}): any {        
        var token = jwtlib.sign(payload, secret, options);
        return token;
    }
}
