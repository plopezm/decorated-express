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
        let resource: any = Object.create(clazz.prototype);
        Object.keys(clazz.prototype).forEach((key: string) => {
            if (!clazz.prototype[key]){
                return;
            }
            let resoucePath = resource[key].path;
            let resourceMethod = resource[key].method;
            delete clazz.prototype[key].path
            delete clazz.prototype[key].method;
            if (!resoucePath || !resourceMethod){
                return;
            }
            let resourceFunction: Function = clazz.prototype[key];
            resourceFunction = resourceFunction.bind(resource);
            this.router[resourceMethod](resoucePath, resourceFunction);
        });
    }

    start(port: number){
        this.app.use('/api', this.router);
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