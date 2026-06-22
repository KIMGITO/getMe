import { apiClient } from './apiClient';

export const shoppingService = {
  // 1. Create the standalone draft list
  createList: async (payload: any) => {
    const response = await apiClient.post('/orders', payload, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  },

  // 2. Ping the server for real-time logistics costs
  previewFee: async (shoppingListId: string, payload: any) => {
    const response = await apiClient.post(
      `/orders/${shoppingListId}/preview-fee`,
      payload,
      {
        headers: { Accept: 'application/json' },
      },
    );
    return response.data;
  },

  // 3. Finalize the escrow hold and dispatch
  checkout: async (shoppingListId: string, payload: any) => {
    const response = await apiClient.post(
      `/orders/${shoppingListId}/checkout`,
      payload,
      {
        headers: { Accept: 'application/json' },
      },
    );
    return response.data;
  },

  parseValidationErrors: (error: any): Record<string, string> => {
    const errorBag: Record<string, string> = {};
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const serverErrors = error.response.data.errors;
      Object.keys(serverErrors).forEach((key) => {
        if (Array.isArray(serverErrors[key]) && serverErrors[key].length > 0) {
          errorBag[key] = serverErrors[key][0];
        }
      });
    } else {
      errorBag.global =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'An unexpected runtime error occurred.';
    }
    return errorBag;
  },

  getHistory: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  // Delete an order
  deleteOrder: async (id: string) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },
};
