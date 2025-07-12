export default class ApiUrls {
    static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    static readonly API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
    static readonly API_BASE = `${ApiUrls.BASE_URL}/${ApiUrls.API_VERSION}`;
}
