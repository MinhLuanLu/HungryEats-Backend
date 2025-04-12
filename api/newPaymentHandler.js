import log from "minhluanlu-color-log"
import Stripe from "stripe";
import dotenv from "dotenv"
dotenv.config()

const accessToken = process.env.StripeAccessToken
const publicKey = process.env.StripepublishableKey

const stripe = new Stripe(accessToken)
async function newPayment(request, response) {

    const {User, Order} = request.body;
    log.debug({
        message: "Recived payment request",
        user: User
    })
    console.log(Order)

    const customer = await stripe.customers.create(
        {email: User.Email}
    );
    const ephemeralKey = await stripe.ephemeralKeys.create(
        {customer: customer.id},
        {apiVersion: '2025-03-31.basil'}
    );

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Order.Total_price * 100,
        currency: 'dkk',
        customer: customer.id,
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter
        // is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });
     
      response.status(200).send({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: publicKey
      });
}


export default newPayment