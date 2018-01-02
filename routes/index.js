const express = require('express');
const router = express.Router();
const fs = require('fs');
const readline = require('readline-promise');
const _ = require('lodash');
const fileUpload = require('express-fileupload');
const moment = require('moment');
moment.locale('hu');
const io = require('../app').io;
const functions = require('./functions');

router.use(fileUpload());

router.get('/', (req, res) => {
  res.render('index', {title: 'Graph Isomorphism'});
});

router.post('/isomorphism', (req, res) => {
  if(!req.files.leftGraph && !req.files.rightGraph){
    req.flash('errorMessage', 'Hiba! Egyik gráf se lett betöltve!');
  } else if(!req.files.leftGraph){
    req.flash('errorMessage', 'Hiba! A bal oldali gráf nincs betöltve!');
  } else if(!req.files.rightGraph){
    req.flash('errorMessage', 'Hiba! A jobb oldali gráf nincs betöltve!');
  } else {
    req.files.leftGraph.mv('uploadGraphs/' + req.files.leftGraph.name);
    req.files.rightGraph.mv('uploadGraphs/' + req.files.rightGraph.name);
    let data = [
      {
        comments: [],
        settings: {nodeNum: ''},
        edges: []
      },
      {
        comments: [],
        settings: {nodeNum: ''},
        edges: []
      }
    ];
    readline.createInterface({
      input: fs.createReadStream('./uploadGraphs/'+leftGraph)
    }).each((line) => {
      line = line.split(' ');
      if(line[0] == 'c'){
        data[0].comments.push({
          text: line[1]
        });
      }
      if(line[0] == 'p'){
        data[0].settings.nodeNum = line[2];
      }
      if(line[0] == 'e'){
        data[0].edges.push({
          nodeFrom: line[1],
          nodeTo: line[2]
        });
      }
    }).then(() => {
      readline.createInterface({
        input: fs.createReadStream('./uploadGraphs/'+rightGraph)
      }).each((line) => {
        line = line.split(' ');
        if(line[0] == 'c'){
          data[1].comments.push({
            text: line[1]
          });
        }
        if(line[0] == 'p'){
          data[1].settings.nodeNum = line[2];
        }
        if(line[0] == 'e'){
          data[1].edges.push({
            nodeFrom: line[1],
            nodeTo: line[2]
          });
        }
      }).then(() => {
        let izomorf = functions.isIsomorphic(data);
        if(izomorf) res.render('result', {data: data, izomorf: izomorf[0], matrix: [izomorf[1], izomorf[2]], nodeNums: [izomorf[3], izomorf[4]], fileNames: [leftGraph, rightGraph]});
        else res.render('nem', {izomorf: "Nem izomorf", fileNames: [leftGraph, rightGraph]});
      });
    });
  }
  res.locals.message = req.flash();
});

module.exports = router;
