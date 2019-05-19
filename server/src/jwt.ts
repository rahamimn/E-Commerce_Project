import { addToSystemFailierLogger } from "./utils/addToLogger";

const jwt  = require('jsonwebtoken');
const fs = require ('fs');

const path = require('path');
const privateKEY  = fs.readFileSync(path.resolve(__dirname, '../../private.key'), 'utf8');
const publicKEY  = fs.readFileSync(path.resolve(__dirname, '../../public.key'), 'utf8');

const i  = 'SANAS group';          // Issuer
// SIGNING OPTIONS
const signOptions = {
    issuer: i,
    expiresIn: "1h",
    algorithm: "RS256"
};
const verifyOptions = {
    issuer: i,
    expiresIn: "12",
    algorithm: "RS256"
};

export function createToken (userId){
    const payload = {
        userId: userId
    };
    try {
        return jwt.sign(payload, privateKEY, signOptions);
    }
    catch (err){
        addToSystemFailierLogger(" create token");
        console.log(err);
        return null
    }
}

export function verifyToken (token){
    try {
        const legit = jwt.verify(token, publicKEY, verifyOptions);
        console.log("\nJWT verification result: " + JSON.stringify(legit));
        return legit
    }
    catch (err){
        addToSystemFailierLogger(" verifyToken  ");
        console.log(err);
        throw err;
    }
}
