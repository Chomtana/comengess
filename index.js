const express = require('express')
const app = express()
const port = 3000
const _ = require("lodash")

var currdata = [];
var gooddata = [];
var baseline = [];
var isRunning = false;

var engine = require('consolidate');

app.set('views', __dirname + '');
app.engine('html', engine.mustache);
app.set('view engine', 'html');

app.get('/uploaddata', (req, res) => {
  currdata = req.query.data.trim().split(" ").map(x=>parseFloat(x));
  if (isRunning) { 
    for(var i = 0;i<currdata.length;i++) {
      var a1 = (currdata[i] - baseline[i]) % 360;
      var a2 = - (360 - a1 ) % 360
      
      if (a1 < 0) {
        a1 += 360;
      }
      if (a2 > 0) {
        a2 -= 360;
      }
      
      if (Math.abs(a1)>=357 || Math.abs(a1)<=3) {
        a1 = 0;
      }
      if (Math.abs(a2)>=357 || Math.abs(a2)<=3) {
        a1 = 0;
      }
      
      if (Math.abs(currdata[i])<=5) {
        if (Math.abs(a1) < Math.abs(a2)) {
          gooddata[i] = a1;
        } else {
          gooddata[i] = a2;
        }
      } else {      
        if (i==1) {
          //console.log(a1,a2);
        }
        if (Math.abs(a1-gooddata[i]) < Math.abs(a2-gooddata[i])) {
          gooddata[i] = a1;
        } else {
          gooddata[i] = a2;
        }
        //gooddata[i] = currdata[i] - baseline[i];
      }
    }
    //console.log(gooddata);
    res.send("Running");
    
    console.log(currdata);
  } else {
    res.send("Stopped")
  }
  
  
})

app.get('/data', (req, res) => {
  var status = isRunning?"Running":"Stopped";
  res.send(gooddata.concat(status));
})

app.get('/reset', (req, res) => {
  currdata = [];
}) 

app.get('/start', (req, res) => {
  isRunning = true;
  baseline = _.cloneDeep(currdata);
  gooddata = _.cloneDeep(currdata);
  res.send("Running");
  
  console.log("Started");
}) 

app.get('/stop', (req, res) => {
  isRunning = false;
  res.send("Stopped");
  
  console.log("Stopped");
}) 

app.get('/monitor', (req, res) => {
  res.render("./monitor.html");
}) 

app.listen(port, () => console.log(`Example app listening on port ${port}!`))