import log from "minhluanlu-color-log"
import Stripe from "stripe";
import dotenv from "dotenv"
import axios from "axios";
import { Make_Query } from "../database/databaseConnection.js";
dotenv.config()

const accessToken = process.env.StripeAccessToken
const publicKey = process.env.StripepublishableKey;

const getPaymentURL = "https://api.stripe.com/v1/payment_intents";
const refundPaymentURL = "https://api.stripe.com/v1/refunds"

const stripe = new Stripe(accessToken);

async function newPayment(request, response) {

    const {User, Order} = request.body;
    log.debug({
        message: "Recived payment request",
        user: User
    })

    const price = Math.round(Order.Total_price + Order.Moms.Moms_price)

   try{
      const customer = await stripe.customers.create(
          {email: User.Email}
      );
      const ephemeralKey = await stripe.ephemeralKeys.create(
          {customer: customer.id},
          {apiVersion: '2025-03-31.basil'}
      );

      const paymentIntent = await stripe.paymentIntents.create({
          amount: price * 100,
          currency: 'dkk',
          customer: customer.id,
          // In the latest version of the API, specifying the `automatic_payment_methods` parameter
          // is optional because Stripe enables its functionality by default.
          automatic_payment_methods: {
            enabled: true,
          },
        });

        const savePayment = await Make_Query(`INSERT INTO Payments (User, Order_detail, PaymentIntent, Status, PaymentIntent_id) VALUES(
            '${JSON.stringify(User)}',
            '${JSON.stringify(Order)}',
            '${JSON.stringify(paymentIntent)}',
            '${paymentIntent.status}',
            '${paymentIntent.id}'
          )`);

        log.debug("------- Payment done ------------------")
        
        response.status(200).send({
          paymentIntent: paymentIntent.client_secret,
          ephemeralKey: ephemeralKey.secret,
          customer: customer.id,
          publishableKey: publicKey,
          paymentIntentId: paymentIntent.id
        });
   }
   catch(error){
      log.err({
        message: "Failed to carte payment"
      }),
      response.status(400).send({
        message: "Failed to carte payment"
      });
   }
}



async function cancelPaymentHandler(request, response) {
  
}

async function refundPaymentHandler(request, response) {
  const paymentIntentId = request.params.id

  log.debug("------------ Recived refund payment request ---------------")
  
  const getPayment = await axios.get(`${getPaymentURL}/${paymentIntentId}`,{
    headers: {
      Authorization: `Bearer ${accessToken}`,
  },
  });
  
  
  if(getPayment.status != 200){
    log.err({
      success: false,
      message: "Failed to recived payment",
      paymentIntentId: paymentIntentId
    })

    response.status(400).json({
      success: false,
      message: "Failed to recived payment",
      paymentIntentId: paymentIntentId
    });
    return
  }

  const chargeId = getPayment.data.latest_charge

  const refund = await stripe.refunds.create({
    charge: chargeId
  });
  
  if(refund.object != "refund"){
    log.err({
      success: false,
      message: "failed to refund payment",
      data: refund
    });
    response.status(400).json({
      success: false,
      message: "failed to refund payment",
      data: refund
    });
    return
  }

  /// update to the payment in database //
  let status = "Refunded"

  try{
    const updatePaymentDBStatus = await Make_Query(`UPDATE Payments SET Status = '${status}' WHERE PaymentIntent_id = '${paymentIntentId}'`);
  }
  catch(error){
    log.warn(error)
  }
  
  response.status(200).json({
    success: true,
    message: "Refund payment successfully",
    data: refund
  });
}


export {
  newPayment,
  cancelPaymentHandler,
  refundPaymentHandler
}