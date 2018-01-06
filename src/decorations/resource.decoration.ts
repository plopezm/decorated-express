
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