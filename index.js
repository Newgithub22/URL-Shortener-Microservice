require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
// Require and connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env.KEY, {useNewUrlParser: true, useUnifiedTopology: true});
// Add Body Parser
let bodyParser = require('body-parser');
app.use("/", bodyParser.urlencoded({extended: false}));
// Add url dns module
//const url = require('node:url');
let dns = require("dns");
// Schema for URL original_url and short_url
let urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: {type: Number, required: true}
});
// URL Model
let URLmodel = mongoose.model("URLmodel", urlSchema);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

//URL Shortener
app.post("/api/shorturl", function(req, res){
  let url = new URL(req.body.url);
  dns.lookup(url.hostname, function(err, address, family)
    {
      console.log("I am in the dns lookup");
        if(err)
        {
          res.json({error: 'invalid url'});
        }
        else
        {
          console.log("No dns error");
          URLmodel.find().exec()
          .then(data => 
            {
              console.log("I got a response");
              //console.log(data);
              let url_count = data.length;
              let new_url = new URLmodel({original_url: req.body.url, short_url: url_count});
              new_url.save()
              .then(saved => {
                console.log("I saved the new url");
                console.log(saved);
                res.json(saved);
              })
                .catch(err =>{
                  console.log("I catched an error while saving");
                  console.log(err);
                });
              })
        }
    })
});

// Access url using short_url
app.get("/api/shorturl/:short", function(req, res){
  console.log("I am in the get request");
  URLmodel.findOne({short_url: req.params.short}).exec()
  .then(data => {
    res.redirect(data.original_url);
  })
  .catch(err => console.log(err));
});
