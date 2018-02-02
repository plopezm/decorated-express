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
# Setting Basic authentication

This library provides a way to manage automatically HTTP Basic Authentication using @BasicAuth annotation

```
import { GET, POST, DELETE, PUT, Middlewares, BasicAuth, AuthenticationData } from "@plopezm/decorated-express";

class Resource {

    static isUserValid(user: string, passwd: string): boolean{
       return user === "testing" && password === "testing"   
    }

    @GET("/users/:username")
    @BasicAuth(Resource.isUserValid)
    findUser(req: express.Request, res: express.Response, next: Function){
        let authentication: AuthenticationData = res.locals.auth;
        ...
    }
}

```

AuthenticationData interface provides the user credentials

```
export interface BasicData {
    username: string;
    passwd: string;
}

export interface JWTData {
    payload: any;
}

export interface AuthenticationData {
    basic?: BasicData;
    jwt?: JWTData;
}
```

# Setting JWT authentication

JWT authentication has been implemented using jsonwebtoken library. Using @JWTAuth() annotation is it possible to enable JWT authentication for a resource.

We have to decide the algorithm type that we are going to use, for more information you can read [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken). Anyway I am going to explain how to use some security methods.

### Supported signature algorithms

Signature algorithm. Could be one of these values :

* - HS256:    HMAC using SHA-256 hash algorithm (default)
* - HS384:    HMAC using SHA-384 hash algorithm
* - HS512:    HMAC using SHA-512 hash algorithm
* - RS256:    RSASSA using SHA-256 hash algorithm
* - RS384:    RSASSA using SHA-384 hash algorithm
* - RS512:    RSASSA using SHA-512 hash algorithm
* - ES256:    ECDSA using P-256 curve and SHA-256 hash algorithm
* - ES384:    ECDSA using P-384 curve and SHA-384 hash algorithm
* - ES512:    ECDSA using P-521 curve and SHA-512 hash algorithm
* - none:     No digital signature or MAC value included


### Setting JWT authentication with HMAC

Creating a valid token with HMAC requires only a symmetric password. Using the following function:

```
    export class JWTFactory {
        static generateToken(secret: string, payload: any, options: SignOptions = {expiresIn: 1440}): any
    }
```

Example usage:

```
    let signOptions: SignOptions = {
            expiresIn: 10
    };
    let token = JWTFactory.generateToken("testing", {username: res.locals.auth.basic}, signOptions);
```

In order to authenticate a token the client MUST send the token in the Authorization header as 'Bearer' type. The framework will check that header in order to check the token validity

```
    class Resource {
        @GET("/users/:username")
        @JWTAuth("secret")
        // OR 
        //@JWTAuth("secret", {algorithm: 'HS512'})
        protectedMethod(req: express.Request, res: express.Response, next: Function) {
            let jwtPayload: JWTData = res.locals.auth.jwt.payload;

        }
    }
```
