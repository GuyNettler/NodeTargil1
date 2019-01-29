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
user.findOneAndUpdate({username: usernamelog}, {$push: {logs: logdata}}, 
function (err, succ) {
if (err) console.log("err");
else console.log("succ");
})
console.log("log saved!");
};
