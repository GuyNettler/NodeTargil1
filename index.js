const express = require('express')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express()
const port = 3000
const bodyParser = require('body-parser');

const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const router = express.Router();

const url = process.env.MONGOLAB_URI;

const schema = new mongoose.Schema ({
username: String,
password: String,
logs: [{title: String, text: String, date: Date}]
});

const user = mongoose.model("user", schema);

mongoose.Promise = global.Promise;

mongoose.connect(url, {useNewUrlParser: true}).then(()=>console.log("connected!"));

app.get("/", (req, res) => {
res.clearCookie("usercookie");
res.render("index")
})

app.use("/", express.static("public"));

app.set('views', 'views');
app.set('view engine', 'ejs')

app.listen(port, () => console.log('example app on port '+ port))

app.post("/register", (req, res) => {
const myData = new user(req.body);
user.findOne({'username': req.body.username},
function(err, user) {
console.log('error!');
if (user) {
res.send("<h2>user already exists!</h2><a href='/'>try again</a> ");
} else {
myData.save()
.then(username => {
res.send("<h2>username saved to database</h2><a href='/'>home</a>");
})
.catch(err => {
res.status(400).send("unable to save to database");
});
}
})
})


app.post("/signin", (req, res) => {
user.findOne({'username': req.body.username,
'password': req.body.password},
function(err, user) {
console.log(req.body);
if (user) {
res.cookie("usercookie", req.body.username);
res.send(`<h2> user</h2> <h1 id="signinname">${req.body.username}</h1><h2> has signed in!</h2> <a href="/">log out</a><br><form method="post" action="/downloadlogs" id="download-log"><input type="submit" value="Download Log Function"></form><br><form method="post" action="/viewlogs" id="view-logs"><input type="submit" value="View Logs"></form>`) 
} else {
res.send("<h2>username or password does not match!</h2><a href='/'>try again</a> ")
}
})
})

app.post("/viewlogs", (req, res) => {
user.findOne({'username': req.cookies['usercookie']},
function(err, user) {
console.log(req.body);
if (user) {
res.send(`<h2> ${user.logs} </h2>`)
} else {
res.send("error!")
}
})
})

app.post("/downloadlogs", (req, res) => {
const logfunc = `

const mongoose = require('mongoose');
const url = 'mongodb://guyNode:zyguibplsq19t@ds259144.mlab.com:59144/guynode';
const schema = new mongoose.Schema ({
username: String,
password: String,
logs: [{title: String, text: String, date: Date}]
});
const user = mongoose.model("user", schema);
const usernamelog = require('./index.js');
mongoose.Promise = global.Promise;
mongoose.connect(url, {useNewUrlParser: true}).then(()=> {
console.log("connected!")
});
mongoose.set('useFindAndModify', false);
function log(title, text) {
var logdata = {"title": "title", "text": "text", date: new Date()};
user.findOneAndUpdate({username: "${req.cookies['usercookie']}"}, {$push: {logs: logdata}}, 
function (err, succ) {
if (err) console.log("err");
else console.log("succ");
})
console.log("log saved!");
};

`;
fs.writeFileSync('logFunc.txt', logfunc, (err) => {
if (err) console.log("err2");
console.log('func saved!');
console.log(logfunc);
});
res.download('/home/node/Desktop/NodeTargil1/logFunc.txt');
});


/*
app.post("/downloadlogs", (req, res) => {
let logfunc = fs.readFileSync("/home/node/Desktop/NodeTargil1/func.js", "utf8", function(err, data) {
if(err) console.log("err");
else {
fs.writeFile('logFunc.txt', logfunc, (err) => {
if (err) console.log("err2");
console.log('func saved!');
});
}
});
res.download('/home/node/Desktop/NodeTargil1/logFunc.txt');
});
*/
