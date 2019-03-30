const jwt  = require('jsonwebtoken');
const fs = require ('fs');

const privateKEY  = fs.readFileSync('../../private.key', 'utf8');
const publicKEY  = fs.readFileSync('../../public.key', 'utf8');

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

export function createToken (userId = undefined, storeId = undefined, productId = undefined){
    const payload = {
        userId: userId,
        storeId: storeId,
        productId: productId
    };
    try {
        return jwt.sign(payload, privateKEY, signOptions);
    }
    catch (err){
        console.log(err);
        return null
    }
}

export function verifyToken (token){
    try {
        const legit = jwt.verify(token, publicKEY, verifyOptions);
        console.log("\nJWT verification result: " + JSON.stringify(legit));
        return true
    }
    catch (err){
        console.log(err);
        return false
    }
}
