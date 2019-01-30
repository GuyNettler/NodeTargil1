const express = require('express')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

var _eval = require('eval');
const app = express()
const port = 3000;
const bodyParser = require('body-parser');

const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const router = express.Router();

const url = "mongodb://guyNode:zyguibplsq19t@ds259144.mlab.com:59144/guynode";

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
res.cookie("passwordcookie", req.body.password);
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
var logfunc = `
var username= "${req.cookies['usercookie']}";
var password= "${req.cookies['passwordcookie']}";
exports.username = username;
exports.password = password;
`;
fs.writeFileSync('logFunc.txt', logfunc, (err) => {
if (err) console.log("err2");
console.log('func saved!');
});
res.download('logFunc.txt');
});

app.post("/addlog", (req, res) => {
var log = {"title": req.body.textlogtitle, "text": req.body.textlogtext, "date":new Date()};
var functext = _eval(req.body.textfunction);
user.findOne({"username": functext.username,"password": functext.password},
function(err, userr) {
if (userr) {
mongoose.set('useFindAndModify', false);
user.findOneAndUpdate({username: functext.username}, {$push: {logs: log}},
{safe: true, upsert: true});
res.send(`<h2>user</h2> <h1>${functext.username}</h1><h2> log sent!</h2>`);
} else {
res.send("<h2>username or password does not match!</h2>")
}
})
})
