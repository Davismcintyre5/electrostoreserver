const { stkPush } = require('../utils/mpesa');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const AccountEntry = require('../models/AccountEntry');
const { getIO } = require('../utils/socket');

exports.stkPush = async (req, res, next) => {
  try {
    const { phone, amount, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    const response = await stkPush(cleanPhone, amount, `Order${orderId}`, 'ElectroStore Payment');

    const transaction = await Transaction.create({
      order: orderId,
      user: req.user.id,
      amount,
      phoneNumber: cleanPhone,
      status: 'pending',
      mpesaResponse: response
    });

    if (response.MerchantRequestID?.startsWith('SIMULATED')) {
      setTimeout(async () => {
        await Transaction.findByIdAndUpdate(transaction._id, {
          status: 'completed',
          mpesaReceiptNumber: `SIM${Date.now()}`
        });
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' });
        const io = getIO();
        io.to(`user:${order.user}`).emit('paymentSuccess', { orderId });
      }, 3000);
    }

    res.json({ message: 'STK push initiated', transaction, response });
  } catch (err) {
    console.error('M-Pesa STK push error:', err);
    res.status(500).json({ message: 'Payment initiation failed', error: err.message });
  }
};

exports.callback = async (req, res, next) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    const transaction = await Transaction.findOneAndUpdate(
      { 'mpesaResponse.CheckoutRequestID': stkCallback.CheckoutRequestID },
      {
        status: ResultCode === 0 ? 'completed' : 'failed',
        mpesaReceiptNumber: CallbackMetadata?.Item?.find(item => item.Name === 'MpesaReceiptNumber')?.Value,
        mpesaResponse: stkCallback
      },
      { new: true }
    );

    if (transaction && ResultCode === 0) {
      const order = await Order.findByIdAndUpdate(transaction.order, { paymentStatus: 'paid' }, { new: true });

      await AccountEntry.create({
        type: 'income',
        amount: transaction.amount,
        description: `Payment for order ${order._id}`,
        reference: order._id,
        createdBy: order.user
      });

      const io = getIO();
      io.to(`user:${transaction.user}`).emit('paymentSuccess', { orderId: transaction.order });
    }

    res.json({ ResultCode, ResultDesc });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    res.status(500).json({ message: 'Callback processing failed' });
  }
};