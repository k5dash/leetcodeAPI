const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('pages/index');
});

app.get('/user',function(req, res){
	var email = req.query.email;
	var urlGet = "https://api.mlab.com/api/1/databases/k5dash/collections/users?q={%22email%22:%20%22"+email+"%22}"
	var Qs = {"apiKey":"AFO4rXECE-OzVrg6JSSLK8NwO8hkij3u"};
	if (email){
		request.get({url:urlGet,qs:Qs}, function(error, response, body){
			  if (!error) { 
			  		var user = JSON.parse(body)
			  		res.json(user);
			  }
		});
	}
});

app.get('/createuser',function(req,res){
	var email = req.query.email;
	var urlPut = "https://api.mlab.com/api/1/databases/k5dash/collections/users"
	var Qs = {"apiKey":"AFO4rXECE-OzVrg6JSSLK8NwO8hkij3u"};
	if (email){
		request.post({url:urlPut, qs:Qs,json:{"email":email}},function(error, response, body){
  			if (!error) { 
		  		res.json(body);
			}
  		});
	}
});

app.get('/problems', function(req, res) {
	var problems = {};
	var nac_problems = {'nac_easy':[], 'nac_medium':[],'nac_hard':[]};
	var ac_problems = {'ac_easy':[], 'ac_medium':[],'ac_hard':[]};
	var result = {};
	result.nac_problems = nac_problems;
	result.ac_problems = ac_problems;

	var deadLine = new Date(2018, 5, 1);
	var startDate = new Date(2018, 1, 1);
	var daysToFinish = (deadLine.getTime() - startDate.getTime()) /(3600*24*1000);
	var oldTotal = 1100;
	var oldPointsPerDay = oldTotal/daysToFinish;

	request.post({ url: "http://localhost:8000/leetcode", form: {username:req.query.username,password:req.query.password} }, function(error, response, body) { 
	      if (!error) { 
	      	problems = JSON.parse(body);
	      	for (var i = 0; i < problems.stat_status_pairs.length; i++){
	      		var prb = problems.stat_status_pairs[i];
	      		if (prb.status === null) {
	      			if (prb.difficulty.level === 1){
	      				nac_problems.nac_easy.push(prb);
	      			} else if(prb.difficulty.level === 2) {
	      				nac_problems.nac_medium.push(prb);
	      			} else
	      				nac_problems.nac_hard.push(prb);
	      		} else {
	      			if (prb.difficulty.level === 1){
	      				ac_problems.ac_easy.push(prb);
	      			} else if(prb.difficulty.level === 2) {
	      				ac_problems.ac_medium.push(prb);
	      			} else
	      				ac_problems.ac_hard.push(prb);
	      		}
	      	}

	      	var total = nac_problems.nac_hard.length*3 + nac_problems.nac_medium.length*2 + nac_problems.nac_easy.length;
	      	console.log('total:'+total);
	      	var days = total / oldPointsPerDay;
	      	var now = new Date();
	      	var finishDate = addDays(now,days);
	      	var diff = finishDate.getDate()- deadLine.getDate();
	      	if (diff >= 0){
	      		console.log("behind schedule:"+ diff +" days");
	      	} else {
	      		console.log("ahead schedule:" + (-diff)+" days");
	      	}
	      	result.total_score = total;
	      	res.json(result);
	      } 
    }); 
});

app.get('/problemsraw', function(req, res) {
	request.post({ url: "http://localhost:8000/leetcode", form: {username:req.query.username,password:req.query.password} }, function(error, response, body) { 
		res.json(JSON.parse(body));
	});
});

app.post('/problems', function(req, res) {
	request.post({ url: "http://localhost:8000/leetcode", form: {username:req.body['username'],password:req.body['password']} }, function(error, response, body) { 
	      if (!error) { 
	          res.json(JSON.parse(body)); 
	      } 
    }); 
});

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
