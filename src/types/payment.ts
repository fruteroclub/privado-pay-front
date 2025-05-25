export interface PaymentLinkRequest {
  amount: number;
  token: string;
  orderId: string;
  wallet: string;
}

export interface PaymentLinkResponse {
  paymentUrl: string;
}

export interface PaymentDetails {
  orderId: string;
  amount: number;
  token: string;
} 