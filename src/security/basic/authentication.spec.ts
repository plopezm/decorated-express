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
                res.status(80);
            }
        }
        class MockedResponse {
            statusVal: number;
            data: any;
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
            let req = {headers: { Authentication: "Basic YXNkOmFzZA=="}};
            //Given            
            let next = resource.protectedMethod;
            //When
            resource.protectedMethod.middlewares[0](req, res, next);
            //Then
            expect(res.statusVal).to.equal(401);            
        });

        it('Status value is ok', () => {
            let resource = new Resource();
            let res: MockedResponse = new MockedResponse();
            let req = {headers: { Authentication: "Basic dGVzdGluZzp0ZXN0aW5n"}};
            //Given            
            let next = resource.protectedMethod;
            //When
            resource.protectedMethod.middlewares[0](req, res, next);
            //Then
            expect(res.statusVal).to.equal(80);                     
        });

        it('Void password is managed', () => {
            let resource = new Resource();
            let res: MockedResponse = new MockedResponse();
            let req = {headers: { Authentication: "Basic dGVzdGluZzo="}};
            //Given            
            let next = resource.protectedMethod;
            //When
            resource.protectedMethod.middlewares[0](req, res, next);
            //Then
            expect(res.statusVal).to.equal(401);
        });
});