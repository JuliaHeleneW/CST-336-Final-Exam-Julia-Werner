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

/* Global variables that can be used and adjusted for function calls to avoid duplicate select statements */
var score = 0;
var answered = 0;
var counter = 1;
var questions = {};
var scores = {};
var reports = {};
var avg = 0.0;

/* Middleware */
function hasEmail(req, res, next){
    if(!req.session.hasEmail) res.redirect('/email');
    else next();
}

/* Functions */

//function to get random questions using the underscore packet
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
    //questions
    var stmt = 'SELECT * FROM questions;';
    //input options for reports
    var stmt2 = 'SELECT * FROM scores;';
    var stmt3 = 'SELECT score,timestamp FROM scores WHERE email=\''+req.session.email+'\';';
    var stmt4 = 'SELECT AVG(score) FROM scores WHERE email=\''+req.session.email+'\';';
	connection.query(stmt.concat(stmt2,stmt3,stmt4),[1,2,3,4], function(error, found){
	    if(error) throw error;
	    if(found.length){
	    	//get random order for question
	    	//for each question, get random answers
	    	questions=getRandomQuestions(found[0]);
	    	scores=found[1];
	    	scores.forEach(function(score){
	    	    //update score timestamp to display less data
	    	    var slicedTime=score.timestamp.toString().split(' ').slice(0,5).join(' ');
	    	    score.timestamp=slicedTime;
	    	});
	    	reports=found[2];
	    	reports.forEach(function(report){
	    	    //update report timestamp to display less data
	    	    var slicedTime=report.timestamp.toString().split(' ').slice(0,5).join(' ');
	    	    report.timestamp=slicedTime;
	    	});
	    	//store average score
	    	avg=found[3][0]['AVG(score)'];
	    	
	    	//render home page
	    	res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:"undefined",error:false,retake:false,scores:scores,reports:reports,avg:avg});
	    }
	});
});

/*route to navitage to next question */
app.get('/next',hasEmail,function(req, res) {
    //one more question has been answered
    answered++;
    //home page will now display next question
    res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:"undefined",error:false,retake:false,scores:scores,reports:reports,avg:avg});
});

/* route to submit a question */
app.get('/submit',hasEmail,function(req, res) {
    //get user choice from query
    var choice=req.query.choice;
    //if no choice was made, display error message
    if(choice=="undefined"){
        res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:"undefined",error:true,retake:false,scores:scores,reports:reports,avg:avg}); 
    }
    else{
        //correct answer
        var answer=questions[answered].answer;
        //increment score if correct answer
        if(choice==answer){
            score++;
        }
        //render home page with updated score and updated choice for color background of questions
        res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:choice,error:false,retake:false,scores:scores,reports:reports,avg:avg});
    }
});

/* route when user submitted all 3 questions */
app.get('/complete',hasEmail,function(req, res) {
    //get choice from user query
    var choice=req.query.choice;
    //if no choice was made, display error message
    if(choice=="undefined"){
        res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:"undefined",error:true,retake:false,scores:scores,reports:reports,avg:avg}); 
    }
    //update score if answer was correct
    var answer=questions[answered].answer;
    if(choice==answer){
        score++;
    }
    //insert data into DB
    let stmt = 'INSERT INTO scores (email,score,timestamp) VALUES (\''+req.session.email+'\',\''+score+'\' ,CURRENT_TIMESTAMP);';
    //update reports since player scores are updated
    var stmt2 = 'SELECT * FROM scores;';
    var stmt3 = 'SELECT score,timestamp FROM scores WHERE email=\''+req.session.email+'\';';
    var stmt4 = 'SELECT AVG(score) FROM scores WHERE email=\''+req.session.email+'\';';
    connection.query(stmt.concat(stmt2,stmt3,stmt4),[1,2,3,4], function(error, result){
       if(error) throw error;
       scores=result[1];
    	scores.forEach(function(score){
    	    var slicedTime=score.timestamp.toString().split(' ').slice(0,5).join(' ');
    	    score.timestamp=slicedTime;
    	});
    	reports=result[2];
    	reports.forEach(function(report){
    	    var slicedTime=report.timestamp.toString().split(' ').slice(0,5).join(' ');
    	    report.timestamp=slicedTime;
    	});
    	avg=result[3][0]['AVG(score)'];
    	/*render home page with retake as true to display retake quiz option */
       res.render('home', {questions:questions,counter:counter,answered:answered,score:score,choice:choice,error:false,retake:true,scores:scores,reports:reports,avg:avg}); 
    });
});

/* Email "Login" Routes */
app.get('/email', function(req, res){
    res.render('email');
});

/* route to save email in session */
app.post('/email',function(req,res){
    req.session.hasEmail = true;
    req.session.email = req.body.email;
    console.log("email saved");
    res.redirect('/');
});

/* The handler for undefined routes */
app.get('*', function(req, res){
   res.render('error'); 
});

/* Start the application server */
app.listen(process.env.PORT || 3000, function(){
    console.log('Server has been started');
});