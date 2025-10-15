import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env";

export const signJwt = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
};

export const verifyJwt = (token: string): JwtPayload | string => {
    return jwt.verify(token, JWT_SECRET as string);
};
