import * as express from 'express';

export function GET(path: string){
    return function(target: Object, key: string, descriptor: TypedPropertyDescriptor<any>){
        descriptor.value.path = path;
        descriptor.value.method = 'get';
        return descriptor;
    }
}
export function POST(path: string){
    return function(target: Object, key: string, descriptor: TypedPropertyDescriptor<any>){
        descriptor.value.path = path;
        descriptor.value.method = 'post';
        return descriptor;
    }
}

export function PUT(path: string){
    return function(target: Object, key: string, descriptor: TypedPropertyDescriptor<any>){
        descriptor.value.path = path;
        descriptor.value.method = 'put';
        return descriptor;
    }
}

export function DELETE(path: string){
    return function(target: Object, key: string, descriptor: TypedPropertyDescriptor<any>){
        descriptor.value.path = path;
        descriptor.value.method = 'delete';
        return descriptor;
    }
}

export function Middlewares(...middlewares: Function[]) {
    return function(target: object, key: string, descriptor: TypedPropertyDescriptor<any>){
        if(!descriptor.value.middlewares){
            descriptor.value.middlewares = [];
        }
        middlewares.forEach((middleware) => {
            descriptor.value.middlewares.push(middleware);
        })
        return descriptor;
    }
}
