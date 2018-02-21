import 'mocha';
import { expect } from 'chai';
import { RoutePath, GET, POST } from './resource.decoration';
import { RestResource } from './resource.interface';

describe('Testing resource decorators', () => {

    @RoutePath('/testing')
    class ExampleResource {

        @GET('/method1')
        exampleResource() {
        }
        
        @POST('/method2')
        exampleResource2() {
        }
    }

    it('@RoutePath generates routePath attribute in the annotated class', () => {
        let resource = new ExampleResource();
        expect(resource.routePath).not.to.undefined;
        expect(resource.routePath).to.equals('/testing');
    });

    it('@GET method has path & method attributes set', () => {
        let resource = new ExampleResource();
        expect(resource.exampleResource.path).not.to.undefined;
        expect(resource.exampleResource.method).not.to.undefined;
        expect(resource.exampleResource.path).to.equals('/method1');
        expect(resource.exampleResource.method).to.equals('get');
    });

    it('@POST method has path & method attributes set', () => {
        let resource = new ExampleResource();
        expect(resource.exampleResource2.path).not.to.undefined;
        expect(resource.exampleResource2.method).not.to.undefined;
        expect(resource.exampleResource2.path).to.equals('/method2');
        expect(resource.exampleResource2.method).to.equals('post');
    });
});