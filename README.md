# decorated-express

This library wraps an express application into a typescript class and provides decorators to ease restful developments. If you want to check an example application implemented using this library, please go [node-auth-typescript](https://github.com/plopezm/node-auth-typescript)

# Installing @plopezm/decorated-express

```
  npm install --save @plopezm/decorated-express
  npm install --save-dev @types/express
```

# How to use it

Using this library is really easy:

1. We have to define a resource:

```
import * as express from "express";
import { GET, POST } from "@plopezm/decorated-express";
import { UserService } from "../services/user-service";

export class UserResource {

    userService: UserService;

    constructor(){        
      this.userService = new UserService();
    }

    @GET("/hello")
    helloworld(req: express.Request, res: express.Response, next: Function){
        res.json({
            message: 'Hello World!'
        });
    }

    @GET("/users/:username")
    findUser(req: express.Request, res: express.Response, next: Function){
        let id = req.params.username;
        let user = this.userService.get(id);
        res.json(user);
    }

    @POST("/users")
    createUser(req: express.Request, res: express.Response, next: Function) {
        let user = this.userService.create(req.body);
        res.json(user);
    }

}

```

2. In index.js create a server a add this resource:

```
import { Server } from "@plopezm/decorated-express";
import * as bodyParser from 'body-parser';
import * as logger from "morgan";
import { UserResource } from "./resources/user-resource";

// Creates a new instance of a express server
let server = Server.bootstrap();
// Config method allows us to set the desired middleware to be used
server.config(logger("dev"),
            bodyParser.json(),
            bodyParser.urlencoded({extended: true}));
// Register our decorated resources
server.registerResource(UserResource);
// Server starts
server.start('/api/v1', 8080);

```

# Adding resource middlewares

Probably you would like to add some other middlewares to a specific resource in order to add security, logger, etc. This can be done using annotation @Middlewares(...). It is possible to add as many middlewares as you want.

```
// Declaring our example middlewares
function sayHelloWorldMiddleware(req: express.Request, res: express.Response, next: Function) {
    console.log("Hello world middleware 1");
    next();
}

function sayHelloWorldMiddleware2(req: express.Request, res: express.Response, next: Function) {
    console.log("Hello world middleware 2");
    next();
}

export class UserResource {

    userService: UserService;

    constructor(){        
      this.userService = new UserService();
    }

    @GET("/hello")
    @Middlewares(sayHelloWorldMiddleware, sayHelloWorldMiddleware2)
    helloworld(req: express.Request, res: express.Response, next: Function){
        res.json({
            message: 'Hello World!'
        });
    }

    ...
```
