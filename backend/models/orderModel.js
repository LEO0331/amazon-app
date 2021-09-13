import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
      orderItems: [
        {
          name: { type: String, required: true },
          qty: { type: Number, required: true },
          image: { type: String, required: true },
          price: { type: Number, required: true },
          product: { //link to product model
            type: mongoose.Schema.Types.ObjectId, //https://mongoosejs.com/docs/schematypes.html
            ref: 'Product',
            required: true
          }
        }
      ],
      shippingAddress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        lat: Number,
        lng: Number
      },
      paymentMethod: { type: String, required: true },
      paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
      },
      itemsPrice: { type: Number, required: true },
      shippingPrice: { type: Number, required: true },
      taxPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //https://stackoverflow.com/questions/28997636/should-i-use-schema-types-objectid-or-schema-objectid-when-defining-a-mongoose-s
      isPaid: { type: Boolean, default: false },
      paidAt: { type: Date },
      isDelivered: { type: Boolean, default: false },
      deliveredAt: { type: Date },
    },
    {
      timestamps: true //create and last update date
    }
);
const Order = mongoose.model('Order', orderSchema);
export default Order;
