import * as express from 'express';
import { expect } from 'chai';
import 'mocha';
import { JWTAuth, JWTFactory } from "./jwt.decorator";

describe('JWT authentication decorator', () => { 
    class Resource {
        @JWTAuth("testing")           
        protectedMethod(req: express.Request, res: express.Response, next: Function) {
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
    it('jwt certificate and options are set', () => {
        let resource = new Resource();
        expect(resource.protectedMethod.jwt).to.not.equal(undefined);
    });
    it('Status value is unauthorized', () => {
        let resource = new Resource();
        let res: MockedResponse = new MockedResponse();
        let token = JWTFactory.generateToken("unauthorized", {});
        let req = {headers: { authorization: `Bearer ${token}`}};
        //Given            
        let next = resource.protectedMethod;
        //When
        resource.protectedMethod.middlewares[0](req, res, next);
        //Then
        expect(res.statusVal).to.equal(401);            
    });
    it('Status value is authorized', () => {
        let resource = new Resource();
        let res: MockedResponse = new MockedResponse();

        let token = JWTFactory.generateToken("testing", {"user": "testing"});
        let req = {headers: { authorization: `Bearer ${token}`}};
        //Given            
        let next = resource.protectedMethod;
        //When
        resource.protectedMethod.middlewares[0](req, res, next);
        //Then
        expect(res.statusVal).not.to.equal(401);        
        expect(res.locals.auth).not.to.undefined;
        expect(res.locals.auth.jwt.payload.user).to.equal("testing");
    });

});