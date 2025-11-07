

export const config = {
    jwt : {
        secret : process.env.TZOKEN_SECRET || 'therabeesecret',
        expiresIn : process.env.TOKEN_EXPIRES_IN || '1d',
    }
    ,
    google : {
        clientId : process.env.GOOGLE_CLIENT_ID || ''
    }
}