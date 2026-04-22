/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from '../../app/interfaces/payment-gateway.interface';

const Stripe = require('stripe');

@Injectable()
export class StripePaymentGateway implements IPaymentGateway {
  private stripe: any;

  constructor() {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'sk_test_fallback',
    );
  }

  async createCheckoutSession(
    userId: number,
    itemType: string,
    itemId: string,
  ): Promise<{ url: string }> {
    const lineItems: any[] = [];

    if (itemType === 'BATTLE_PASS') {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 999, // $9.99
          product_data: {
            name: 'Season 1 Battle Pass',
            description:
              'Unlocks premium rewards and the exclusive Necromancer skin!',
          },
        },
      });
    } else if (itemType === 'SKIN') {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 499, // $4.99
          product_data: { name: `Premium Skin: ${itemId}` },
        },
      });
    } else if (itemType === 'CURRENCY') {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 199, // $1.99
          product_data: {
            name: 'Pouch of Gold',
            description: '1000 In-Game Gold',
          },
        },
      });
    } else {
      throw new Error('Invalid item type');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      metadata: { userId: userId.toString(), itemType, itemId },
      success_url: `${process.env.FRONTEND_URL}/?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/?payment=cancelled`,
    });

    return { url: session.url || '' };
  }
}
