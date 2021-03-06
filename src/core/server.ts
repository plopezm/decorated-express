import * as express from 'express';

export class Server {

    private static appRoutes: Function[];
    app: express.Application;
    router: any;

    constructor(app: express.Application){
        this.app = app;
        this.router = express.Router();
    }

    config(...middlwares: express.RequestHandler[]){
        middlwares.forEach((middlware: express.RequestHandler) => {
            this.app.use(middlware);
        });
    }

    registerResource(clazz: any) {        
        let resource = Object.create(clazz.prototype);
        let routePath = resource.routePath;
        if (!routePath) {
            routePath = '';
        }
        delete clazz.prototype.routePath;
        Object.getOwnPropertyNames(clazz.prototype).forEach((key: string) => {
            if (clazz.prototype[key] === undefined || !(clazz.prototype[key] instanceof Function)){
                return;
            }
            let resourcePath = clazz.prototype[key].path;
            let resourceMethod = clazz.prototype[key].method;
            let middlewares = clazz.prototype[key].middlewares;
            delete clazz.prototype[key].path;
            delete clazz.prototype[key].method;
            delete clazz.prototype[key].middlwares;
            if (!resourcePath || !resourceMethod){
                return;
            }            
            if (!middlewares){
                middlewares = [];
            }
            let resourceFunction: Function = clazz.prototype[key];
            resourceFunction = resourceFunction.bind(resource);
            this.router[resourceMethod](routePath + resourcePath, middlewares, resourceFunction);
            console.log("[decorated-express]: function " + key + " added in path '" + routePath + resourcePath + "' with method '"+resourceMethod+"'");            
        });
    }

    start(applicationPath:string, port: number){
        this.app.use(applicationPath, this.router);
        this.app.listen(port, (err: any) => {
            if (err) {
                return console.log(err)
            }            
            return console.log(`HTTP server is listening on ${port}`)
        });
    }

    static bootstrap(app: express.Application): Server {
        return new Server(app);
    }
}