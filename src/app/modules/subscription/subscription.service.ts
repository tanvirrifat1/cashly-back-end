import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { stripe } from '../../../shared/stripe';
import { Package } from '../package/package.model';
import { User } from '../user/user.model';
import Stripe from 'stripe';
import { WebhookService } from '../../../shared/webhook';

const createCheckoutSessionService = async (
  userId: string,
  packageId: string
) => {
  console.log(userId);
  console.log(packageId);

  const isUser = await User.findById(userId);

  try {
    const plan = await Package.findById(packageId);
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
    }

    // Create a checkout session for a subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url:
        'https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://yourapp.com/cancel',
      metadata: {
        userId,
        packageId,
      },
      customer_email: isUser?.email,
    });

    // Return the checkout session URL
    return session.url;
  } catch (error) {
    throw new Error('Failed to create checkout session');
  }
};

const handleStripeWebhookService = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      WebhookService.handleCheckoutSessionCompleted(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      WebhookService.handleInvoicePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      WebhookService.handleInvoicePaymentFailed(event.data.object);
      break;

    case 'checkout.session.async_payment_failed':
      WebhookService.handleAsyncPaymentFailed(event.data.object);
      break;

    case 'customer.subscription.deleted':
      WebhookService.handleSubscriptionDeleted(event.data.object);
      break;

    default:
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event type');
  }
};

export const SubscriptationService = {
  createCheckoutSessionService,
  handleStripeWebhookService,
};
