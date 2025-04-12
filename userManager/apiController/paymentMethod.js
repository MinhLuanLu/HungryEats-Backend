



async function PaymentMetodHandler(request, response) {
    

    response.status(200).send({
        success: true,
        message: 'payment method'
    })
}

export default PaymentMetodHandler