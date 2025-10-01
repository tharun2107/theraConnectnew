

export const config = {
    jwt : {
        secret : process.env.TZOKEN_SECRET || 'theraconnectsecret',
        expiresIn : process.env.TOKEN_EXPIRES_IN || '1d',
    }
}