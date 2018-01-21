import * as express from 'express';
import * as jwtlib from "jsonwebtoken";
import { SignCallback } from 'jsonwebtoken';

export interface JWTSignOptions {
    /**
     * Signature algorithm. Could be one of these values :
     * - HS256:    HMAC using SHA-256 hash algorithm (default)
     * - HS384:    HMAC using SHA-384 hash algorithm
     * - HS512:    HMAC using SHA-512 hash algorithm
     * - RS256:    RSASSA using SHA-256 hash algorithm
     * - RS384:    RSASSA using SHA-384 hash algorithm
     * - RS512:    RSASSA using SHA-512 hash algorithm
     * - ES256:    ECDSA using P-256 curve and SHA-256 hash algorithm
     * - ES384:    ECDSA using P-384 curve and SHA-384 hash algorithm
     * - ES512:    ECDSA using P-521 curve and SHA-512 hash algorithm
     * - none:     No digital signature or MAC value included
     */
    algorithm?: string;
    keyid?: string;
    /** @member {string} - expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d" */
    expiresIn?: string | number;
    /** @member {string} - expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d" */
    notBefore?: string | number;
    audience?: string | string[];
    subject?: string;
    issuer?: string;
    jwtid?: string;
    noTimestamp?: boolean;
    header?: object;
    encoding?: string;
}

export const HEADER_AUTHENTICATION: string = "authorization";

export type JWTCredentialsValidator = (jwt: any) => boolean;

export function JWTAuth(cert: string, validateCredentials: JWTCredentialsValidator, options?: JWTSignOptions) {
    return function (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>){
        if(!descriptor.value.middlewares){
            descriptor.value.middlewares = [];
        }
        JWTAuthenticationMiddleware = JWTAuthenticationMiddleware.bind(descriptor.value);
        descriptor.value.validateCredentials = validateCredentials;
        descriptor.value.jwtoptions = options;
        descriptor.value.cert = cert;
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

    jwtlib.verify(jwtToken, this.cert, this.jwtoptions, function(err: any, decoded: any) {      
        if (err) {
            sendNotAllowed(res, err);
            return
        } else {
          // if everything is good, save to request for use in other routes
          if(!this.validateCredentials(decoded)){
            sendNotAllowed(res, 'Not authorized');
            return
          }
          next();
        }
      });
}

export class JWTFactory {
    static generateToken(secret: string, payload: any, options: JWTSignOptions = {expiresIn: 1440}): any {        
        var token = jwtlib.sign(payload, secret, options);
        return token;
    }
}