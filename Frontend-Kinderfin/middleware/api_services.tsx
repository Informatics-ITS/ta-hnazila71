import ApiUrls from './api_urls';

export default class ApiServices {
    public async get<T>(url: string): Promise<T> {
        return this.handleRequest<T>(url, 'GET');
    }

    public async post<T>(url: string, data: any): Promise<T> {
        return this.handleRequest<T>(url, 'POST', data);
    }

    public async put<T>(url: string, data: any): Promise<T> {
        return this.handleRequest<T>(url, 'PUT', data);
    }

    public async delete<T>(url: string): Promise<T> {
        return this.handleRequest<T>(url, 'DELETE');
    }

    private async handleRequest<T>(url: string, method: string, data?: any): Promise<T> {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : undefined,
        };

        try {
            const response = await fetch(`${ApiUrls.API_BASE}/${url}`, options);

            if (!response.ok) {
                return this.handleError(response);
            }

            return await response.json();
        } catch (error) {
            console.error('Network error:', error);
            throw new Error('Network error: Failed to reach server');
        }
    }

    private async handleError(response: Response): Promise<never> {
        let errorMessage: string;

        switch (response.status) {
            case 400:
                errorMessage = 'Bad request';
                break;
            case 500:
                errorMessage = 'Internal server error';
                break;
            default:
                errorMessage = 'Unexpected error occurred';
        }

        const errorData = await response.json().catch(() => null);
        console.error(`Error ${response.status}: ${errorMessage}`, errorData);
        throw new Error(`${response.status}: ${errorMessage}`);
    }
}
