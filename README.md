# decorated-express

This library wraps an express application into a typescript class and provides decorators to ease restful developments

# Installing @plopezm/decorated-express

```
  npm install --save express
  npm install --save-dev @types/express
  npm install --save @plopezm/decorated-express
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
import { Server } from "../../decorated-express/dist/index";
import { UserResource } from "./resources/user-resource";


let server = Server.bootstrap();
server.registerResource(UserResource);
server.start(8080);

```

# Extending Server

This server implementation is using body-parser and morgan middlewares by default. If you want to change the behaviour just extends Server class and override the method config()





