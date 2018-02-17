import { expect } from 'chai';
import 'mocha';
import * as express from 'express';

import { BasicAuth, HEADER_AUTHENTICATION, CredentialsValidator } from './authentication.decorator';

describe('Basic authentication decorator', () => {
        class Resource {
            @BasicAuth((user:string, password: string) => {
                return user === "testing" && password === "testing"                
            })            
            protectedMethod(req: express.Request, res: express.Response, next: Function) {
            }

            @BasicAuth()
            protectedMethodWithoutCallback(req: express.Request, res: express.Response, next: Function) {
            }
        }        
        class MockedResponse {
            statusVal: number;
            data: any;
            locals: any;
            json(data:any){
                this.data = data;
            }
            status(status: number){
                this.statusVal = status;
            }
        }

        it('validateCredentials() method is created into the decorated resource', () => {
            let resource = new Resource();
            expect(resource.protectedMethod.validateCredentials).to.not.equal(undefined);
        });
        it('Status value is unauthorized', () => {
            let resource = new Resource();
            let res: MockedResponse = new MockedResponse();
            let req = {headers: { authorization: "Basic YXNkOmFzZA=="}};
            //Given            
            let next = resource.protectedMethod;
            //When
            resource.protectedMethod.middlewares[0](req, res, next);
            //Then
            expect(res.statusVal).to.equal(401);               
        });

        it('Status value is not error', () => {
            let resource = new Resource();
            let res: MockedResponse = new MockedResponse();
            let req = {headers: { authorization: "Basic dGVzdGluZzp0ZXN0aW5n"}};
            //Given            
            let next = resource.protectedMethod;
            //When
            resource.protectedMethod.middlewares[0](req, res, next);
            //Then
            expect(res.statusVal).to.not.equal(401);
            expect(res.locals.auth).not.to.undefined;
            expect(res.locals.auth.basic).not.to.undefined;
            expect(res.locals.auth.basic.username).to.equals("testing");
            expect(res.locals.auth.basic.passwd).to.equals("testing");
        });

        it('Status value is not error without callback in resource', () => {
            let resource = new Resource();
            let res: MockedResponse = new MockedResponse();
            let req = {headers: { authorization: "Basic dGVzdGluZzp0ZXN0aW5n"}};
            //Given            
            let next = resource.protectedMethodWithoutCallback;
            //When
            resource.protectedMethodWithoutCallback.middlewares[0](req, res, next);
            //Then
            expect(res.statusVal).to.not.equal(401);
            expect(res.locals.auth).not.to.undefined;
            expect(res.locals.auth.basic).not.to.undefined;
            expect(res.locals.auth.basic.username).to.equals("testing");
            expect(res.locals.auth.basic.passwd).to.equals("testing");
        });

        it('Void password is managed', () => {
            let resource = new Resource();
            let res: MockedResponse = new MockedResponse();
            let req = {headers: { authorization: "Basic dGVzdGluZzo="}};
            //Given            
            let next = resource.protectedMethod;
            //When
            resource.protectedMethod.middlewares[0](req, res, next);
            //Then
            expect(res.statusVal).to.equal(401);
        });
});