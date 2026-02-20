import apiClient from '../network/apiClient'
import ShowNotifications from '../utils/notification'

class variantApi {
    async variantList(input) {
        const params = {
            page: input?.page || 0,
            limit: input?.limit || 100,
            search: input?.search || "",
        };

        try {
            const response = await apiClient.get('/variants/list', { params });

            if (response.status === 200 || response.status === 201) {
                return {
                    response: response.data,
                    status: true
                };
            } else {
                return {
                    status: false,
                    error: response.data?.message || 'Failed to fetch variants'
                };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Network error';
            return {
                response: null,
                status: false,
                error: errorMessage
            };
        }
    }

    async variantCreate(input) {
        try {
            const response = await apiClient.post('/variants', input);

            if (response.status === 200 || response.status === 201) {
                ShowNotifications.showAlertNotification(response.data.message, true);
                return {
                    status: true,
                    data: response.data
                };
            } else {
                const errorMessage = response.data?.message || 'Something went wrong';
                ShowNotifications.showAlertNotification(errorMessage, false);
                return {
                    status: false,
                    error: errorMessage
                };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create variant';
            ShowNotifications.showAlertNotification(errorMessage, false);
            return {
                status: false,
                error: errorMessage
            };
        }
    }
}

const variantApis = new variantApi();
export default variantApis;
