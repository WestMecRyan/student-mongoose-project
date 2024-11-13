// models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  employee_id: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: ['cashier', 'stocker', 'manager', 'clerk', 'security']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['produce', 'bakery', 'dairy', 'meat', 'grocery', 'customer service']
  },
  date_hired: {
    type: Date,
    required: [true, 'Date hired is required']
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: 0
  },
  full_time: {
    type: Boolean,
    default: true
  },
  contact_info: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone_number: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    }
  },
  emergency_contact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true
    },
    phone_number: {
      type: String,
      required: [true, 'Emergency contact phone number is required'],
      trim: true
    }
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
