/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), user = require('./routes/user'), mongoose = require('mongoose'), http = require('http'), path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

mongoose.connect("mongodb://localhost/dataMahasiswa");

var students = new mongoose.Schema({
	nim : String,
	nama : String,
	email : String,
	umur : Number
})

app.get('/', routes.index);
app.get('/users', user.list);

data = mongoose.model('students', students);

app.get("/siswa", function(req, res) {
	data.find({}, function(err, docs) {
		res.render('siswa/alldata', {
			data : docs
		});
	});
})
// new data
app.get("/siswa/baru", function(req, res) {
	res.render('siswa/baru');
})
// create user baru post
app.post("/siswa", function(req, res) {
	var b = req.body;
	new data({
		nim : b.nim,
		nama : b.nama,
		email : b.email,
		umur : b.umur
	}).save(function(err, user) {
		if (err)
			res.json(err);
		res.redirect('/siswa/' +b.nama);
	});
});

// result setelah mengisi atau klik mahasiswa
app.param('nama', function(req, res, next, nama) {
	data.find({
		nama : nama
	}, function(err, docs) {
		req.data = docs[0];
		next();
	});// asumsi result unique
});

app.get('/siswa/:nama', function(req, res) {
	res.render("siswa/tampilkan", {
		data : req.data
	})
});
// Edit Form
app.get('/siswa/:nama/edit', function(req, res) {
	res.render("siswa/edit", {
		data : req.data
	});
})
// Update
app.put('/siswa/:nama', function(req, res) {
	var b = req.body;
	data.update({
		nama : req.params.nama
	}, {
		nim : b.nim,
		nama : b.nama,
		email : b.email,
		umur : b.umur
	}, function(err) {
		res.redirect("/siswa/" + b.nama);
	});
});


app.delete('/siswa/:nama',function(req,res){
	data.remove({nama : req.params.nama}, function(err){
		res.redirect('/siswa');
	});
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
