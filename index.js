/* Require external APIs and start our application instance */
var express = require('express');
var app = express();
var request = require('request');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mysql = require('mysql');
var session = require('express-session');
var underscore = require('underscore');

/*app uses*/
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'secret code',
    resave: true,
    saveUninitialized: true
}));

/* Configure MySQL DBMS */
const connection = mysql.createConnection({
    host: 'un0jueuv2mam78uv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'ly5cbwmnd8xy34el',
    password: 'nt1tm1rgknpk4357',
    database: 'dmuu5w4yl4ud7y2a',
    port:3306,
    multipleStatements: true
});
connection.connect();

/* Global variables */
var score = 0;
var answered = 0;
var counter = 1;
var questions = {};

/* Middleware */
function hasEmail(req, res, next){
    if(!req.session.hasEmail) res.redirect('/email');
    else next();
}

/* Functions */
function getRandomQuestions(questions){
    var randomIdx=[0,1,2];
    randomIdx=underscore.shuffle(randomIdx);
    console.log(randomIdx);
    var newRands={}
    var count=0;
    randomIdx.forEach(function(i){
        newRands[count]=questions[i];
        var choices=[];
        choices.push(questions[i].choice1);
        choices.push(questions[i].choice2);
        choices.push(questions[i].choice3);
        choices.push(questions[i].choice4);
        choices=underscore.shuffle(choices);
        newRands[count].choice1=choices[0];
        newRands[count].choice2=choices[1];
        newRands[count].choice3=choices[2];
        newRands[count].choice4=choices[3];
        count++;
    });
    return newRands;
}

/* Configure our server to read public folder and ejs files */
app.use(express.static('public'));
app.set('view engine', 'ejs');

/* The handler for the DEFAULT route */
app.get('/',hasEmail, function(req, res){
    counter=1;
    answered=0;
    score=0;
    var stmt = 'select * from questions';
	connection.query(stmt, function(error, found){
	    if(error) throw error;
	    if(found.length){
	    	//get random order for question
	    	//for each question, get random answers
	    	questions=getRandomQuestions(found);
	    	res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:"undefined",error:false,retake:false});
	    }
	});
});

app.get('/next',function(req, res) {
    answered++;
    console.log(answered);
    res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:"undefined",error:false,retake:false});
});

app.get('/submit',function(req, res) {
    var choice=req.query.choice;
    if(choice=="undefined"){
        res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:"undefined",error:true,retake:false}); 
    }
    else{
      //var answer=req.body.dataset.id;
        console.log("choice:"+req.query.choice);
        console.log("here");
        var answer=questions[answered].answer;
        if(choice==answer){
            score++;
        }
        res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:choice,error:false,retake:false});
    }
});

app.get('/complete',function(req, res) {
    var choice=req.query.choice;
    if(choice=="undefined"){
        res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:"undefined",error:true,retake:false}); 
    }
    var answer=questions[answered].answer;
    if(choice==answer){
        score++;
    }
    //insert data into DB
    let stmt = 'INSERT INTO scores (email,score,timestamp) VALUES (?, ?,CURRENT_TIMESTAMP)';
    let data = [req.session.email,score];
    connection.query(stmt, data, function(error, result){
       if(error) throw error;
       console.log(result);
       res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:choice,error:true,retake:true}); 
    });
});

/* Email "Login" Routes */
app.get('/email', function(req, res){
    res.render('email');
});

app.post('/email',function(req,res){
    req.session.hasEmail = true;
    req.session.email = req.body.email;
    console.log("email saved");
    res.redirect('/');
});

app.get('/complete',function(req, res) {
    
});

/* The handler for undefined routes */
app.get('*', function(req, res){
   res.render('error'); 
});

/* Start the application server */
app.listen(process.env.PORT || 3000, function(){
    console.log('Server has been started');
});