/* global process */

export const isProduction = (process.env.RC_ENV === 'production');
export const urls = {
    staging: 'https://platform-staging.reelcontent.com/api/public',
    production: 'https://platform.reelcontent.com/api/public'
};
export const apiURL = (isProduction ? urls.production : urls.staging);