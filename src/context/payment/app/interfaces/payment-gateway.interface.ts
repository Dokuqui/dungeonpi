export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface IPaymentGateway {
  createCheckoutSession(
    userId: number,
    itemType: string,
    itemId: string,
  ): Promise<{ url: string }>;
}
