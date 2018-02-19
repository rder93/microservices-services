var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var cors = require('cors');
var path = require('path');


var app = express();

const port = 5001;
const routes = require('./routes/route');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27018/servicios');
mongoose.connection.on('connected',()=>{
	console.log('Connected to MongoDB at 27018');
});

mongoose.connection.on('error',(err)=>{
	if (err) {
		console.log('Error is: '+err)
	}
});


app.use(cors());
app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({extended: true}));
app.use('/', routes);
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', function(req, res){
// 	// res.send('hello world');
// 	res.sendFile(path.join(__dirname, '/index.html'));
// });

app.listen(port, ()=>{
	console.log('Modulo Servicio running at port: '+port);
});
