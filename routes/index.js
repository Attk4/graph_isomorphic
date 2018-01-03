const express = require('express');
const router = express.Router();
const fs = require('fs');
const readline = require('readline-promise');
const fileUpload = require('express-fileupload');
const moment = require('moment');
moment.locale('hu');
const functions = require('./functions');

router.use(fileUpload());

router.get('/', (req, res) => { 
  if(req.session.leftGraph) req.session.leftGraph = '';
  if(req.session.rightGraph) req.session.rightGraph = '';
  if(req.session.data) req.session.data = [];
  if(!req.session.error) req.session.error = '';
  res.render('index', {title: 'Graph Isomorphism', error: req.session.error});
});

router.post('/isomorphism', (req, res) => {
  if(!req.files.leftGraph && !req.files.rightGraph) {
    req.session.error = 'Both graphs are Empty!';
    res.redirect('back');
  } else if(!req.files.leftGraph) {
    req.session.error = 'The left graph is Empty!';
    res.redirect('back');
  } else if(!req.files.rightGraph) {
    req.session.error = 'The right graph is Empty!'
    res.redirect('back');
  } else {
    req.session.error = '';
  }
  req.session.data = [{
    comments: [],
    settings: {nodeNum: ''},
    edges: []
  },
  {
    comments: [],
    settings: {nodeNum: ''},
    edges: []
  }];
  req.session.leftGraph = req.files.leftGraph.name;
  req.session.rightGraph = req.files.rightGraph.name;
  req.files.leftGraph.mv('uploadGraphs/' + req.session.leftGraph, function(err){
    readline.createInterface({
      input: fs.createReadStream('./uploadGraphs/'+req.session.leftGraph)
    }).each((line) => {
      line = line.split(' ');
      if(line[0] == 'c'){
        req.session.data[0].comments.push({
          text: line[1]
        });
      }
      if(line[0] == 'p'){
        req.session.data[0].settings.nodeNum = line[2];
      }
      if(line[0] == 'e'){
        req.session.data[0].edges.push({
          nodeFrom: line[1],
          nodeTo: line[2]
        });
      }
    }).then(() => {
      req.files.rightGraph.mv('uploadGraphs/' + req.session.rightGraph, function(err){
        readline.createInterface({
          input: fs.createReadStream('./uploadGraphs/'+req.session.rightGraph)
        }).each((line) => {
          line = line.split(' ');
          if(line[0] == 'c'){
            req.session.data[1].comments.push({
              text: line[1]
            });
          }
          if(line[0] == 'p'){
            req.session.data[1].settings.nodeNum = line[2];
          }
          if(line[0] == 'e'){
            req.session.data[1].edges.push({
              nodeFrom: line[1],
              nodeTo: line[2]
            });
          }
        }).then(() => {
          let izomorf = functions.isIsomorphic(req.session.data);
          let data = izomorf[0];
          let isIsomorphic = izomorf[1];
          let matrixes = [izomorf[2], izomorf[3]];
          let edgeNumbers = [izomorf[4], izomorf[5]];
          if(isIsomorphic) res.render('result', {data: data, izomorf: isIsomorphic, matrix: matrixes, edgeNumbers: edgeNumbers, fileNames: [req.session.leftGraph, req.session.rightGraph], title: 'Graph Isomorphism'});
          else res.render('nem', {izomorf: 'Not isomorphic.', fileNames: [req.session.leftGraph, req.session.rightGraph], title: 'Graph Isomorphism'});
        });
      });
    });
  });
});

module.exports = router;
