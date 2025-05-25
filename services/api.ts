import axios from 'axios';
import { PaymentLinkRequest, PaymentLinkResponse, PaymentDetails } from '../types/payment';

const API_URL = 'http://localhost:3000/api';

export const createPaymentLink = async (data: PaymentLinkRequest): Promise<PaymentLinkResponse> => {
  try {
    console.log('Sending request to:', `${API_URL}/payment-link`);
    console.log('Request data:', data);
    
    const response = await axios.post(`${API_URL}/payment-link`, data);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};

export const getPaymentDetails = async (orderId: string): Promise<PaymentDetails> => {
  try {
    const response = await axios.get(`${API_URL}/pay/${orderId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
}; 