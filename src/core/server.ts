import * as express from "express";
import * as bodyParser from 'body-parser';
import * as logger from "morgan";

export class Server {

    private static appRoutes: Function[];
    app: express.Application;
    router: any;

    constructor(){
        this.app = express();
        this.router = express.Router();
        this.config();
    }

    config(){        
        //use logger middlware
        this.app.use(logger("dev"));
        //use json form parser middlware
        this.app.use(bodyParser.json());
        //use query string parser middlware
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
    }

    registerResource(clazz: any) {        
        let resource = Object.create(clazz.prototype);
        Object.getOwnPropertyNames(clazz.prototype).forEach((key: string) => {
            if (clazz.prototype[key] === undefined || !(clazz.prototype[key] instanceof Function)){
                return;
            }
            let resourcePath = clazz.prototype[key].path;
            let resourceMethod = clazz.prototype[key].method;
            let middlewares = clazz.prototype[key].middlewares;
            delete clazz.prototype[key].path
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
            this.router[resourceMethod](resourcePath, middlewares, resourceFunction);
            console.log("[decorated-express]: function " + key + " added in path '" + resourcePath + "' with method '"+resourceMethod+"'");            
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

    static bootstrap(): Server {
        return new Server();
    }
}