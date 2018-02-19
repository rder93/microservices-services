const mongoose = require('mongoose');

var Services = mongoose.model('Services');

const ServicesCommentsSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    service:{ 
        type: mongoose.Schema.ObjectId,
        ref: "Services" 
    } 
});

const ServicesComments = module.exports =  mongoose.model('ServicesComments', ServicesCommentsSchema);