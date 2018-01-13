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
import { UserResource } from "./resources/user-resource";


let server = Server.bootstrap();
server.registerResource(UserResource);
server.start(8080);

```

# Adding resource middlewares

Probably you would like to add some other middlewares to a specific resource in order to add security, logger, etc. This can be done using annotation @Middlewares(...). It is possible to add as many middlewares as you want.

```
export class UserResource {

    userService: UserService;

    constructor(){        
      this.userService = new UserService();
    }

    sayHelloWorld(req: express.Request, res: express.Response, next: Function) {
        console.log("Hello world middleware 1");
        next();
    }

    sayHelloWorld2(req: express.Request, res: express.Response, next: Function) {
        console.log("Hello world middleware 2");
        next();
    }

    @GET("/hello")
    @Middlewares(sayHelloWorld, sayHelloWorld2)
    helloworld(req: express.Request, res: express.Response, next: Function){
        res.json({
            message: 'Hello World!'
        });
    }

    ...
```

# Extending Server

This server implementation is using body-parser and morgan middlewares by default. If you want to change the behaviour just extends Server class and override the method config()





