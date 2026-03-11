const { stkPush } = require('../utils/mpesa');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { getIO } = require('../utils/socket');

// Initiate STK push
exports.stkPush = async (req, res, next) => {
  try {
    const { phone, amount, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const response = await stkPush(phone, amount, `Order${orderId}`, 'ElectroStore Payment');
    
    // Save transaction as pending
    const transaction = await Transaction.create({
      order: orderId,
      user: req.user.id,
      amount,
      phoneNumber: phone,
      status: 'pending',
      mpesaResponse: response
    });

    res.json({ message: 'STK push initiated', transaction, response });
  } catch (err) {
    next(err);
  }
};

// M-Pesa callback URL
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
      // Update order payment status
      await Order.findByIdAndUpdate(transaction.order, { paymentStatus: 'paid' });

      // Notify customer via socket
      const io = getIO();
      io.to(`user:${transaction.user}`).emit('paymentSuccess', { orderId: transaction.order });
    }

    res.json({ ResultCode, ResultDesc });
  } catch (err) {
    next(err);
  }
};