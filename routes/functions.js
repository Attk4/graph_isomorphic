'use strict';

class GraphMatcher {
    constructor(G1, G2, nodeNums){
        this.G1 = G1;
        this.G2 = G2;
        let nodes = [];
        for(var i = 1; i <= nodeNums; i++){
            nodes[i-1] = i;
        }
        this.G1_nodes = nodes;
        this.G2_nodes = nodes;
        this.initialize();
    }

    initialize(){
        this.core_1 = {};
        this.core_2 = {};
        this.inout_1 = {};
        this.inout_2 = {};
        this.state = new GMState();
        this.mapping = this.core_1.copy();
    }

    candicate_pairs_iter(){
        let G1_nodes = this.G1_nodes;
        let G2_nodes = this.G2_nodes;
        let T1_inout = function () {
            let loop = [];
            for (let node of G1_nodes) {
                if (inContainer(node, self.inout_1) && !inContainer(node, self.core_1)) {
                    loop.append (node);
                }
            }
            return loop;
        } ();
        let T2_inout = function () {
            let loop = [];
            for (let node of G2_nodes) {
                if (inContainer(node, self.inout_2) && !inContainer(node, self.core_2)) {
                    loop.append (node);
                }
            }
            return loop;
        } ()
        if(T1_inout && T2_inout){
            for(let node in T1_inout){
                yield tuple([node, Math.min(T2_inout)]);
            }
        } else if(1){
            let other_node = Math.min(G2_nodes - this.core_2);
            for(let node of this.G1){
                if(!inContainer(node, this.core_1)){
                    yield tuple([node, other_node]);
                }
            }
        }
    }
    match(){
        if(this.core_1.length == this.G2.length){
            this.mapping = this.core_1.copy();
            yield this.mapping;
        } else {
            for(let [G1_node, G2_node] of this.candicate_pairs_iter()){
                if(this.syntactic_feasibility(G1_node, G2_node)){
                    newstate = this.state(G1_node, G2_node);
                    for(let mapping of this.match()){
                        yield mapping;
                    }
                }
            }
        }
    }
}

class GMState {
    constructor(GM){
        this.GM = GM;
        this.G1_node = null;
        this.G2_node = null;
        this.depth = GM.core_1.length;

        if(G1_node == null || G2_node == null){
            GM.core_1 = {};
            GM.core_2 = {};
            GM.inout_1 = {};
            GM.inout_2 = {};
        }
        if(G1_node != null && G2_node != null){
            GM.core_1[G1_node] = G2_node;
            GM.core_2[G2_node] = G1_node;
            this.G1_node = G1_node;
            this.G2_node = G2_node;
            this.depth = GM.core_1.length;
            if(!inContainer(G1_node, GM.inout_1)){
                GM.inout_1[G1_node] = this.depth;
            }
            if(!inContainer(G2_node, GM.inout_2)){
                GM.inout_2[G2_node] = this.depth;
            }
        }
        
        let new_nodes = [];
        for(let node of GM.core_1){
            new_nodes.py_update(function(){
                var loop = [];
                for(var neighbor of GM.G1[node]){
                    if(!inContainer(neighbor,GM.core_1)){
                        loop.push(neighbor);
                    }
                }
                return loop;
            }());
        }
        for(let node of new_nodes){
            if(!inContainer(node, GM.inout_1)){
                GM.inout_1[node] = this.depth;
            }
        }

        let new_nodes = [];
        for(let node of GM.core_2){
            new_nodes.py_update(function(){
                var loop = [];
                for(var neighbor of GM.G2[node]){
                    if(!inContainer(neighbor,GM.core_2)){
                        loop.push(neighbor);
                    }
                }
                return loop;
            }());
        }
        for(let node of new_nodes){
            if(!inContainer(node, GM.inout_2)){
                GM.inout_2[node] = this.depth;
            }
        }
    }
}


/*function tuple (iterable) {
    var instance = iterable ? [] .slice.apply (iterable) : [];
    return instance;
}*/

function copy (anObject) {
    if (anObject == null || typeof anObject == "object") {
        return anObject;
    }
    else {
        var result = {};
        for (var attrib in obj) {
            if (anObject.hasOwnProperty (attrib)) {
                result [attrib] = anObject [attrib];
            }
        }
        return result;
    }
}

function inContainer(element, container) {
    return (
        container.indexOf ?                 // If it has an indexOf
        container.indexOf (element) > -1 :  // it's an array or a string,
        container.hasOwnProperty (element)  // else it's a plain, non-dict JavaScript object
    );
};

Array.prototype.py_update = function () {   // O (n)
    var updated = [] .concat.apply (this.slice (), arguments) .sort ();
    this.py_clear ();
    for (var i = 0; i < updated.length; i++) {
        if (updated [i] != updated [i - 1]) {
            this.push (updated [i]);
        }
    }
};

Array.prototype.py_clear = function () {
    this.length = 0;
};

module.exports.GraphMatcher = GraphMatcher;