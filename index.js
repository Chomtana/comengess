const express = require('express')
const app = express()
const port = 3000
const _ = require("lodash")

var currdata = [];
var gooddata = [];
var baseline = [];
var isRunning = false;

//var history = [[1,3,2,"Stopped",new Date()]];
var history = [];

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
      
      while (a1 < 0) {
        a1 += 360;
      }
      while (a2 > 0) {
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
  if (isRunning) {
    gooddata[4] = (new Date()).toLocaleString();
    history.push(gooddata);
  }
  
  isRunning = false;
  res.send("Stopped");
  
  console.log("Stopped");
}) 

app.get('/', (req, res) => {
  res.render("./monitor.html");
}) 

app.get('/history.png', (req, res) => {
  res.sendFile(__dirname+'/history.png')
})

app.get('/history', (req,res) => {
  res.send(history)
})

app.get('/iotlevel.csv', (req,res) => {
  res.setHeader('Content-disposition', 'attachment; filename=iotlevel.csv');
  res.set('Content-Type', 'text/csv');
  
  var header = ['Time','Axis 1','Axis 2'];
  
  var data = header.join(",");
  for(var x of history) {
    data += "\n"+x[4]+","+x[0]+","+x[1];
  }
  
  res.send(data)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))