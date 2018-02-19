const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const request = require('request');
const rp = require('request-promise');
const { populateByReference } = require('json-populate');
const EventEmitter = require("events").EventEmitter;

const multer = require('multer');
const fs = require('fs');
const moment = require('moment');

const Service = require('../models/services');
const ServiceComment = require('../models/services_comments');
const port = 5001;

var upload = multer({dest:'uploads/'});

function retrieveUsers(servicios, callback){
    
    var listuser = [];
    for (var i = 0; i < servicios.length; i++) {
        var options = {
            url: "http://localhost:3000/api/getUser/"+servicios[i].postedBy,
            method: "GET",
            json: true
        };
        request(options, function (error, response, body) {
            // console.log(response.statusCode);
            if (response.statusCode == 200) {
                listuser.push({"users": body});
                callback(null, body);
            }else{
                callback(error, null);
            }
        });
    }

}

// Get all services
router.get('/services', (req, res, next) => {
    
    Service.find({status: {$ne: false}}, function(err, services) {
        if (err) {
            res.status(500).json({error: "No hay registrado ningún servicio..."});
            res.end();
        } else {
            var listuser = [];
            retrieveUsers(services, function(error, response){
                listuser.push(response);

                if (listuser.length == services.length) {
                    
                    res.status(200).json(services);   
                }
                
            });
        }
    }).sort({created: 'desc'}).limit(5);
    
});

// Get all comments of services
router.get('/servicescomments', (req, res, next) => {
    ServiceComment.find(function(err, servicescomments) {
        res.json(servicescomments);
    })
});

//retrieve one service
router.get('/service/:id', (req, res, next) => {
    Service.findOne({ _id: req.params.id }, function(err, service) {
        if (err) {
            res.status(500).json(err);
        }

        res.status(200).json(service);

    });
});

//retrieve one comment of service
router.get('/servicecomment/:id', (req, res, next) => {
    ServiceComment.findOne({ _id: req.params.id }, function(err, servicecomment) {
        if (err) {
            res.json(err);
        }

        res.json(servicecomment);

    });
});

//retrieve services by user
router.get('/servicesByUser/:id', (req, res, next) => {
    Service.find({"user._id": req.params.id}, function(err, services) {
        if (err) {
            res.status(500).json({"error": "No se ha encontrado ningun servicio registrado."});
        }

        res.status(200).json(services);

    });
});

//add a service
router.post('/service', upload.any(), function(req, res) {

    moment.locale();

    if (req.files) {
        var filename = "";
        // req.files.forEach( function(file) {
            // var filename = (new Date).valueOf()+'-'+file.originalname;
        var options = {
            url: "http://localhost:3000/api/user/"+req.body.userid,
            method: "GET",
            json: true
        };
        request(options, function (error, response, body) {
            // console.log(response.statusCode);
            if (response.statusCode == 200) {
                req.files.forEach( function(file) {
                    filename = (new Date).valueOf()+'-'+file.originalname;

                    fs.rename(file.path, 'public/img/'+filename, function(err){
                        if(err){
                            res.status(500).json(err);
                            res.end();
                        }

                        console.log('file uploaded...');

                    });

                });

                var service = new Service({
                    title: req.body.title,
                    description: req.body.description,
                    price: req.body.price,
                    postedBy: body._id,
                    user: body,
                    img: filename,
                    created: moment().format('YYYY/MM/DD, h:mm:ss a')
                })

                console.log(service);

                service.save((err, service) => {
                    if (err) {
                        res.status(500).json({ "error": 'Ha ocurrido un error. Intente nuevamente' });
                        // console.log(err);
                        res.end();
                    } else {
                        res.status(200).json({ "msg": 'La publicación ha sido creada satisfactoriamente.', service: service, urlimg: req.headers.host+'/img'});
                        console.log({ "msg": 'La publicación ha sido creada satisfactoriamente.', service: service, urlimg: req.headers.host+'/img'});
                        res.end();
                    }
                });

            }else{
                res.status(500).json(body);
            }
        });
    }
    
});

//delete service
router.delete('/service/:id', (req, res, next) => {
    Service.remove({ _id: req.params.id }, function(err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});


//update a service status
router.post('/serviceStatus', (req, res, next) => {

    Service.findOne({ _id: req.body.id }, function(err, service) {
        if (err) {
            res.status(500).json(err);
            res.end();
        }

        if (service.status) {
            service.set({ status: false });
        }else{
            service.set({ status: true });
        }
        
        service.save(function (err, service) {
            if (err){
                res.status(500).json(err);
                res.end();
            }else{
                res.status(200).json({service: service, msg: "se ha cambiado el status"});
                res.end();
            }            
        });
        

    });

});

module.exports = router;