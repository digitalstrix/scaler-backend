const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orders: {
    type: Array,
    default: [],
  },
  paymentId: String,
});

module.exports = mongoose.model("Order", orderSchema);
