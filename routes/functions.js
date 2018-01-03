const express = require('express');
const router = express.Router();
const math = require('mathjs');
const Combinatorics = require('js-combinatorics');
const _ = require('lodash');

module.exports = {
    isIsomorphic: function isIsomorphic(data){
        let nodeNums1 = data[0].settings.nodeNum;
        let nodeNums2 = data[1].settings.nodeNum;
        let edgeNums1 = data[0].settings.edgeNum;
        let edgeNums2 = data[1].settings.edgeNum;
        if(nodeNums1 != nodeNums2) return false;
        if(edgeNums1 != edgeNums2) return false;
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
        return [data, eredmeny[0], eredmeny[1], eredmeny[2], sorted1, sorted2]
    }
}

function doMath(nums1, nums2, nodeNums){
    let matrix1 = getMatrixUD(nums1, nodeNums);
    let matrix2 = getMatrixUD(nums2, nodeNums);
    let P = math.eye(parseInt(nodeNums))._data;
    if(arrEqual(matrix1, matrix2)){
        return [true, matrix1, matrix2];
    } else {
        let cmb = Combinatorics.permutation(P);
        let arr = cmb.toArray();
        for(let i = 0; i < arr.length; i++){
            console.log(((i / arr.length)*100).toFixed(2) + "%");
            if(arrEqual(matrix1, math.multiply(math.multiply(arr[i], matrix2), math.transpose(arr[i])))){
                console.log("100.00%");
                return [true, matrix1, matrix2];
            }
        }
        console.log("100.00%");
        return [false, matrix1, matrix2];
    }
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