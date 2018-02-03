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
