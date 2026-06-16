const { EncryptJWT, jwtDecrypt } = require('jose');

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function signToken(payload) {
    return await new EncryptJWT(payload)
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .setExpirationTime('1d')
        .encrypt(secret);
}

async function verifyToken(token) {
    const { payload } = await jwtDecrypt(token, secret);
    return payload;
}

module.exports = { signToken, verifyToken };
