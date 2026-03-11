const axios = require('axios');
const { MPESA } = require('../config/env');

// Check if we have real credentials
const hasRealCredentials = MPESA.CONSUMER_KEY && 
                          MPESA.CONSUMER_KEY !== 'dummy' &&
                          MPESA.CONSUMER_SECRET && 
                          MPESA.CONSUMER_SECRET !== 'dummy';

const getAccessToken = async () => {
  if (!hasRealCredentials) {
    return 'simulated_token';
  }
  const auth = Buffer.from(`${MPESA.CONSUMER_KEY}:${MPESA.CONSUMER_SECRET}`).toString('base64');
  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    return response.data.access_token;
  } catch (err) {
    throw new Error('Failed to get M-Pesa access token');
  }
};

const stkPush = async (phone, amount, accountReference, transactionDesc) => {
  // Simulate success if no real credentials
  if (!hasRealCredentials) {
    console.log('SIMULATED M-PESA STK PUSH:', { phone, amount, accountReference });
    return {
      MerchantRequestID: 'SIMULATED-' + Date.now(),
      CheckoutRequestID: 'SIMULATED-' + Date.now(),
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: 'Success. Request accepted for processing'
    };
  }

  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const businessShortCode = MPESA.SHORTCODE;
  const password = Buffer.from(businessShortCode + MPESA.PASSKEY + timestamp).toString('base64');

  const payload = {
    BusinessShortCode: businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: businessShortCode,
    PhoneNumber: phone,
    CallBackURL: MPESA.CALLBACK_URL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc
  };

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    throw new Error('STK push failed: ' + err.message);
  }
};

module.exports = { stkPush };