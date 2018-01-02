const express = require('express');
const router = express.Router();
const fs = require('fs');
const readline = require('readline-promise');
const _ = require('lodash');
const fileUpload = require('express-fileupload');
const moment = require('moment');
const math = require('mathjs');
const Combinatorics = require('js-combinatorics');
moment.locale('hu');
const io = require('../app.js').io;

router.use(fileUpload());

router.get('/', (req, res) => {
  res.render('index', {title: 'Graph Isomorphism'});
});

router.post('/isomorphism', (req, res) => {
  // V[2] , V[4] === W[f(2)], W[f(4)]
  //  1    2    3   ...    n
  // f(1) f(2) f(3)       f(n)
  if(!req.files.leftGraph && !req.files.rightGraph){
    req.flash('errorMessage', 'Hiba! Egyik gráf se lett betöltve!');
  } else if(!req.files.leftGraph){
    req.flash('errorMessage', 'Hiba! A bal oldali gráf nincs betöltve!');

  } else if(!req.files.rightGraph){
    req.flash('errorMessage', 'Hiba! A jobb oldali gráf nincs betöltve!');
  } else {
    let split1 = req.files.leftGraph.name.split('.');
    let split2 = req.files.rightGraph.name.split('.');
    let leftGraph = split1[0] + '_' + moment().format('YYYYMMDD_H_mm_ss_SSS') + '.' + split1[1];
    let rightGraph = split2[0] + '_' + moment().format('YYYYMMDD_H_mm_ss_SSS') + '.' + split2[1];
    req.files.leftGraph.mv('uploadGraphs/' + leftGraph);
    req.files.rightGraph.mv('uploadGraphs/' + rightGraph);
    //req.files.leftGraph.mv('uploadGraphs/graph1.dimacs');
    //req.files.rightGraph.mv('uploadGraphs/graph2.dimacs');
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
      //input: fs.createReadStream('./uploadGraphs/graph1.dimacs')
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
        //input: fs.createReadStream('./uploadGraphs/graph2.dimacs')
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
        let izomorf = isIsomorphic(data);
        if(izomorf) res.render('result', {data: data, izomorf: izomorf[0], matrix: [izomorf[1], izomorf[2]], nodeNums: [izomorf[3], izomorf[4]], fileNames: [leftGraph, rightGraph]});
        else res.render('nem', {izomorf: "Nem izomorf", fileNames: [leftGraph, rightGraph]});
      });
    });
  }
  res.locals.message = req.flash();
});

function isIsomorphic(data){
  let nodeNums1 = data[0].settings.nodeNum;
  let nodeNums2 = data[1].settings.nodeNum;
  if(nodeNums1 != nodeNums2) return false;
  let data1 = data[0].edges;
  let data2 = data[1].edges;
  let nums1 = [];
  let nums2 = [];
  for(var i = 0; i<data1.length; i++){
    nums1.push([parseInt(data1[i].nodeFrom), parseInt(data1[i].nodeTo)]);
    nums2.push([parseInt(data2[i].nodeFrom), parseInt(data2[i].nodeTo)]);
  }
  let numbers1 = [];
  let numbers2 = [];
  for(var i = 1; i <= nodeNums1; i++){
    numbers1.push(getDegree(i, nums1));
    numbers2.push(getDegree(i, nums2));    
  }
  let sorted1 = numbers1.sort();
  let sorted2 = numbers2.sort();
  if(!arraysEqual(sorted1, sorted2)) return false;
  let eredmeny = doMath(nums1, nums2, nodeNums1);
  return [eredmeny[0], eredmeny[1], eredmeny[2], sorted1, sorted2]
}

function doMath(nums1, nums2, nodeNums){
  let A1 = getMatrixUD(nums1, nodeNums);
  let A2 = getMatrixUD(nums2, nodeNums);
  let P = math.eye(parseInt(nodeNums))._data;
  if(arrEqual(A1, A2)){
    return [true, A1, A2];
  } else {
    let isIsom = doLoop(A1, A2, nodeNums, P);
    return [isIsom, A1, A2];
  }
}

function doLoop(matrix1, matrix2, nodeNums, P){
  let cmb = Combinatorics.permutation(P);
  let arr = cmb.toArray();
  console.log(arr);
  for(let i = 0; i < arr.length; i++){
    console.log(((i / arr.length)*100).toFixed(2) + "%");
    if(arrEqual(matrix1, math.multiply(math.multiply(arr[i], matrix2), math.transpose(arr[i])))){
      console.log("100.00%");
      return true;
    }
  }
  console.log("100.00%");
  return false;
}

function getNeighborUD(nodeNums, nums){
  let o = [];
  for(var i = 0; i < nodeNums; i++){
    let arr = [];
    for(var j = 0; j < nums.length; j++){
      if(nums[j][0] == (i+1)){
        arr.push(nums[j][1]);
      }
      if(nums[j][1] == (i+1)){
        arr.push(nums[j][0]);
      }
    }
    o.push(arr.sort());
  }
  return o;
}

function getNeighborD(nodeNums, nums){
  let o = [];
  for(var i = 0; i < nodeNums; i++){
    let arr = [];
    for(var j = 0; j < nums.length; j++){
      if(nums[j][0] == (i+1)){
        arr.push(nums[j][1]);
      }
    }
    o.push(arr.sort());
  }
  return o;
}

function getMatrixD(nums, nodeNums){
  let matrix = [];
  for(var i = 0; i < nodeNums; i++){
    matrix[i] = new Array(parseInt(nodeNums));
    for(var j = 0; j < nodeNums; j++){
      matrix[i][j] = 0;
    }
  }
  for(var i = 0; i < nums.length; i++){
    let origin = nums[i][0]-1;
    let destin = nums[i][1]-1;
    matrix[origin][destin] = 1;
  }
  return matrix;
}

function getMatrixUD(nums, nodeNums){
  let matrix = [];
  for(var i = 0; i < nodeNums; i++){
    matrix[i] = new Array(parseInt(nodeNums));
    for(var j = 0; j < nodeNums; j++){
      matrix[i][j] = 0;
    }
  }
  for(var i = 0; i < nums.length; i++){
    let origin = nums[i][0]-1;
    let destin = nums[i][1]-1;
    matrix[origin][destin] = 1;
    matrix[destin][origin] = 1;
  }
  return matrix;
}

function getDegree(iterate, nums){
  let darab = 0;
  for(var i = 0; i < nums.length; i++){
    if(nums[i][0] == iterate || nums[i][1] == iterate){
      darab++;
    }
  }
  return darab;
}

function arraysEqual(array1, array2){
  if(array1.length !== array2.length) return false;
  for(var i = array1.length; i--;){
    if(array1[i] !== array2[i]) return false;
  }
  return true;
}

function arrEqual(array1, array2){
  if (!Array.isArray(array1) && !Array.isArray(array2)) {
    return array1 === array2;
  }

  if (array1.length !== array2.length) {
    return false;
  }

  for (var i = 0, len = array1.length; i < len; i++) {
    if (!arrEqual(array1[i], array2[i])) {
      return false;
    }
  }

  return true;
}

module.exports = router;
