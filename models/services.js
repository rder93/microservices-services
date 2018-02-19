const mongoose = require('mongoose');

const ServicesSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: String,
        default: 0
    },
    img: { 
        type: String,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: null
    },
    postedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    user : {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        phone: String,
        reputation: {
            type: Number,
            default: 0
        },
        address: String
    },
    comments: [{
        text: String,
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            default: null
        }
    }]
});

// var autoPopulateLead = function(next) {
//   this.populate('postedBy');
//   next();
// };

// ServicesSchema
//     .pre('findOne', autoPopulateLead)
//     .pre('find', autoPopulateLead);

const Services = module.exports =  mongoose.model('Services', ServicesSchema);