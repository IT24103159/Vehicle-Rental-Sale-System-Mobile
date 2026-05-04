const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  inquiryType: { 
    type: String, 
    enum: ['NEGOTIATION', 'BUY_NOW'], 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'REPLIED', 'ACCEPTED', 'REJECTED'], 
    default: 'PENDING' 
  },
  adminReply: { 
    type: String,
    default: ''
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  vehicleSaleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'VehicleSale', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
