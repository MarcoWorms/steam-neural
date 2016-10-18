/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var Layer = _require.Layer;
	var Network = _require.Network;
	var Trainer = _require.Trainer;

	var trainingSet = __webpack_require__(8);

	var inputLayer = new Layer(trainingSet[0].input.length);
	var outputLayer = new Layer(trainingSet[0].output.length);

	inputLayer.project(outputLayer);

	var network = new Network({
	  input: inputLayer,
	  output: outputLayer
	});

	var trainer = new Trainer(network);

	trainer.train(trainingSet, {
	  iterations: 10000,
	  error: .0001
	});

	var test = trainingSet[11];
	var test00 = network.activate(test.input);

	console.log(test.output);
	console.log(test00);
	console.log(test00 == test.output);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var Synaptic = {
	  Neuron: __webpack_require__(2),
	  Layer: __webpack_require__(4),
	  Network: __webpack_require__(5),
	  Trainer: __webpack_require__(6),
	  Architect: __webpack_require__(7)
	};

	// CommonJS & AMD
	if (true) {
	  !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    return Synaptic;
	  }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

	// Node.js
	if (typeof module !== 'undefined' && module.exports) {
	  module.exports = Synaptic;
	}

	// Browser
	if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) == 'object') {
	  (function () {
	    var oldSynaptic = window['synaptic'];
	    Synaptic.ninja = function () {
	      window['synaptic'] = oldSynaptic;
	      return Synaptic;
	    };
	  })();

	  window['synaptic'] = Synaptic;
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	// export
	if (module) module.exports = Neuron;

	/******************************************************************************************
	                                         NEURON
	*******************************************************************************************/

	function Neuron() {
	  this.ID = Neuron.uid();
	  this.label = null;
	  this.connections = {
	    inputs: {},
	    projected: {},
	    gated: {}
	  };
	  this.error = {
	    responsibility: 0,
	    projected: 0,
	    gated: 0
	  };
	  this.trace = {
	    elegibility: {},
	    extended: {},
	    influences: {}
	  };
	  this.state = 0;
	  this.old = 0;
	  this.activation = 0;
	  this.selfconnection = new Neuron.connection(this, this, 0); // weight = 0 -> not connected
	  this.squash = Neuron.squash.LOGISTIC;
	  this.neighboors = {};
	  this.bias = Math.random() * .2 - .1;
	}

	Neuron.prototype = {

	  // activate the neuron
	  activate: function activate(input) {
	    // activation from enviroment (for input neurons)
	    if (typeof input != 'undefined') {
	      this.activation = input;
	      this.derivative = 0;
	      this.bias = 0;
	      return this.activation;
	    }

	    // old state
	    this.old = this.state;

	    // eq. 15
	    this.state = this.selfconnection.gain * this.selfconnection.weight * this.state + this.bias;

	    for (var i in this.connections.inputs) {
	      var input = this.connections.inputs[i];
	      this.state += input.from.activation * input.weight * input.gain;
	    }

	    // eq. 16
	    this.activation = this.squash(this.state);

	    // f'(s)
	    this.derivative = this.squash(this.state, true);

	    // update traces
	    var influences = [];
	    for (var id in this.trace.extended) {
	      // extended elegibility trace
	      var neuron = this.neighboors[id];

	      // if gated neuron's selfconnection is gated by this unit, the influence keeps track of the neuron's old state
	      var influence = neuron.selfconnection.gater == this ? neuron.old : 0;

	      // index runs over all the incoming connections to the gated neuron that are gated by this unit
	      for (var incoming in this.trace.influences[neuron.ID]) {
	        // captures the effect that has an input connection to this unit, on a neuron that is gated by this unit
	        influence += this.trace.influences[neuron.ID][incoming].weight * this.trace.influences[neuron.ID][incoming].from.activation;
	      }
	      influences[neuron.ID] = influence;
	    }

	    for (var i in this.connections.inputs) {
	      var input = this.connections.inputs[i];

	      // elegibility trace - Eq. 17
	      this.trace.elegibility[input.ID] = this.selfconnection.gain * this.selfconnection.weight * this.trace.elegibility[input.ID] + input.gain * input.from.activation;

	      for (var id in this.trace.extended) {
	        // extended elegibility trace
	        var xtrace = this.trace.extended[id];
	        var neuron = this.neighboors[id];
	        var influence = influences[neuron.ID];

	        // eq. 18
	        xtrace[input.ID] = neuron.selfconnection.gain * neuron.selfconnection.weight * xtrace[input.ID] + this.derivative * this.trace.elegibility[input.ID] * influence;
	      }
	    }

	    //  update gated connection's gains
	    for (var connection in this.connections.gated) {
	      this.connections.gated[connection].gain = this.activation;
	    }

	    return this.activation;
	  },

	  // back-propagate the error
	  propagate: function propagate(rate, target) {
	    // error accumulator
	    var error = 0;

	    // whether or not this neuron is in the output layer
	    var isOutput = typeof target != 'undefined';

	    // output neurons get their error from the enviroment
	    if (isOutput) this.error.responsibility = this.error.projected = target - this.activation; // Eq. 10

	    else // the rest of the neuron compute their error responsibilities by backpropagation
	      {
	        // error responsibilities from all the connections projected from this neuron
	        for (var id in this.connections.projected) {
	          var connection = this.connections.projected[id];
	          var neuron = connection.to;
	          // Eq. 21
	          error += neuron.error.responsibility * connection.gain * connection.weight;
	        }

	        // projected error responsibility
	        this.error.projected = this.derivative * error;

	        error = 0;
	        // error responsibilities from all the connections gated by this neuron
	        for (var id in this.trace.extended) {
	          var neuron = this.neighboors[id]; // gated neuron
	          var influence = neuron.selfconnection.gater == this ? neuron.old : 0; // if gated neuron's selfconnection is gated by this neuron

	          // index runs over all the connections to the gated neuron that are gated by this neuron
	          for (var input in this.trace.influences[id]) {
	            // captures the effect that the input connection of this neuron have, on a neuron which its input/s is/are gated by this neuron
	            influence += this.trace.influences[id][input].weight * this.trace.influences[neuron.ID][input].from.activation;
	          }
	          // eq. 22
	          error += neuron.error.responsibility * influence;
	        }

	        // gated error responsibility
	        this.error.gated = this.derivative * error;

	        // error responsibility - Eq. 23
	        this.error.responsibility = this.error.projected + this.error.gated;
	      }

	    // learning rate
	    rate = rate || .1;

	    // adjust all the neuron's incoming connections
	    for (var id in this.connections.inputs) {
	      var input = this.connections.inputs[id];

	      // Eq. 24
	      var gradient = this.error.projected * this.trace.elegibility[input.ID];
	      for (var id in this.trace.extended) {
	        var neuron = this.neighboors[id];
	        gradient += neuron.error.responsibility * this.trace.extended[neuron.ID][input.ID];
	      }
	      input.weight += rate * gradient; // adjust weights - aka learn
	    }

	    // adjust bias
	    this.bias += rate * this.error.responsibility;
	  },

	  project: function project(neuron, weight) {
	    // self-connection
	    if (neuron == this) {
	      this.selfconnection.weight = 1;
	      return this.selfconnection;
	    }

	    // check if connection already exists
	    var connected = this.connected(neuron);
	    if (connected && connected.type == "projected") {
	      // update connection
	      if (typeof weight != 'undefined') connected.connection.weight = weight;
	      // return existing connection
	      return connected.connection;
	    } else {
	      // create a new connection
	      var connection = new Neuron.connection(this, neuron, weight);
	    }

	    // reference all the connections and traces
	    this.connections.projected[connection.ID] = connection;
	    this.neighboors[neuron.ID] = neuron;
	    neuron.connections.inputs[connection.ID] = connection;
	    neuron.trace.elegibility[connection.ID] = 0;

	    for (var id in neuron.trace.extended) {
	      var trace = neuron.trace.extended[id];
	      trace[connection.ID] = 0;
	    }

	    return connection;
	  },

	  gate: function gate(connection) {
	    // add connection to gated list
	    this.connections.gated[connection.ID] = connection;

	    var neuron = connection.to;
	    if (!(neuron.ID in this.trace.extended)) {
	      // extended trace
	      this.neighboors[neuron.ID] = neuron;
	      var xtrace = this.trace.extended[neuron.ID] = {};
	      for (var id in this.connections.inputs) {
	        var input = this.connections.inputs[id];
	        xtrace[input.ID] = 0;
	      }
	    }

	    // keep track
	    if (neuron.ID in this.trace.influences) this.trace.influences[neuron.ID].push(connection);else this.trace.influences[neuron.ID] = [connection];

	    // set gater
	    connection.gater = this;
	  },

	  // returns true or false whether the neuron is self-connected or not
	  selfconnected: function selfconnected() {
	    return this.selfconnection.weight !== 0;
	  },

	  // returns true or false whether the neuron is connected to another neuron (parameter)
	  connected: function connected(neuron) {
	    var result = {
	      type: null,
	      connection: false
	    };

	    if (this == neuron) {
	      if (this.selfconnected()) {
	        result.type = 'selfconnection';
	        result.connection = this.selfconnection;
	        return result;
	      } else return false;
	    }

	    for (var type in this.connections) {
	      for (var connection in this.connections[type]) {
	        var connection = this.connections[type][connection];
	        if (connection.to == neuron) {
	          result.type = type;
	          result.connection = connection;
	          return result;
	        } else if (connection.from == neuron) {
	          result.type = type;
	          result.connection = connection;
	          return result;
	        }
	      }
	    }

	    return false;
	  },

	  // clears all the traces (the neuron forgets it's context, but the connections remain intact)
	  clear: function clear() {

	    for (var trace in this.trace.elegibility) {
	      this.trace.elegibility[trace] = 0;
	    }for (var trace in this.trace.extended) {
	      for (var extended in this.trace.extended[trace]) {
	        this.trace.extended[trace][extended] = 0;
	      }
	    }this.error.responsibility = this.error.projected = this.error.gated = 0;
	  },

	  // all the connections are randomized and the traces are cleared
	  reset: function reset() {
	    this.clear();

	    for (var type in this.connections) {
	      for (var connection in this.connections[type]) {
	        this.connections[type][connection].weight = Math.random() * .2 - .1;
	      }
	    }this.bias = Math.random() * .2 - .1;

	    this.old = this.state = this.activation = 0;
	  },

	  // hardcodes the behaviour of the neuron into an optimized function
	  optimize: function optimize(optimized, layer) {

	    optimized = optimized || {};
	    var store_activation = [];
	    var store_trace = [];
	    var store_propagation = [];
	    var varID = optimized.memory || 0;
	    var neurons = optimized.neurons || 1;
	    var inputs = optimized.inputs || [];
	    var targets = optimized.targets || [];
	    var outputs = optimized.outputs || [];
	    var variables = optimized.variables || {};
	    var activation_sentences = optimized.activation_sentences || [];
	    var trace_sentences = optimized.trace_sentences || [];
	    var propagation_sentences = optimized.propagation_sentences || [];
	    var layers = optimized.layers || { __count: 0, __neuron: 0 };

	    // allocate sentences
	    var allocate = function allocate(store) {
	      var allocated = layer in layers && store[layers.__count];
	      if (!allocated) {
	        layers.__count = store.push([]) - 1;
	        layers[layer] = layers.__count;
	      }
	    };
	    allocate(activation_sentences);
	    allocate(trace_sentences);
	    allocate(propagation_sentences);
	    var currentLayer = layers.__count;

	    // get/reserve space in memory by creating a unique ID for a variablel
	    var getVar = function getVar() {
	      var args = Array.prototype.slice.call(arguments);

	      if (args.length == 1) {
	        if (args[0] == 'target') {
	          var id = 'target_' + targets.length;
	          targets.push(varID);
	        } else var id = args[0];
	        if (id in variables) return variables[id];
	        return variables[id] = {
	          value: 0,
	          id: varID++
	        };
	      } else {
	        var extended = args.length > 2;
	        if (extended) var value = args.pop();

	        var unit = args.shift();
	        var prop = args.pop();

	        if (!extended) var value = unit[prop];

	        var id = prop + '_';
	        for (var property in args) {
	          id += args[property] + '_';
	        }id += unit.ID;
	        if (id in variables) return variables[id];

	        return variables[id] = {
	          value: value,
	          id: varID++
	        };
	      }
	    };

	    // build sentence
	    var buildSentence = function buildSentence() {
	      var args = Array.prototype.slice.call(arguments);
	      var store = args.pop();
	      var sentence = "";
	      for (var i in args) {
	        if (typeof args[i] == 'string') sentence += args[i];else sentence += 'F[' + args[i].id + ']';
	      }store.push(sentence + ';');
	    };

	    // helper to check if an object is empty
	    var isEmpty = function isEmpty(obj) {
	      for (var prop in obj) {
	        if (obj.hasOwnProperty(prop)) return false;
	      }
	      return true;
	    };

	    // characteristics of the neuron
	    var noProjections = isEmpty(this.connections.projected);
	    var noGates = isEmpty(this.connections.gated);
	    var isInput = layer == 'input' ? true : isEmpty(this.connections.inputs);
	    var isOutput = layer == 'output' ? true : noProjections && noGates;

	    // optimize neuron's behaviour
	    var rate = getVar('rate');
	    var activation = getVar(this, 'activation');
	    if (isInput) inputs.push(activation.id);else {
	      activation_sentences[currentLayer].push(store_activation);
	      trace_sentences[currentLayer].push(store_trace);
	      propagation_sentences[currentLayer].push(store_propagation);
	      var old = getVar(this, 'old');
	      var state = getVar(this, 'state');
	      var bias = getVar(this, 'bias');
	      if (this.selfconnection.gater) var self_gain = getVar(this.selfconnection, 'gain');
	      if (this.selfconnected()) var self_weight = getVar(this.selfconnection, 'weight');
	      buildSentence(old, ' = ', state, store_activation);
	      if (this.selfconnected()) {
	        if (this.selfconnection.gater) buildSentence(state, ' = ', self_gain, ' * ', self_weight, ' * ', state, ' + ', bias, store_activation);else buildSentence(state, ' = ', self_weight, ' * ', state, ' + ', bias, store_activation);
	      } else buildSentence(state, ' = ', bias, store_activation);
	      for (var i in this.connections.inputs) {
	        var input = this.connections.inputs[i];
	        var input_activation = getVar(input.from, 'activation');
	        var input_weight = getVar(input, 'weight');
	        if (input.gater) var input_gain = getVar(input, 'gain');
	        if (this.connections.inputs[i].gater) buildSentence(state, ' += ', input_activation, ' * ', input_weight, ' * ', input_gain, store_activation);else buildSentence(state, ' += ', input_activation, ' * ', input_weight, store_activation);
	      }
	      var derivative = getVar(this, 'derivative');
	      switch (this.squash) {
	        case Neuron.squash.LOGISTIC:
	          buildSentence(activation, ' = (1 / (1 + Math.exp(-', state, ')))', store_activation);
	          buildSentence(derivative, ' = ', activation, ' * (1 - ', activation, ')', store_activation);
	          break;
	        case Neuron.squash.TANH:
	          var eP = getVar('aux');
	          var eN = getVar('aux_2');
	          buildSentence(eP, ' = Math.exp(', state, ')', store_activation);
	          buildSentence(eN, ' = 1 / ', eP, store_activation);
	          buildSentence(activation, ' = (', eP, ' - ', eN, ') / (', eP, ' + ', eN, ')', store_activation);
	          buildSentence(derivative, ' = 1 - (', activation, ' * ', activation, ')', store_activation);
	          break;
	        case Neuron.squash.IDENTITY:
	          buildSentence(activation, ' = ', state, store_activation);
	          buildSentence(derivative, ' = 1', store_activation);
	          break;
	        case Neuron.squash.HLIM:
	          buildSentence(activation, ' = +(', state, ' > 0)', store_activation);
	          buildSentence(derivative, ' = 1', store_activation);
	        case Neuron.squash.RELU:
	          buildSentence(activation, ' = ', state, ' > 0 ? ', state, ' : 0', store_activation);
	          buildSentence(derivative, ' = ', state, ' > 0 ? 1 : 0', store_activation);
	          break;
	      }

	      for (var id in this.trace.extended) {
	        // calculate extended elegibility traces in advance

	        var neuron = this.neighboors[id];
	        var influence = getVar('influences[' + neuron.ID + ']');
	        var neuron_old = getVar(neuron, 'old');
	        var initialized = false;
	        if (neuron.selfconnection.gater == this) {
	          buildSentence(influence, ' = ', neuron_old, store_trace);
	          initialized = true;
	        }
	        for (var incoming in this.trace.influences[neuron.ID]) {
	          var incoming_weight = getVar(this.trace.influences[neuron.ID][incoming], 'weight');
	          var incoming_activation = getVar(this.trace.influences[neuron.ID][incoming].from, 'activation');

	          if (initialized) buildSentence(influence, ' += ', incoming_weight, ' * ', incoming_activation, store_trace);else {
	            buildSentence(influence, ' = ', incoming_weight, ' * ', incoming_activation, store_trace);
	            initialized = true;
	          }
	        }
	      }

	      for (var i in this.connections.inputs) {
	        var input = this.connections.inputs[i];
	        if (input.gater) var input_gain = getVar(input, 'gain');
	        var input_activation = getVar(input.from, 'activation');
	        var trace = getVar(this, 'trace', 'elegibility', input.ID, this.trace.elegibility[input.ID]);
	        if (this.selfconnected()) {
	          if (this.selfconnection.gater) {
	            if (input.gater) buildSentence(trace, ' = ', self_gain, ' * ', self_weight, ' * ', trace, ' + ', input_gain, ' * ', input_activation, store_trace);else buildSentence(trace, ' = ', self_gain, ' * ', self_weight, ' * ', trace, ' + ', input_activation, store_trace);
	          } else {
	            if (input.gater) buildSentence(trace, ' = ', self_weight, ' * ', trace, ' + ', input_gain, ' * ', input_activation, store_trace);else buildSentence(trace, ' = ', self_weight, ' * ', trace, ' + ', input_activation, store_trace);
	          }
	        } else {
	          if (input.gater) buildSentence(trace, ' = ', input_gain, ' * ', input_activation, store_trace);else buildSentence(trace, ' = ', input_activation, store_trace);
	        }
	        for (var id in this.trace.extended) {
	          // extended elegibility trace
	          var neuron = this.neighboors[id];
	          var influence = getVar('influences[' + neuron.ID + ']');

	          var trace = getVar(this, 'trace', 'elegibility', input.ID, this.trace.elegibility[input.ID]);
	          var xtrace = getVar(this, 'trace', 'extended', neuron.ID, input.ID, this.trace.extended[neuron.ID][input.ID]);
	          if (neuron.selfconnected()) var neuron_self_weight = getVar(neuron.selfconnection, 'weight');
	          if (neuron.selfconnection.gater) var neuron_self_gain = getVar(neuron.selfconnection, 'gain');
	          if (neuron.selfconnected()) {
	            if (neuron.selfconnection.gater) buildSentence(xtrace, ' = ', neuron_self_gain, ' * ', neuron_self_weight, ' * ', xtrace, ' + ', derivative, ' * ', trace, ' * ', influence, store_trace);else buildSentence(xtrace, ' = ', neuron_self_weight, ' * ', xtrace, ' + ', derivative, ' * ', trace, ' * ', influence, store_trace);
	          } else buildSentence(xtrace, ' = ', derivative, ' * ', trace, ' * ', influence, store_trace);
	        }
	      }
	      for (var connection in this.connections.gated) {
	        var gated_gain = getVar(this.connections.gated[connection], 'gain');
	        buildSentence(gated_gain, ' = ', activation, store_activation);
	      }
	    }
	    if (!isInput) {
	      var responsibility = getVar(this, 'error', 'responsibility', this.error.responsibility);
	      if (isOutput) {
	        var target = getVar('target');
	        buildSentence(responsibility, ' = ', target, ' - ', activation, store_propagation);
	        for (var id in this.connections.inputs) {
	          var input = this.connections.inputs[id];
	          var trace = getVar(this, 'trace', 'elegibility', input.ID, this.trace.elegibility[input.ID]);
	          var input_weight = getVar(input, 'weight');
	          buildSentence(input_weight, ' += ', rate, ' * (', responsibility, ' * ', trace, ')', store_propagation);
	        }
	        outputs.push(activation.id);
	      } else {
	        if (!noProjections && !noGates) {
	          var error = getVar('aux');
	          for (var id in this.connections.projected) {
	            var connection = this.connections.projected[id];
	            var neuron = connection.to;
	            var connection_weight = getVar(connection, 'weight');
	            var neuron_responsibility = getVar(neuron, 'error', 'responsibility', neuron.error.responsibility);
	            if (connection.gater) {
	              var connection_gain = getVar(connection, 'gain');
	              buildSentence(error, ' += ', neuron_responsibility, ' * ', connection_gain, ' * ', connection_weight, store_propagation);
	            } else buildSentence(error, ' += ', neuron_responsibility, ' * ', connection_weight, store_propagation);
	          }
	          var projected = getVar(this, 'error', 'projected', this.error.projected);
	          buildSentence(projected, ' = ', derivative, ' * ', error, store_propagation);
	          buildSentence(error, ' = 0', store_propagation);
	          for (var id in this.trace.extended) {
	            var neuron = this.neighboors[id];
	            var influence = getVar('aux_2');
	            var neuron_old = getVar(neuron, 'old');
	            if (neuron.selfconnection.gater == this) buildSentence(influence, ' = ', neuron_old, store_propagation);else buildSentence(influence, ' = 0', store_propagation);
	            for (var input in this.trace.influences[neuron.ID]) {
	              var connection = this.trace.influences[neuron.ID][input];
	              var connection_weight = getVar(connection, 'weight');
	              var neuron_activation = getVar(connection.from, 'activation');
	              buildSentence(influence, ' += ', connection_weight, ' * ', neuron_activation, store_propagation);
	            }
	            var neuron_responsibility = getVar(neuron, 'error', 'responsibility', neuron.error.responsibility);
	            buildSentence(error, ' += ', neuron_responsibility, ' * ', influence, store_propagation);
	          }
	          var gated = getVar(this, 'error', 'gated', this.error.gated);
	          buildSentence(gated, ' = ', derivative, ' * ', error, store_propagation);
	          buildSentence(responsibility, ' = ', projected, ' + ', gated, store_propagation);
	          for (var id in this.connections.inputs) {
	            var input = this.connections.inputs[id];
	            var gradient = getVar('aux');
	            var trace = getVar(this, 'trace', 'elegibility', input.ID, this.trace.elegibility[input.ID]);
	            buildSentence(gradient, ' = ', projected, ' * ', trace, store_propagation);
	            for (var id in this.trace.extended) {
	              var neuron = this.neighboors[id];
	              var neuron_responsibility = getVar(neuron, 'error', 'responsibility', neuron.error.responsibility);
	              var xtrace = getVar(this, 'trace', 'extended', neuron.ID, input.ID, this.trace.extended[neuron.ID][input.ID]);
	              buildSentence(gradient, ' += ', neuron_responsibility, ' * ', xtrace, store_propagation);
	            }
	            var input_weight = getVar(input, 'weight');
	            buildSentence(input_weight, ' += ', rate, ' * ', gradient, store_propagation);
	          }
	        } else if (noGates) {
	          buildSentence(responsibility, ' = 0', store_propagation);
	          for (var id in this.connections.projected) {
	            var connection = this.connections.projected[id];
	            var neuron = connection.to;
	            var connection_weight = getVar(connection, 'weight');
	            var neuron_responsibility = getVar(neuron, 'error', 'responsibility', neuron.error.responsibility);
	            if (connection.gater) {
	              var connection_gain = getVar(connection, 'gain');
	              buildSentence(responsibility, ' += ', neuron_responsibility, ' * ', connection_gain, ' * ', connection_weight, store_propagation);
	            } else buildSentence(responsibility, ' += ', neuron_responsibility, ' * ', connection_weight, store_propagation);
	          }
	          buildSentence(responsibility, ' *= ', derivative, store_propagation);
	          for (var id in this.connections.inputs) {
	            var input = this.connections.inputs[id];
	            var trace = getVar(this, 'trace', 'elegibility', input.ID, this.trace.elegibility[input.ID]);
	            var input_weight = getVar(input, 'weight');
	            buildSentence(input_weight, ' += ', rate, ' * (', responsibility, ' * ', trace, ')', store_propagation);
	          }
	        } else if (noProjections) {
	          buildSentence(responsibility, ' = 0', store_propagation);
	          for (var id in this.trace.extended) {
	            var neuron = this.neighboors[id];
	            var influence = getVar('aux');
	            var neuron_old = getVar(neuron, 'old');
	            if (neuron.selfconnection.gater == this) buildSentence(influence, ' = ', neuron_old, store_propagation);else buildSentence(influence, ' = 0', store_propagation);
	            for (var input in this.trace.influences[neuron.ID]) {
	              var connection = this.trace.influences[neuron.ID][input];
	              var connection_weight = getVar(connection, 'weight');
	              var neuron_activation = getVar(connection.from, 'activation');
	              buildSentence(influence, ' += ', connection_weight, ' * ', neuron_activation, store_propagation);
	            }
	            var neuron_responsibility = getVar(neuron, 'error', 'responsibility', neuron.error.responsibility);
	            buildSentence(responsibility, ' += ', neuron_responsibility, ' * ', influence, store_propagation);
	          }
	          buildSentence(responsibility, ' *= ', derivative, store_propagation);
	          for (var id in this.connections.inputs) {
	            var input = this.connections.inputs[id];
	            var gradient = getVar('aux');
	            buildSentence(gradient, ' = 0', store_propagation);
	            for (var id in this.trace.extended) {
	              var neuron = this.neighboors[id];
	              var neuron_responsibility = getVar(neuron, 'error', 'responsibility', neuron.error.responsibility);
	              var xtrace = getVar(this, 'trace', 'extended', neuron.ID, input.ID, this.trace.extended[neuron.ID][input.ID]);
	              buildSentence(gradient, ' += ', neuron_responsibility, ' * ', xtrace, store_propagation);
	            }
	            var input_weight = getVar(input, 'weight');
	            buildSentence(input_weight, ' += ', rate, ' * ', gradient, store_propagation);
	          }
	        }
	      }
	      buildSentence(bias, ' += ', rate, ' * ', responsibility, store_propagation);
	    }
	    return {
	      memory: varID,
	      neurons: neurons + 1,
	      inputs: inputs,
	      outputs: outputs,
	      targets: targets,
	      variables: variables,
	      activation_sentences: activation_sentences,
	      trace_sentences: trace_sentences,
	      propagation_sentences: propagation_sentences,
	      layers: layers
	    };
	  }
	};

	// represents a connection between two neurons
	Neuron.connection = function Connection(from, to, weight) {

	  if (!from || !to) throw new Error("Connection Error: Invalid neurons");

	  this.ID = Neuron.connection.uid();
	  this.from = from;
	  this.to = to;
	  this.weight = typeof weight == 'undefined' ? Math.random() * .2 - .1 : weight;
	  this.gain = 1;
	  this.gater = null;
	};

	// squashing functions
	Neuron.squash = {};

	// eq. 5 & 5'
	Neuron.squash.LOGISTIC = function (x, derivate) {
	  if (!derivate) return 1 / (1 + Math.exp(-x));
	  var fx = Neuron.squash.LOGISTIC(x);
	  return fx * (1 - fx);
	};
	Neuron.squash.TANH = function (x, derivate) {
	  if (derivate) return 1 - Math.pow(Neuron.squash.TANH(x), 2);
	  var eP = Math.exp(x);
	  var eN = 1 / eP;
	  return (eP - eN) / (eP + eN);
	};
	Neuron.squash.IDENTITY = function (x, derivate) {
	  return derivate ? 1 : x;
	};
	Neuron.squash.HLIM = function (x, derivate) {
	  return derivate ? 1 : x > 0 ? 1 : 0;
	};
	Neuron.squash.RELU = function (x, derivate) {
	  if (derivate) return x > 0 ? 1 : 0;
	  return x > 0 ? x : 0;
	};

	// unique ID's
	(function () {
	  var neurons = 0;
	  var connections = 0;
	  Neuron.uid = function () {
	    return neurons++;
	  };
	  Neuron.connection.uid = function () {
	    return connections++;
	  };
	  Neuron.quantity = function () {
	    return {
	      neurons: neurons,
	      connections: connections
	    };
	  };
	})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)(module)))

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	// export
	if (module) module.exports = Layer;

	// import
	var Neuron = __webpack_require__(2),
	    Network = __webpack_require__(5);

	/*******************************************************************************************
	                                            LAYER
	*******************************************************************************************/

	function Layer(size, label) {
	  this.size = size | 0;
	  this.list = [];
	  this.label = label || null;
	  this.connectedTo = [];

	  while (size--) {
	    var neuron = new Neuron();
	    this.list.push(neuron);
	  }
	}

	Layer.prototype = {

	  // activates all the neurons in the layer
	  activate: function activate(input) {

	    var activations = [];

	    if (typeof input != 'undefined') {
	      if (input.length != this.size) throw new Error("INPUT size and LAYER size must be the same to activate!");

	      for (var id in this.list) {
	        var neuron = this.list[id];
	        var activation = neuron.activate(input[id]);
	        activations.push(activation);
	      }
	    } else {
	      for (var id in this.list) {
	        var neuron = this.list[id];
	        var activation = neuron.activate();
	        activations.push(activation);
	      }
	    }
	    return activations;
	  },

	  // propagates the error on all the neurons of the layer
	  propagate: function propagate(rate, target) {

	    if (typeof target != 'undefined') {
	      if (target.length != this.size) throw new Error("TARGET size and LAYER size must be the same to propagate!");

	      for (var id = this.list.length - 1; id >= 0; id--) {
	        var neuron = this.list[id];
	        neuron.propagate(rate, target[id]);
	      }
	    } else {
	      for (var id = this.list.length - 1; id >= 0; id--) {
	        var neuron = this.list[id];
	        neuron.propagate(rate);
	      }
	    }
	  },

	  // projects a connection from this layer to another one
	  project: function project(layer, type, weights) {

	    if (layer instanceof Network) layer = layer.layers.input;

	    if (layer instanceof Layer) {
	      if (!this.connected(layer)) return new Layer.connection(this, layer, type, weights);
	    } else throw new Error("Invalid argument, you can only project connections to LAYERS and NETWORKS!");
	  },

	  // gates a connection betwenn two layers
	  gate: function gate(connection, type) {

	    if (type == Layer.gateType.INPUT) {
	      if (connection.to.size != this.size) throw new Error("GATER layer and CONNECTION.TO layer must be the same size in order to gate!");

	      for (var id in connection.to.list) {
	        var neuron = connection.to.list[id];
	        var gater = this.list[id];
	        for (var input in neuron.connections.inputs) {
	          var gated = neuron.connections.inputs[input];
	          if (gated.ID in connection.connections) gater.gate(gated);
	        }
	      }
	    } else if (type == Layer.gateType.OUTPUT) {
	      if (connection.from.size != this.size) throw new Error("GATER layer and CONNECTION.FROM layer must be the same size in order to gate!");

	      for (var id in connection.from.list) {
	        var neuron = connection.from.list[id];
	        var gater = this.list[id];
	        for (var projected in neuron.connections.projected) {
	          var gated = neuron.connections.projected[projected];
	          if (gated.ID in connection.connections) gater.gate(gated);
	        }
	      }
	    } else if (type == Layer.gateType.ONE_TO_ONE) {
	      if (connection.size != this.size) throw new Error("The number of GATER UNITS must be the same as the number of CONNECTIONS to gate!");

	      for (var id in connection.list) {
	        var gater = this.list[id];
	        var gated = connection.list[id];
	        gater.gate(gated);
	      }
	    }
	    connection.gatedfrom.push({ layer: this, type: type });
	  },

	  // true or false whether the whole layer is self-connected or not
	  selfconnected: function selfconnected() {

	    for (var id in this.list) {
	      var neuron = this.list[id];
	      if (!neuron.selfconnected()) return false;
	    }
	    return true;
	  },

	  // true of false whether the layer is connected to another layer (parameter) or not
	  connected: function connected(layer) {
	    // Check if ALL to ALL connection
	    var connections = 0;
	    for (var here in this.list) {
	      for (var there in layer.list) {
	        var from = this.list[here];
	        var to = layer.list[there];
	        var connected = from.connected(to);
	        if (connected.type == 'projected') connections++;
	      }
	    }
	    if (connections == this.size * layer.size) return Layer.connectionType.ALL_TO_ALL;

	    // Check if ONE to ONE connection
	    connections = 0;
	    for (var neuron in this.list) {
	      var from = this.list[neuron];
	      var to = layer.list[neuron];
	      var connected = from.connected(to);
	      if (connected.type == 'projected') connections++;
	    }
	    if (connections == this.size) return Layer.connectionType.ONE_TO_ONE;
	  },

	  // clears all the neuorns in the layer
	  clear: function clear() {
	    for (var id in this.list) {
	      var neuron = this.list[id];
	      neuron.clear();
	    }
	  },

	  // resets all the neurons in the layer
	  reset: function reset() {
	    for (var id in this.list) {
	      var neuron = this.list[id];
	      neuron.reset();
	    }
	  },

	  // returns all the neurons in the layer (array)
	  neurons: function neurons() {
	    return this.list;
	  },

	  // adds a neuron to the layer
	  add: function add(neuron) {
	    this.neurons[neuron.ID] = neuron || new Neuron();
	    this.list.push(neuron);
	    this.size++;
	  },

	  set: function set(options) {
	    options = options || {};

	    for (var i in this.list) {
	      var neuron = this.list[i];
	      if (options.label) neuron.label = options.label + '_' + neuron.ID;
	      if (options.squash) neuron.squash = options.squash;
	      if (options.bias) neuron.bias = options.bias;
	    }
	    return this;
	  }
	};

	// represents a connection from one layer to another, and keeps track of its weight and gain
	Layer.connection = function LayerConnection(fromLayer, toLayer, type, weights) {
	  this.ID = Layer.connection.uid();
	  this.from = fromLayer;
	  this.to = toLayer;
	  this.selfconnection = toLayer == fromLayer;
	  this.type = type;
	  this.connections = {};
	  this.list = [];
	  this.size = 0;
	  this.gatedfrom = [];

	  if (typeof this.type == 'undefined') {
	    if (fromLayer == toLayer) this.type = Layer.connectionType.ONE_TO_ONE;else this.type = Layer.connectionType.ALL_TO_ALL;
	  }

	  if (this.type == Layer.connectionType.ALL_TO_ALL || this.type == Layer.connectionType.ALL_TO_ELSE) {
	    for (var here in this.from.list) {
	      for (var there in this.to.list) {
	        var from = this.from.list[here];
	        var to = this.to.list[there];
	        if (this.type == Layer.connectionType.ALL_TO_ELSE && from == to) continue;
	        var connection = from.project(to, weights);

	        this.connections[connection.ID] = connection;
	        this.size = this.list.push(connection);
	      }
	    }
	  } else if (this.type == Layer.connectionType.ONE_TO_ONE) {

	    for (var neuron in this.from.list) {
	      var from = this.from.list[neuron];
	      var to = this.to.list[neuron];
	      var connection = from.project(to, weights);

	      this.connections[connection.ID] = connection;
	      this.size = this.list.push(connection);
	    }
	  }

	  fromLayer.connectedTo.push(this);
	};

	// types of connections
	Layer.connectionType = {};
	Layer.connectionType.ALL_TO_ALL = "ALL TO ALL";
	Layer.connectionType.ONE_TO_ONE = "ONE TO ONE";
	Layer.connectionType.ALL_TO_ELSE = "ALL TO ELSE";

	// types of gates
	Layer.gateType = {};
	Layer.gateType.INPUT = "INPUT";
	Layer.gateType.OUTPUT = "OUTPUT";
	Layer.gateType.ONE_TO_ONE = "ONE TO ONE";

	(function () {
	  var connections = 0;
	  Layer.connection.uid = function () {
	    return connections++;
	  };
	})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)(module)))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	// export
	if (module) module.exports = Network;

	// import
	var Neuron = __webpack_require__(2),
	    Layer = __webpack_require__(4),
	    Trainer = __webpack_require__(6);

	/*******************************************************************************************
	                                         NETWORK
	*******************************************************************************************/

	function Network(layers) {
	  if (typeof layers != 'undefined') {
	    this.layers = layers || {
	      input: null,
	      hidden: {},
	      output: null
	    };
	    this.optimized = null;
	  }
	}
	Network.prototype = {

	  // feed-forward activation of all the layers to produce an ouput
	  activate: function activate(input) {

	    if (this.optimized === false) {
	      this.layers.input.activate(input);
	      for (var layer in this.layers.hidden) {
	        this.layers.hidden[layer].activate();
	      }return this.layers.output.activate();
	    } else {
	      if (this.optimized == null) this.optimize();
	      return this.optimized.activate(input);
	    }
	  },

	  // back-propagate the error thru the network
	  propagate: function propagate(rate, target) {

	    if (this.optimized === false) {
	      this.layers.output.propagate(rate, target);
	      var reverse = [];
	      for (var layer in this.layers.hidden) {
	        reverse.push(this.layers.hidden[layer]);
	      }reverse.reverse();
	      for (var layer in reverse) {
	        reverse[layer].propagate(rate);
	      }
	    } else {
	      if (this.optimized == null) this.optimize();
	      this.optimized.propagate(rate, target);
	    }
	  },

	  // project a connection to another unit (either a network or a layer)
	  project: function project(unit, type, weights) {

	    if (this.optimized) this.optimized.reset();

	    if (unit instanceof Network) return this.layers.output.project(unit.layers.input, type, weights);

	    if (unit instanceof Layer) return this.layers.output.project(unit, type, weights);

	    throw new Error("Invalid argument, you can only project connections to LAYERS and NETWORKS!");
	  },

	  // let this network gate a connection
	  gate: function gate(connection, type) {
	    if (this.optimized) this.optimized.reset();
	    this.layers.output.gate(connection, type);
	  },

	  // clear all elegibility traces and extended elegibility traces (the network forgets its context, but not what was trained)
	  clear: function clear() {

	    this.restore();

	    var inputLayer = this.layers.input,
	        outputLayer = this.layers.output;

	    inputLayer.clear();
	    for (var layer in this.layers.hidden) {
	      var hiddenLayer = this.layers.hidden[layer];
	      hiddenLayer.clear();
	    }
	    outputLayer.clear();

	    if (this.optimized) this.optimized.reset();
	  },

	  // reset all weights and clear all traces (ends up like a new network)
	  reset: function reset() {

	    this.restore();

	    var inputLayer = this.layers.input,
	        outputLayer = this.layers.output;

	    inputLayer.reset();
	    for (var layer in this.layers.hidden) {
	      var hiddenLayer = this.layers.hidden[layer];
	      hiddenLayer.reset();
	    }
	    outputLayer.reset();

	    if (this.optimized) this.optimized.reset();
	  },

	  // hardcodes the behaviour of the whole network into a single optimized function
	  optimize: function optimize() {

	    var that = this;
	    var optimized = {};
	    var neurons = this.neurons();

	    for (var i in neurons) {
	      var neuron = neurons[i].neuron;
	      var layer = neurons[i].layer;
	      while (neuron.neuron) {
	        neuron = neuron.neuron;
	      }optimized = neuron.optimize(optimized, layer);
	    }
	    for (var i in optimized.propagation_sentences) {
	      optimized.propagation_sentences[i].reverse();
	    }optimized.propagation_sentences.reverse();

	    var hardcode = "";
	    hardcode += "var F = Float64Array ? new Float64Array(" + optimized.memory + ") : []; ";
	    for (var i in optimized.variables) {
	      hardcode += "F[" + optimized.variables[i].id + "] = " + (optimized.variables[i].value || 0) + "; ";
	    }hardcode += "var activate = function(input){\n";
	    for (var i in optimized.inputs) {
	      hardcode += "F[" + optimized.inputs[i] + "] = input[" + i + "]; ";
	    }for (var currentLayer in optimized.activation_sentences) {
	      if (optimized.activation_sentences[currentLayer].length > 0) {
	        for (var currentNeuron in optimized.activation_sentences[currentLayer]) {
	          hardcode += optimized.activation_sentences[currentLayer][currentNeuron].join(" ");
	          hardcode += optimized.trace_sentences[currentLayer][currentNeuron].join(" ");
	        }
	      }
	    }
	    hardcode += " var output = []; ";
	    for (var i in optimized.outputs) {
	      hardcode += "output[" + i + "] = F[" + optimized.outputs[i] + "]; ";
	    }hardcode += "return output; }; ";
	    hardcode += "var propagate = function(rate, target){\n";
	    hardcode += "F[" + optimized.variables.rate.id + "] = rate; ";
	    for (var i in optimized.targets) {
	      hardcode += "F[" + optimized.targets[i] + "] = target[" + i + "]; ";
	    }for (var currentLayer in optimized.propagation_sentences) {
	      for (var currentNeuron in optimized.propagation_sentences[currentLayer]) {
	        hardcode += optimized.propagation_sentences[currentLayer][currentNeuron].join(" ") + " ";
	      }
	    }hardcode += " };\n";
	    hardcode += "var ownership = function(memoryBuffer){\nF = memoryBuffer;\nthis.memory = F;\n};\n";
	    hardcode += "return {\nmemory: F,\nactivate: activate,\npropagate: propagate,\nownership: ownership\n};";
	    hardcode = hardcode.split(";").join(";\n");

	    var constructor = new Function(hardcode);

	    var network = constructor();
	    network.data = {
	      variables: optimized.variables,
	      activate: optimized.activation_sentences,
	      propagate: optimized.propagation_sentences,
	      trace: optimized.trace_sentences,
	      inputs: optimized.inputs,
	      outputs: optimized.outputs,
	      check_activation: this.activate,
	      check_propagation: this.propagate
	    };

	    network.reset = function () {
	      if (that.optimized) {
	        that.optimized = null;
	        that.activate = network.data.check_activation;
	        that.propagate = network.data.check_propagation;
	      }
	    };

	    this.optimized = network;
	    this.activate = network.activate;
	    this.propagate = network.propagate;
	  },

	  // restores all the values from the optimized network the their respective objects in order to manipulate the network
	  restore: function restore() {
	    if (!this.optimized) return;

	    var optimized = this.optimized;

	    var getValue = function getValue() {
	      var args = Array.prototype.slice.call(arguments);

	      var unit = args.shift();
	      var prop = args.pop();

	      var id = prop + '_';
	      for (var property in args) {
	        id += args[property] + '_';
	      }id += unit.ID;

	      var memory = optimized.memory;
	      var variables = optimized.data.variables;

	      if (id in variables) return memory[variables[id].id];
	      return 0;
	    };

	    var list = this.neurons();

	    // link id's to positions in the array
	    var ids = {};
	    for (var i in list) {
	      var neuron = list[i].neuron;
	      while (neuron.neuron) {
	        neuron = neuron.neuron;
	      }neuron.state = getValue(neuron, 'state');
	      neuron.old = getValue(neuron, 'old');
	      neuron.activation = getValue(neuron, 'activation');
	      neuron.bias = getValue(neuron, 'bias');

	      for (var input in neuron.trace.elegibility) {
	        neuron.trace.elegibility[input] = getValue(neuron, 'trace', 'elegibility', input);
	      }for (var gated in neuron.trace.extended) {
	        for (var input in neuron.trace.extended[gated]) {
	          neuron.trace.extended[gated][input] = getValue(neuron, 'trace', 'extended', gated, input);
	        }
	      }
	    }

	    // get connections
	    for (var i in list) {
	      var neuron = list[i].neuron;
	      while (neuron.neuron) {
	        neuron = neuron.neuron;
	      }for (var j in neuron.connections.projected) {
	        var connection = neuron.connections.projected[j];
	        connection.weight = getValue(connection, 'weight');
	        connection.gain = getValue(connection, 'gain');
	      }
	    }
	  },

	  // returns all the neurons in the network
	  neurons: function neurons() {

	    var neurons = [];

	    var inputLayer = this.layers.input.neurons(),
	        outputLayer = this.layers.output.neurons();

	    for (var neuron in inputLayer) {
	      neurons.push({
	        neuron: inputLayer[neuron],
	        layer: 'input'
	      });
	    }for (var layer in this.layers.hidden) {
	      var hiddenLayer = this.layers.hidden[layer].neurons();
	      for (var neuron in hiddenLayer) {
	        neurons.push({
	          neuron: hiddenLayer[neuron],
	          layer: layer
	        });
	      }
	    }
	    for (var neuron in outputLayer) {
	      neurons.push({
	        neuron: outputLayer[neuron],
	        layer: 'output'
	      });
	    }return neurons;
	  },

	  // returns number of inputs of the network
	  inputs: function inputs() {
	    return this.layers.input.size;
	  },

	  // returns number of outputs of hte network
	  outputs: function outputs() {
	    return this.layers.output.size;
	  },

	  // sets the layers of the network
	  set: function set(layers) {

	    this.layers = layers;
	    if (this.optimized) this.optimized.reset();
	  },

	  setOptimize: function setOptimize(bool) {
	    this.restore();
	    if (this.optimized) this.optimized.reset();
	    this.optimized = bool ? null : false;
	  },

	  // returns a json that represents all the neurons and connections of the network
	  toJSON: function toJSON(ignoreTraces) {

	    this.restore();

	    var list = this.neurons();
	    var neurons = [];
	    var connections = [];

	    // link id's to positions in the array
	    var ids = {};
	    for (var i in list) {
	      var neuron = list[i].neuron;
	      while (neuron.neuron) {
	        neuron = neuron.neuron;
	      }ids[neuron.ID] = i;

	      var copy = {
	        trace: {
	          elegibility: {},
	          extended: {}
	        },
	        state: neuron.state,
	        old: neuron.old,
	        activation: neuron.activation,
	        bias: neuron.bias,
	        layer: list[i].layer
	      };

	      copy.squash = neuron.squash == Neuron.squash.LOGISTIC ? "LOGISTIC" : neuron.squash == Neuron.squash.TANH ? "TANH" : neuron.squash == Neuron.squash.IDENTITY ? "IDENTITY" : neuron.squash == Neuron.squash.HLIM ? "HLIM" : null;

	      neurons.push(copy);
	    }

	    // get connections
	    for (var i in list) {
	      var neuron = list[i].neuron;
	      while (neuron.neuron) {
	        neuron = neuron.neuron;
	      }for (var j in neuron.connections.projected) {
	        var connection = neuron.connections.projected[j];
	        connections.push({
	          from: ids[connection.from.ID],
	          to: ids[connection.to.ID],
	          weight: connection.weight,
	          gater: connection.gater ? ids[connection.gater.ID] : null
	        });
	      }
	      if (neuron.selfconnected()) connections.push({
	        from: ids[neuron.ID],
	        to: ids[neuron.ID],
	        weight: neuron.selfconnection.weight,
	        gater: neuron.selfconnection.gater ? ids[neuron.selfconnection.gater.ID] : null
	      });
	    }

	    return {
	      neurons: neurons,
	      connections: connections
	    };
	  },

	  // export the topology into dot language which can be visualized as graphs using dot
	  /* example: ... console.log(net.toDotLang());
	              $ node example.js > example.dot
	              $ dot example.dot -Tpng > out.png
	  */
	  toDot: function toDot(edgeConnection) {
	    if (!(typeof edgeConnection === 'undefined' ? 'undefined' : _typeof(edgeConnection))) edgeConnection = false;
	    var code = "digraph nn {\n    rankdir = BT\n";
	    var layers = [this.layers.input].concat(this.layers.hidden, this.layers.output);
	    for (var layer in layers) {
	      for (var to in layers[layer].connectedTo) {
	        // projections
	        var connection = layers[layer].connectedTo[to];
	        var layerTo = connection.to;
	        var size = connection.size;
	        var layerID = layers.indexOf(layers[layer]);
	        var layerToID = layers.indexOf(layerTo);
	        /* http://stackoverflow.com/questions/26845540/connect-edges-with-graph-dot
	         * DOT does not support edge-to-edge connections
	         * This workaround produces somewhat weird graphs ...
	        */
	        if (edgeConnection) {
	          if (connection.gatedfrom.length) {
	            var fakeNode = "fake" + layerID + "_" + layerToID;
	            code += "    " + fakeNode + " [label = \"\", shape = point, width = 0.01, height = 0.01]\n";
	            code += "    " + layerID + " -> " + fakeNode + " [label = " + size + ", arrowhead = none]\n";
	            code += "    " + fakeNode + " -> " + layerToID + "\n";
	          } else code += "    " + layerID + " -> " + layerToID + " [label = " + size + "]\n";
	          for (var from in connection.gatedfrom) {
	            // gatings
	            var layerfrom = connection.gatedfrom[from].layer;
	            var layerfromID = layers.indexOf(layerfrom);
	            code += "    " + layerfromID + " -> " + fakeNode + " [color = blue]\n";
	          }
	        } else {
	          code += "    " + layerID + " -> " + layerToID + " [label = " + size + "]\n";
	          for (var from in connection.gatedfrom) {
	            // gatings
	            var layerfrom = connection.gatedfrom[from].layer;
	            var layerfromID = layers.indexOf(layerfrom);
	            code += "    " + layerfromID + " -> " + layerToID + " [color = blue]\n";
	          }
	        }
	      }
	    }
	    code += "}\n";
	    return {
	      code: code,
	      link: "https://chart.googleapis.com/chart?chl=" + escape(code.replace("/ /g", "+")) + "&cht=gv"
	    };
	  },

	  // returns a function that works as the activation of the network and can be used without depending on the library
	  standalone: function standalone() {
	    if (!this.optimized) this.optimize();

	    var data = this.optimized.data;

	    // build activation function
	    var activation = "function (input) {\n";

	    // build inputs
	    for (var i in data.inputs) {
	      activation += "F[" + data.inputs[i] + "] = input[" + i + "];\n";
	    } // build network activation
	    for (var neuron in data.activate) {
	      // shouldn't this be layer?
	      for (var sentence in data.activate[neuron]) {
	        activation += data.activate[neuron][sentence].join('') + "\n";
	      }
	    }

	    // build outputs
	    activation += "var output = [];\n";
	    for (var i in data.outputs) {
	      activation += "output[" + i + "] = F[" + data.outputs[i] + "];\n";
	    }activation += "return output;\n}";

	    // reference all the positions in memory
	    var memory = activation.match(/F\[(\d+)\]/g);
	    var dimension = 0;
	    var ids = {};
	    for (var address in memory) {
	      var tmp = memory[address].match(/\d+/)[0];
	      if (!(tmp in ids)) {
	        ids[tmp] = dimension++;
	      }
	    }
	    var hardcode = "F = {\n";
	    for (var i in ids) {
	      hardcode += ids[i] + ": " + this.optimized.memory[i] + ",\n";
	    }hardcode = hardcode.substring(0, hardcode.length - 2) + "\n};\n";
	    hardcode = "var run = " + activation.replace(/F\[(\d+)]/g, function (index) {
	      return 'F[' + ids[index.match(/\d+/)[0]] + ']';
	    }).replace("{\n", "{\n" + hardcode + "") + ";\n";
	    hardcode += "return run";

	    // return standalone function
	    return new Function(hardcode)();
	  },

	  // Return a HTML5 WebWorker specialized on training the network stored in `memory`.
	  // Train based on the given dataSet and options.
	  // The worker returns the updated `memory` when done.
	  worker: function worker(memory, set, options) {

	    // Copy the options and set defaults (options might be different for each worker)
	    var workerOptions = {};
	    if (options) workerOptions = options;
	    workerOptions.rate = options.rate || .2;
	    workerOptions.iterations = options.iterations || 100000;
	    workerOptions.error = options.error || .005;
	    workerOptions.cost = options.cost || null;
	    workerOptions.crossValidate = options.crossValidate || null;

	    // Cost function might be different for each worker
	    costFunction = "var cost = " + (options && options.cost || this.cost || Trainer.cost.MSE) + ";\n";
	    var workerFunction = Network.getWorkerSharedFunctions();
	    workerFunction = workerFunction.replace(/var cost = options && options\.cost \|\| this\.cost \|\| Trainer\.cost\.MSE;/g, costFunction);

	    // Set what we do when training is finished
	    workerFunction = workerFunction.replace('return results;', 'postMessage({action: "done", message: results, memoryBuffer: F}, [F.buffer]);');

	    // Replace log with postmessage
	    workerFunction = workerFunction.replace("console.log('iterations', iterations, 'error', error, 'rate', currentRate)", "postMessage({action: 'log', message: {\n" + "iterations: iterations,\n" + "error: error,\n" + "rate: currentRate\n" + "}\n" + "})");

	    // Replace schedule with postmessage
	    workerFunction = workerFunction.replace("abort = this.schedule.do({ error: error, iterations: iterations, rate: currentRate })", "postMessage({action: 'schedule', message: {\n" + "iterations: iterations,\n" + "error: error,\n" + "rate: currentRate\n" + "}\n" + "})");

	    if (!this.optimized) this.optimize();

	    var hardcode = "var inputs = " + this.optimized.data.inputs.length + ";\n";
	    hardcode += "var outputs = " + this.optimized.data.outputs.length + ";\n";
	    hardcode += "var F =  new Float64Array([" + this.optimized.memory.toString() + "]);\n";
	    hardcode += "var activate = " + this.optimized.activate.toString() + ";\n";
	    hardcode += "var propagate = " + this.optimized.propagate.toString() + ";\n";
	    hardcode += "onmessage = function(e) {\n" + "if (e.data.action == 'startTraining') {\n" + "train(" + JSON.stringify(set) + "," + JSON.stringify(workerOptions) + ");\n" + "}\n" + "}";

	    var workerSourceCode = workerFunction + '\n' + hardcode;
	    var blob = new Blob([workerSourceCode]);
	    var blobURL = window.URL.createObjectURL(blob);

	    return new Worker(blobURL);
	  },

	  // returns a copy of the network
	  clone: function clone() {
	    return Network.fromJSON(this.toJSON());
	  }
	};

	/**
	 * Creates a static String to store the source code of the functions
	 *  that are identical for all the workers (train, _trainSet, test)
	 *
	 * @return {String} Source code that can train a network inside a worker.
	 * @static
	 */
	Network.getWorkerSharedFunctions = function () {
	  // If we already computed the source code for the shared functions
	  if (typeof Network._SHARED_WORKER_FUNCTIONS !== 'undefined') return Network._SHARED_WORKER_FUNCTIONS;

	  // Otherwise compute and return the source code
	  // We compute them by simply copying the source code of the train, _trainSet and test functions
	  //  using the .toString() method

	  // Load and name the train function
	  var train_f = Trainer.prototype.train.toString();
	  train_f = train_f.replace('function (set', 'function train(set') + '\n';

	  // Load and name the _trainSet function
	  var _trainSet_f = Trainer.prototype._trainSet.toString().replace(/this.network./g, '');
	  _trainSet_f = _trainSet_f.replace('function (set', 'function _trainSet(set') + '\n';
	  _trainSet_f = _trainSet_f.replace('this.crossValidate', 'crossValidate');
	  _trainSet_f = _trainSet_f.replace('crossValidate = true', 'crossValidate = { }');

	  // Load and name the test function
	  var test_f = Trainer.prototype.test.toString().replace(/this.network./g, '');
	  test_f = test_f.replace('function (set', 'function test(set') + '\n';

	  return Network._SHARED_WORKER_FUNCTIONS = train_f + _trainSet_f + test_f;
	};

	// rebuild a network that has been stored in a json using the method toJSON()
	Network.fromJSON = function (json) {

	  var neurons = [];

	  var layers = {
	    input: new Layer(),
	    hidden: [],
	    output: new Layer()
	  };

	  for (var i in json.neurons) {
	    var config = json.neurons[i];

	    var neuron = new Neuron();
	    neuron.trace.elegibility = {};
	    neuron.trace.extended = {};
	    neuron.state = config.state;
	    neuron.old = config.old;
	    neuron.activation = config.activation;
	    neuron.bias = config.bias;
	    neuron.squash = config.squash in Neuron.squash ? Neuron.squash[config.squash] : Neuron.squash.LOGISTIC;
	    neurons.push(neuron);

	    if (config.layer == 'input') layers.input.add(neuron);else if (config.layer == 'output') layers.output.add(neuron);else {
	      if (typeof layers.hidden[config.layer] == 'undefined') layers.hidden[config.layer] = new Layer();
	      layers.hidden[config.layer].add(neuron);
	    }
	  }

	  for (var i in json.connections) {
	    var config = json.connections[i];
	    var from = neurons[config.from];
	    var to = neurons[config.to];
	    var weight = config.weight;
	    var gater = neurons[config.gater];

	    var connection = from.project(to, weight);
	    if (gater) gater.gate(connection);
	  }

	  return new Network(layers);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)(module)))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	// export
	if (module) module.exports = Trainer;

	/*******************************************************************************************
	                                        TRAINER
	*******************************************************************************************/

	function Trainer(network, options) {
	  options = options || {};
	  this.network = network;
	  this.rate = options.rate || .2;
	  this.iterations = options.iterations || 100000;
	  this.error = options.error || .005;
	  this.cost = options.cost || null;
	  this.crossValidate = options.crossValidate || null;
	}

	Trainer.prototype = {

	  // trains any given set to a network
	  train: function train(set, options) {

	    var error = 1;
	    var iterations = bucketSize = 0;
	    var abort = false;
	    var currentRate;
	    var cost = options && options.cost || this.cost || Trainer.cost.MSE;
	    var crossValidate = false,
	        testSet,
	        trainSet;

	    var start = Date.now();

	    if (options) {
	      if (options.shuffle) {
	        //+ Jonas Raoni Soares Silva
	        //@ http://jsfromhell.com/array/shuffle [v1.0]
	        var _shuffle = function _shuffle(o) {
	          //v1.0
	          for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {}
	          return o;
	        };

	        ;
	      }
	      if (options.iterations) this.iterations = options.iterations;
	      if (options.error) this.error = options.error;
	      if (options.rate) this.rate = options.rate;
	      if (options.cost) this.cost = options.cost;
	      if (options.schedule) this.schedule = options.schedule;
	      if (options.customLog) {
	        // for backward compatibility with code that used customLog
	        console.log('Deprecated: use schedule instead of customLog');
	        this.schedule = options.customLog;
	      }
	      if (this.crossValidate || options.crossValidate) {
	        if (!this.crossValidate) this.crossValidate = {};
	        crossValidate = true;
	        if (options.crossValidate.testSize) this.crossValidate.testSize = options.crossValidate.testSize;
	        if (options.crossValidate.testError) this.crossValidate.testError = options.crossValidate.testError;
	      }
	    }

	    currentRate = this.rate;
	    if (Array.isArray(this.rate)) {
	      var bucketSize = Math.floor(this.iterations / this.rate.length);
	    }

	    if (crossValidate) {
	      var numTrain = Math.ceil((1 - this.crossValidate.testSize) * set.length);
	      trainSet = set.slice(0, numTrain);
	      testSet = set.slice(numTrain);
	    }

	    while (!abort && iterations < this.iterations && error > this.error) {
	      if (crossValidate && error <= this.crossValidate.testError) {
	        break;
	      }

	      var currentSetSize = set.length;
	      error = 0;
	      iterations++;

	      if (bucketSize > 0) {
	        var currentBucket = Math.floor(iterations / bucketSize);
	        currentRate = this.rate[currentBucket] || currentRate;
	      }

	      if (typeof this.rate === 'function') {
	        currentRate = this.rate(iterations, error);
	      }

	      if (crossValidate) {
	        this._trainSet(trainSet, currentRate, cost);
	        error += this.test(testSet).error;
	        currentSetSize = 1;
	      } else {
	        error += this._trainSet(set, currentRate, cost);
	        currentSetSize = set.length;
	      }

	      // check error
	      error /= currentSetSize;

	      if (options) {
	        if (this.schedule && this.schedule.every && iterations % this.schedule.every == 0) abort = this.schedule.do({ error: error, iterations: iterations, rate: currentRate });else if (options.log && iterations % options.log == 0) {
	          console.log('iterations', iterations, 'error', error, 'rate', currentRate);
	        };
	        if (options.shuffle) shuffle(set);
	      }
	    }

	    var results = {
	      error: error,
	      iterations: iterations,
	      time: Date.now() - start
	    };

	    return results;
	  },

	  // trains any given set to a network, using a WebWorker (only for the browser). Returns a Promise of the results.
	  trainAsync: function trainAsync(set, options) {
	    var train = this.workerTrain.bind(this);
	    return new Promise(function (resolve, reject) {
	      try {
	        train(set, resolve, options, true);
	      } catch (e) {
	        reject(e);
	      }
	    });
	  },

	  // preforms one training epoch and returns the error (private function used in this.train)
	  _trainSet: function _trainSet(set, currentRate, costFunction) {
	    var errorSum = 0;
	    for (var train in set) {
	      var input = set[train].input;
	      var target = set[train].output;

	      var output = this.network.activate(input);
	      this.network.propagate(currentRate, target);

	      errorSum += costFunction(target, output);
	    }
	    return errorSum;
	  },

	  // tests a set and returns the error and elapsed time
	  test: function test(set, options) {

	    var error = 0;
	    var input, output, target;
	    var cost = options && options.cost || this.cost || Trainer.cost.MSE;

	    var start = Date.now();

	    for (var test in set) {
	      input = set[test].input;
	      target = set[test].output;
	      output = this.network.activate(input);
	      error += cost(target, output);
	    }

	    error /= set.length;

	    var results = {
	      error: error,
	      time: Date.now() - start
	    };

	    return results;
	  },

	  // trains any given set to a network using a WebWorker [deprecated: use trainAsync instead]
	  workerTrain: function workerTrain(set, callback, options, suppressWarning) {

	    if (!suppressWarning) {
	      console.warn('Deprecated: do not use `workerTrain`, use `trainAsync` instead.');
	    }
	    var that = this;

	    if (!this.network.optimized) this.network.optimize();

	    // Create a new worker
	    var worker = this.network.worker(this.network.optimized.memory, set, options);

	    // train the worker
	    worker.onmessage = function (e) {
	      switch (e.data.action) {
	        case 'done':
	          var iterations = e.data.message.iterations;
	          var error = e.data.message.error;
	          var time = e.data.message.time;

	          that.network.optimized.ownership(e.data.memoryBuffer);

	          // Done callback
	          callback({
	            error: error,
	            iterations: iterations,
	            time: time
	          });

	          // Delete the worker and all its associated memory
	          worker.terminate();
	          break;

	        case 'log':
	          console.log(e.data.message);

	        case 'schedule':
	          if (options && options.schedule && typeof options.schedule.do === 'function') {
	            var scheduled = options.schedule.do;
	            scheduled(e.data.message);
	          }
	          break;
	      }
	    };

	    // Start the worker
	    worker.postMessage({ action: 'startTraining' });
	  },

	  // trains an XOR to the network
	  XOR: function XOR(options) {

	    if (this.network.inputs() != 2 || this.network.outputs() != 1) throw new Error("Incompatible network (2 inputs, 1 output)");

	    var defaults = {
	      iterations: 100000,
	      log: false,
	      shuffle: true,
	      cost: Trainer.cost.MSE
	    };

	    if (options) for (var i in options) {
	      defaults[i] = options[i];
	    }return this.train([{
	      input: [0, 0],
	      output: [0]
	    }, {
	      input: [1, 0],
	      output: [1]
	    }, {
	      input: [0, 1],
	      output: [1]
	    }, {
	      input: [1, 1],
	      output: [0]
	    }], defaults);
	  },

	  // trains the network to pass a Distracted Sequence Recall test
	  DSR: function DSR(options) {
	    options = options || {};

	    var targets = options.targets || [2, 4, 7, 8];
	    var distractors = options.distractors || [3, 5, 6, 9];
	    var prompts = options.prompts || [0, 1];
	    var length = options.length || 24;
	    var criterion = options.success || 0.95;
	    var iterations = options.iterations || 100000;
	    var rate = options.rate || .1;
	    var log = options.log || 0;
	    var schedule = options.schedule || {};
	    var cost = options.cost || this.cost || Trainer.cost.CROSS_ENTROPY;

	    var trial, correct, i, j, success;
	    trial = correct = i = j = success = 0;
	    var error = 1,
	        symbols = targets.length + distractors.length + prompts.length;

	    var noRepeat = function noRepeat(range, avoid) {
	      var number = Math.random() * range | 0;
	      var used = false;
	      for (var i in avoid) {
	        if (number == avoid[i]) used = true;
	      }return used ? noRepeat(range, avoid) : number;
	    };

	    var equal = function equal(prediction, output) {
	      for (var i in prediction) {
	        if (Math.round(prediction[i]) != output[i]) return false;
	      }return true;
	    };

	    var start = Date.now();

	    while (trial < iterations && (success < criterion || trial % 1000 != 0)) {
	      // generate sequence
	      var sequence = [],
	          sequenceLength = length - prompts.length;
	      for (i = 0; i < sequenceLength; i++) {
	        var any = Math.random() * distractors.length | 0;
	        sequence.push(distractors[any]);
	      }
	      var indexes = [],
	          positions = [];
	      for (i = 0; i < prompts.length; i++) {
	        indexes.push(Math.random() * targets.length | 0);
	        positions.push(noRepeat(sequenceLength, positions));
	      }
	      positions = positions.sort();
	      for (i = 0; i < prompts.length; i++) {
	        sequence[positions[i]] = targets[indexes[i]];
	        sequence.push(prompts[i]);
	      }

	      //train sequence
	      var distractorsCorrect;
	      var targetsCorrect = distractorsCorrect = 0;
	      error = 0;
	      for (i = 0; i < length; i++) {
	        // generate input from sequence
	        var input = [];
	        for (j = 0; j < symbols; j++) {
	          input[j] = 0;
	        }input[sequence[i]] = 1;

	        // generate target output
	        var output = [];
	        for (j = 0; j < targets.length; j++) {
	          output[j] = 0;
	        }if (i >= sequenceLength) {
	          var index = i - sequenceLength;
	          output[indexes[index]] = 1;
	        }

	        // check result
	        var prediction = this.network.activate(input);

	        if (equal(prediction, output)) {
	          if (i < sequenceLength) distractorsCorrect++;else targetsCorrect++;
	        } else {
	          this.network.propagate(rate, output);
	        }

	        error += cost(output, prediction);

	        if (distractorsCorrect + targetsCorrect == length) correct++;
	      }

	      // calculate error
	      if (trial % 1000 == 0) correct = 0;
	      trial++;
	      var divideError = trial % 1000;
	      divideError = divideError == 0 ? 1000 : divideError;
	      success = correct / divideError;
	      error /= length;

	      // log
	      if (log && trial % log == 0) console.log("iterations:", trial, " success:", success, " correct:", correct, " time:", Date.now() - start, " error:", error);
	      if (schedule.do && schedule.every && trial % schedule.every == 0) schedule.do({
	        iterations: trial,
	        success: success,
	        error: error,
	        time: Date.now() - start,
	        correct: correct
	      });
	    }

	    return {
	      iterations: trial,
	      success: success,
	      error: error,
	      time: Date.now() - start
	    };
	  },

	  // train the network to learn an Embeded Reber Grammar
	  ERG: function ERG(options) {

	    options = options || {};
	    var iterations = options.iterations || 150000;
	    var criterion = options.error || .05;
	    var rate = options.rate || .1;
	    var log = options.log || 500;
	    var cost = options.cost || this.cost || Trainer.cost.CROSS_ENTROPY;

	    // gramar node
	    var Node = function Node() {
	      this.paths = [];
	    };
	    Node.prototype = {
	      connect: function connect(node, value) {
	        this.paths.push({
	          node: node,
	          value: value
	        });
	        return this;
	      },
	      any: function any() {
	        if (this.paths.length == 0) return false;
	        var index = Math.random() * this.paths.length | 0;
	        return this.paths[index];
	      },
	      test: function test(value) {
	        for (var i in this.paths) {
	          if (this.paths[i].value == value) return this.paths[i];
	        }return false;
	      }
	    };

	    var reberGrammar = function reberGrammar() {

	      // build a reber grammar
	      var output = new Node();
	      var n1 = new Node().connect(output, "E");
	      var n2 = new Node().connect(n1, "S");
	      var n3 = new Node().connect(n1, "V").connect(n2, "P");
	      var n4 = new Node().connect(n2, "X");
	      n4.connect(n4, "S");
	      var n5 = new Node().connect(n3, "V");
	      n5.connect(n5, "T");
	      n2.connect(n5, "X");
	      var n6 = new Node().connect(n4, "T").connect(n5, "P");
	      var input = new Node().connect(n6, "B");

	      return {
	        input: input,
	        output: output
	      };
	    };

	    // build an embeded reber grammar
	    var embededReberGrammar = function embededReberGrammar() {
	      var reber1 = reberGrammar();
	      var reber2 = reberGrammar();

	      var output = new Node();
	      var n1 = new Node().connect(output, "E");
	      reber1.output.connect(n1, "T");
	      reber2.output.connect(n1, "P");
	      var n2 = new Node().connect(reber1.input, "P").connect(reber2.input, "T");
	      var input = new Node().connect(n2, "B");

	      return {
	        input: input,
	        output: output
	      };
	    };

	    // generate an ERG sequence
	    var generate = function generate() {
	      var node = embededReberGrammar().input;
	      var next = node.any();
	      var str = "";
	      while (next) {
	        str += next.value;
	        next = next.node.any();
	      }
	      return str;
	    };

	    // test if a string matches an embeded reber grammar
	    var test = function test(str) {
	      var node = embededReberGrammar().input;
	      var i = 0;
	      var ch = str.charAt(i);
	      while (i < str.length) {
	        var next = node.test(ch);
	        if (!next) return false;
	        node = next.node;
	        ch = str.charAt(++i);
	      }
	      return true;
	    };

	    // helper to check if the output and the target vectors match
	    var different = function different(array1, array2) {
	      var max1 = 0;
	      var i1 = -1;
	      var max2 = 0;
	      var i2 = -1;
	      for (var i in array1) {
	        if (array1[i] > max1) {
	          max1 = array1[i];
	          i1 = i;
	        }
	        if (array2[i] > max2) {
	          max2 = array2[i];
	          i2 = i;
	        }
	      }

	      return i1 != i2;
	    };

	    var iteration = 0;
	    var error = 1;
	    var table = {
	      "B": 0,
	      "P": 1,
	      "T": 2,
	      "X": 3,
	      "S": 4,
	      "E": 5
	    };

	    var start = Date.now();
	    while (iteration < iterations && error > criterion) {
	      var i = 0;
	      error = 0;

	      // ERG sequence to learn
	      var sequence = generate();

	      // input
	      var read = sequence.charAt(i);
	      // target
	      var predict = sequence.charAt(i + 1);

	      // train
	      while (i < sequence.length - 1) {
	        var input = [];
	        var target = [];
	        for (var j = 0; j < 6; j++) {
	          input[j] = 0;
	          target[j] = 0;
	        }
	        input[table[read]] = 1;
	        target[table[predict]] = 1;

	        var output = this.network.activate(input);

	        if (different(output, target)) this.network.propagate(rate, target);

	        read = sequence.charAt(++i);
	        predict = sequence.charAt(i + 1);

	        error += cost(target, output);
	      }
	      error /= sequence.length;
	      iteration++;
	      if (iteration % log == 0) {
	        console.log("iterations:", iteration, " time:", Date.now() - start, " error:", error);
	      }
	    }

	    return {
	      iterations: iteration,
	      error: error,
	      time: Date.now() - start,
	      test: test,
	      generate: generate
	    };
	  },

	  timingTask: function timingTask(options) {

	    if (this.network.inputs() != 2 || this.network.outputs() != 1) throw new Error("Invalid Network: must have 2 inputs and one output");

	    if (typeof options == 'undefined') options = {};

	    // helper
	    function getSamples(trainingSize, testSize) {

	      // sample size
	      var size = trainingSize + testSize;

	      // generate samples
	      var t = 0;
	      var set = [];
	      for (var i = 0; i < size; i++) {
	        set.push({ input: [0, 0], output: [0] });
	      }
	      while (t < size - 20) {
	        var n = Math.round(Math.random() * 20);
	        set[t].input[0] = 1;
	        for (var j = t; j <= t + n; j++) {
	          set[j].input[1] = n / 20;
	          set[j].output[0] = 0.5;
	        }
	        t += n;
	        n = Math.round(Math.random() * 20);
	        for (var k = t + 1; k <= t + n && k < size; k++) {
	          set[k].input[1] = set[t].input[1];
	        }t += n;
	      }

	      // separate samples between train and test sets
	      var trainingSet = [];var testSet = [];
	      for (var l = 0; l < size; l++) {
	        (l < trainingSize ? trainingSet : testSet).push(set[l]);
	      } // return samples
	      return {
	        train: trainingSet,
	        test: testSet
	      };
	    }

	    var iterations = options.iterations || 200;
	    var error = options.error || .005;
	    var rate = options.rate || [.03, .02];
	    var log = options.log === false ? false : options.log || 10;
	    var cost = options.cost || this.cost || Trainer.cost.MSE;
	    var trainingSamples = options.trainSamples || 7000;
	    var testSamples = options.trainSamples || 1000;

	    // samples for training and testing
	    var samples = getSamples(trainingSamples, testSamples);

	    // train
	    var result = this.train(samples.train, {
	      rate: rate,
	      log: log,
	      iterations: iterations,
	      error: error,
	      cost: cost
	    });

	    return {
	      train: result,
	      test: this.test(samples.test)
	    };
	  }
	};

	// Built-in cost functions
	Trainer.cost = {
	  // Eq. 9
	  CROSS_ENTROPY: function CROSS_ENTROPY(target, output) {
	    var crossentropy = 0;
	    for (var i in output) {
	      crossentropy -= target[i] * Math.log(output[i] + 1e-15) + (1 - target[i]) * Math.log(1 + 1e-15 - output[i]);
	    } // +1e-15 is a tiny push away to avoid Math.log(0)
	    return crossentropy;
	  },
	  MSE: function MSE(target, output) {
	    var mse = 0;
	    for (var i in output) {
	      mse += Math.pow(target[i] - output[i], 2);
	    }return mse / output.length;
	  },
	  BINARY: function BINARY(target, output) {
	    var misses = 0;
	    for (var i in output) {
	      misses += Math.round(target[i] * 2) != Math.round(output[i] * 2);
	    }return misses;
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)(module)))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	// import
	var Layer = __webpack_require__(4),
	    Network = __webpack_require__(5),
	    Trainer = __webpack_require__(6);

	/*******************************************************************************************
	                                        ARCHITECT
	*******************************************************************************************/

	// Collection of useful built-in architectures
	var Architect = {

	  // Multilayer Perceptron
	  Perceptron: function Perceptron() {

	    var args = Array.prototype.slice.call(arguments); // convert arguments to Array
	    if (args.length < 3) throw new Error("not enough layers (minimum 3) !!");

	    var inputs = args.shift(); // first argument
	    var outputs = args.pop(); // last argument
	    var layers = args; // all the arguments in the middle

	    var input = new Layer(inputs);
	    var hidden = [];
	    var output = new Layer(outputs);

	    var previous = input;

	    // generate hidden layers
	    for (var level in layers) {
	      var size = layers[level];
	      var layer = new Layer(size);
	      hidden.push(layer);
	      previous.project(layer);
	      previous = layer;
	    }
	    previous.project(output);

	    // set layers of the neural network
	    this.set({
	      input: input,
	      hidden: hidden,
	      output: output
	    });

	    // trainer for the network
	    this.trainer = new Trainer(this);
	  },

	  // Multilayer Long Short-Term Memory
	  LSTM: function LSTM() {

	    var args = Array.prototype.slice.call(arguments); // convert arguments to array
	    if (args.length < 3) throw new Error("not enough layers (minimum 3) !!");

	    var last = args.pop();
	    var option = {
	      peepholes: Layer.connectionType.ALL_TO_ALL,
	      hiddenToHidden: false,
	      outputToHidden: false,
	      outputToGates: false,
	      inputToOutput: true
	    };
	    if (typeof last != 'number') {
	      var outputs = args.pop();
	      if (last.hasOwnProperty('peepholes')) option.peepholes = last.peepholes;
	      if (last.hasOwnProperty('hiddenToHidden')) option.hiddenToHidden = last.hiddenToHidden;
	      if (last.hasOwnProperty('outputToHidden')) option.outputToHidden = last.outputToHidden;
	      if (last.hasOwnProperty('outputToGates')) option.outputToGates = last.outputToGates;
	      if (last.hasOwnProperty('inputToOutput')) option.inputToOutput = last.inputToOutput;
	    } else var outputs = last;

	    var inputs = args.shift();
	    var layers = args;

	    var inputLayer = new Layer(inputs);
	    var hiddenLayers = [];
	    var outputLayer = new Layer(outputs);

	    var previous = null;

	    // generate layers
	    for (var layer in layers) {
	      // generate memory blocks (memory cell and respective gates)
	      var size = layers[layer];

	      var inputGate = new Layer(size).set({
	        bias: 1
	      });
	      var forgetGate = new Layer(size).set({
	        bias: 1
	      });
	      var memoryCell = new Layer(size);
	      var outputGate = new Layer(size).set({
	        bias: 1
	      });

	      hiddenLayers.push(inputGate);
	      hiddenLayers.push(forgetGate);
	      hiddenLayers.push(memoryCell);
	      hiddenLayers.push(outputGate);

	      // connections from input layer
	      var input = inputLayer.project(memoryCell);
	      inputLayer.project(inputGate);
	      inputLayer.project(forgetGate);
	      inputLayer.project(outputGate);

	      // connections from previous memory-block layer to this one
	      if (previous != null) {
	        var cell = previous.project(memoryCell);
	        previous.project(inputGate);
	        previous.project(forgetGate);
	        previous.project(outputGate);
	      }

	      // connections from memory cell
	      var output = memoryCell.project(outputLayer);

	      // self-connection
	      var self = memoryCell.project(memoryCell);

	      // hidden to hidden recurrent connection
	      if (option.hiddenToHidden) memoryCell.project(memoryCell, Layer.connectionType.ALL_TO_ELSE);

	      // out to hidden recurrent connection
	      if (option.outputToHidden) outputLayer.project(memoryCell);

	      // out to gates recurrent connection
	      if (option.outputToGates) {
	        outputLayer.project(inputGate);
	        outputLayer.project(outputGate);
	        outputLayer.project(forgetGate);
	      }

	      // peepholes
	      memoryCell.project(inputGate, option.peepholes);
	      memoryCell.project(forgetGate, option.peepholes);
	      memoryCell.project(outputGate, option.peepholes);

	      // gates
	      inputGate.gate(input, Layer.gateType.INPUT);
	      forgetGate.gate(self, Layer.gateType.ONE_TO_ONE);
	      outputGate.gate(output, Layer.gateType.OUTPUT);
	      if (previous != null) inputGate.gate(cell, Layer.gateType.INPUT);

	      previous = memoryCell;
	    }

	    // input to output direct connection
	    if (option.inputToOutput) inputLayer.project(outputLayer);

	    // set the layers of the neural network
	    this.set({
	      input: inputLayer,
	      hidden: hiddenLayers,
	      output: outputLayer
	    });

	    // trainer
	    this.trainer = new Trainer(this);
	  },

	  // Liquid State Machine
	  Liquid: function Liquid(inputs, hidden, outputs, connections, gates) {

	    // create layers
	    var inputLayer = new Layer(inputs);
	    var hiddenLayer = new Layer(hidden);
	    var outputLayer = new Layer(outputs);

	    // make connections and gates randomly among the neurons
	    var neurons = hiddenLayer.neurons();
	    var connectionList = [];

	    for (var i = 0; i < connections; i++) {
	      // connect two random neurons
	      var from = Math.random() * neurons.length | 0;
	      var to = Math.random() * neurons.length | 0;
	      var connection = neurons[from].project(neurons[to]);
	      connectionList.push(connection);
	    }

	    for (var j = 0; j < gates; j++) {
	      // pick a random gater neuron
	      var gater = Math.random() * neurons.length | 0;
	      // pick a random connection to gate
	      var connection = Math.random() * connectionList.length | 0;
	      // let the gater gate the connection
	      neurons[gater].gate(connectionList[connection]);
	    }

	    // connect the layers
	    inputLayer.project(hiddenLayer);
	    hiddenLayer.project(outputLayer);

	    // set the layers of the network
	    this.set({
	      input: inputLayer,
	      hidden: [hiddenLayer],
	      output: outputLayer
	    });

	    // trainer
	    this.trainer = new Trainer(this);
	  },

	  Hopfield: function Hopfield(size) {

	    var inputLayer = new Layer(size);
	    var outputLayer = new Layer(size);

	    inputLayer.project(outputLayer, Layer.connectionType.ALL_TO_ALL);

	    this.set({
	      input: inputLayer,
	      hidden: [],
	      output: outputLayer
	    });

	    var trainer = new Trainer(this);

	    var proto = Architect.Hopfield.prototype;

	    proto.learn = proto.learn || function (patterns) {
	      var set = [];
	      for (var p in patterns) {
	        set.push({
	          input: patterns[p],
	          output: patterns[p]
	        });
	      }return trainer.train(set, {
	        iterations: 500000,
	        error: .00005,
	        rate: 1
	      });
	    };

	    proto.feed = proto.feed || function (pattern) {
	      var output = this.activate(pattern);

	      var pattern = [];
	      for (var i in output) {
	        pattern[i] = output[i] > .5 ? 1 : 0;
	      }return pattern;
	    };
	  }
	};

	// Extend prototype chain (so every architectures is an instance of Network)
	for (var architecture in Architect) {
	  Architect[architecture].prototype = new Network();
	  Architect[architecture].prototype.constructor = Architect[architecture];
	}

	// export
	if (module) module.exports = Architect;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)(module)))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(9);

	var contains = _require.contains;


	var tags = __webpack_require__(10);
	var games = __webpack_require__(11);

	var dataset = games.map(function (game) {
	  var output = [game.score_rank / 100];
	  var input = tags.map(function (tag) {
	    return game.tags.indexOf(tag) >= 0 ? 1 : 0;
	  });

	  return { input: input, output: output };
	});

	module.exports = dataset;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};//  Ramda v0.22.1
	//  https://github.com/ramda/ramda
	//  (c) 2013-2016 Scott Sauyet, Michael Hurley, and David Chambers
	//  Ramda may be freely distributed under the MIT license.
	;(function(){'use strict';/**
	     * A special placeholder value used to specify "gaps" within curried functions,
	     * allowing partial application of any combination of arguments, regardless of
	     * their positions.
	     *
	     * If `g` is a curried ternary function and `_` is `R.__`, the following are
	     * equivalent:
	     *
	     *   - `g(1, 2, 3)`
	     *   - `g(_, 2, 3)(1)`
	     *   - `g(_, _, 3)(1)(2)`
	     *   - `g(_, _, 3)(1, 2)`
	     *   - `g(_, 2, _)(1, 3)`
	     *   - `g(_, 2)(1)(3)`
	     *   - `g(_, 2)(1, 3)`
	     *   - `g(_, 2)(_, 3)(1)`
	     *
	     * @constant
	     * @memberOf R
	     * @since v0.6.0
	     * @category Function
	     * @example
	     *
	     *      var greet = R.replace('{name}', R.__, 'Hello, {name}!');
	     *      greet('Alice'); //=> 'Hello, Alice!'
	     */var __={'@@functional/placeholder':true};/* eslint-disable no-unused-vars */var _arity=function _arity(n,fn){/* eslint-disable no-unused-vars */switch(n){case 0:return function(){return fn.apply(this,arguments);};case 1:return function(a0){return fn.apply(this,arguments);};case 2:return function(a0,a1){return fn.apply(this,arguments);};case 3:return function(a0,a1,a2){return fn.apply(this,arguments);};case 4:return function(a0,a1,a2,a3){return fn.apply(this,arguments);};case 5:return function(a0,a1,a2,a3,a4){return fn.apply(this,arguments);};case 6:return function(a0,a1,a2,a3,a4,a5){return fn.apply(this,arguments);};case 7:return function(a0,a1,a2,a3,a4,a5,a6){return fn.apply(this,arguments);};case 8:return function(a0,a1,a2,a3,a4,a5,a6,a7){return fn.apply(this,arguments);};case 9:return function(a0,a1,a2,a3,a4,a5,a6,a7,a8){return fn.apply(this,arguments);};case 10:return function(a0,a1,a2,a3,a4,a5,a6,a7,a8,a9){return fn.apply(this,arguments);};default:throw new Error('First argument to _arity must be a non-negative integer no greater than ten');}};var _arrayFromIterator=function _arrayFromIterator(iter){var list=[];var next;while(!(next=iter.next()).done){list.push(next.value);}return list;};var _arrayOf=function _arrayOf(){return Array.prototype.slice.call(arguments);};var _cloneRegExp=function _cloneRegExp(pattern){return new RegExp(pattern.source,(pattern.global?'g':'')+(pattern.ignoreCase?'i':'')+(pattern.multiline?'m':'')+(pattern.sticky?'y':'')+(pattern.unicode?'u':''));};var _complement=function _complement(f){return function(){return!f.apply(this,arguments);};};/**
	     * Private `concat` function to merge two array-like objects.
	     *
	     * @private
	     * @param {Array|Arguments} [set1=[]] An array-like object.
	     * @param {Array|Arguments} [set2=[]] An array-like object.
	     * @return {Array} A new, merged array.
	     * @example
	     *
	     *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
	     */var _concat=function _concat(set1,set2){set1=set1||[];set2=set2||[];var idx;var len1=set1.length;var len2=set2.length;var result=[];idx=0;while(idx<len1){result[result.length]=set1[idx];idx+=1;}idx=0;while(idx<len2){result[result.length]=set2[idx];idx+=1;}return result;};var _containsWith=function _containsWith(pred,x,list){var idx=0;var len=list.length;while(idx<len){if(pred(x,list[idx])){return true;}idx+=1;}return false;};var _filter=function _filter(fn,list){var idx=0;var len=list.length;var result=[];while(idx<len){if(fn(list[idx])){result[result.length]=list[idx];}idx+=1;}return result;};var _forceReduced=function _forceReduced(x){return{'@@transducer/value':x,'@@transducer/reduced':true};};// String(x => x) evaluates to "x => x", so the pattern may not match.
	var _functionName=function _functionName(f){// String(x => x) evaluates to "x => x", so the pattern may not match.
	var match=String(f).match(/^function (\w*)/);return match==null?'':match[1];};var _has=function _has(prop,obj){return Object.prototype.hasOwnProperty.call(obj,prop);};var _identity=function _identity(x){return x;};var _isArguments=function(){var toString=Object.prototype.toString;return toString.call(arguments)==='[object Arguments]'?function _isArguments(x){return toString.call(x)==='[object Arguments]';}:function _isArguments(x){return _has('callee',x);};}();/**
	     * Tests whether or not an object is an array.
	     *
	     * @private
	     * @param {*} val The object to test.
	     * @return {Boolean} `true` if `val` is an array, `false` otherwise.
	     * @example
	     *
	     *      _isArray([]); //=> true
	     *      _isArray(null); //=> false
	     *      _isArray({}); //=> false
	     */var _isArray=Array.isArray||function _isArray(val){return val!=null&&val.length>=0&&Object.prototype.toString.call(val)==='[object Array]';};var _isFunction=function _isFunction(x){return Object.prototype.toString.call(x)==='[object Function]';};/**
	     * Determine if the passed argument is an integer.
	     *
	     * @private
	     * @param {*} n
	     * @category Type
	     * @return {Boolean}
	     */var _isInteger=Number.isInteger||function _isInteger(n){return n<<0===n;};var _isNumber=function _isNumber(x){return Object.prototype.toString.call(x)==='[object Number]';};var _isObject=function _isObject(x){return Object.prototype.toString.call(x)==='[object Object]';};var _isPlaceholder=function _isPlaceholder(a){return a!=null&&(typeof a==='undefined'?'undefined':_typeof(a))==='object'&&a['@@functional/placeholder']===true;};var _isRegExp=function _isRegExp(x){return Object.prototype.toString.call(x)==='[object RegExp]';};var _isString=function _isString(x){return Object.prototype.toString.call(x)==='[object String]';};var _isTransformer=function _isTransformer(obj){return typeof obj['@@transducer/step']==='function';};var _map=function _map(fn,functor){var idx=0;var len=functor.length;var result=Array(len);while(idx<len){result[idx]=fn(functor[idx]);idx+=1;}return result;};// Based on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	var _objectAssign=function _objectAssign(target){if(target==null){throw new TypeError('Cannot convert undefined or null to object');}var output=Object(target);var idx=1;var length=arguments.length;while(idx<length){var source=arguments[idx];if(source!=null){for(var nextKey in source){if(_has(nextKey,source)){output[nextKey]=source[nextKey];}}}idx+=1;}return output;};var _of=function _of(x){return[x];};var _pipe=function _pipe(f,g){return function(){return g.call(this,f.apply(this,arguments));};};var _pipeP=function _pipeP(f,g){return function(){var ctx=this;return f.apply(ctx,arguments).then(function(x){return g.call(ctx,x);});};};// \b matches word boundary; [\b] matches backspace
	var _quote=function _quote(s){var escaped=s.replace(/\\/g,'\\\\').replace(/[\b]/g,'\\b')// \b matches word boundary; [\b] matches backspace
	.replace(/\f/g,'\\f').replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t').replace(/\v/g,'\\v').replace(/\0/g,'\\0');return'"'+escaped.replace(/"/g,'\\"')+'"';};var _reduced=function _reduced(x){return x&&x['@@transducer/reduced']?x:{'@@transducer/value':x,'@@transducer/reduced':true};};/**
	     * An optimized, private array `slice` implementation.
	     *
	     * @private
	     * @param {Arguments|Array} args The array or arguments object to consider.
	     * @param {Number} [from=0] The array index to slice from, inclusive.
	     * @param {Number} [to=args.length] The array index to slice to, exclusive.
	     * @return {Array} A new, sliced array.
	     * @example
	     *
	     *      _slice([1, 2, 3, 4, 5], 1, 3); //=> [2, 3]
	     *
	     *      var firstThreeArgs = function(a, b, c, d) {
	     *        return _slice(arguments, 0, 3);
	     *      };
	     *      firstThreeArgs(1, 2, 3, 4); //=> [1, 2, 3]
	     */var _slice=function _slice(args,from,to){switch(arguments.length){case 1:return _slice(args,0,args.length);case 2:return _slice(args,from,args.length);default:var list=[];var idx=0;var len=Math.max(0,Math.min(args.length,to)-from);while(idx<len){list[idx]=args[from+idx];idx+=1;}return list;}};/**
	     * Polyfill from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString>.
	     */var _toISOString=function(){var pad=function pad(n){return(n<10?'0':'')+n;};return typeof Date.prototype.toISOString==='function'?function _toISOString(d){return d.toISOString();}:function _toISOString(d){return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds())+'.'+(d.getUTCMilliseconds()/1000).toFixed(3).slice(2,5)+'Z';};}();var _xfBase={init:function init(){return this.xf['@@transducer/init']();},result:function result(_result){return this.xf['@@transducer/result'](_result);}};var _xwrap=function(){function XWrap(fn){this.f=fn;}XWrap.prototype['@@transducer/init']=function(){throw new Error('init not implemented on XWrap');};XWrap.prototype['@@transducer/result']=function(acc){return acc;};XWrap.prototype['@@transducer/step']=function(acc,x){return this.f(acc,x);};return function _xwrap(fn){return new XWrap(fn);};}();var _aperture=function _aperture(n,list){var idx=0;var limit=list.length-(n-1);var acc=new Array(limit>=0?limit:0);while(idx<limit){acc[idx]=_slice(list,idx,idx+n);idx+=1;}return acc;};var _assign=typeof Object.assign==='function'?Object.assign:_objectAssign;/**
	     * Similar to hasMethod, this checks whether a function has a [methodname]
	     * function. If it isn't an array it will execute that function otherwise it
	     * will default to the ramda implementation.
	     *
	     * @private
	     * @param {Function} fn ramda implemtation
	     * @param {String} methodname property to check for a custom implementation
	     * @return {Object} Whatever the return value of the method is.
	     */var _checkForMethod=function _checkForMethod(methodname,fn){return function(){var length=arguments.length;if(length===0){return fn();}var obj=arguments[length-1];return _isArray(obj)||typeof obj[methodname]!=='function'?fn.apply(this,arguments):obj[methodname].apply(obj,_slice(arguments,0,length-1));};};/**
	     * Optimized internal one-arity curry function.
	     *
	     * @private
	     * @category Function
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */var _curry1=function _curry1(fn){return function f1(a){if(arguments.length===0||_isPlaceholder(a)){return f1;}else{return fn.apply(this,arguments);}};};/**
	     * Optimized internal two-arity curry function.
	     *
	     * @private
	     * @category Function
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */var _curry2=function _curry2(fn){return function f2(a,b){switch(arguments.length){case 0:return f2;case 1:return _isPlaceholder(a)?f2:_curry1(function(_b){return fn(a,_b);});default:return _isPlaceholder(a)&&_isPlaceholder(b)?f2:_isPlaceholder(a)?_curry1(function(_a){return fn(_a,b);}):_isPlaceholder(b)?_curry1(function(_b){return fn(a,_b);}):fn(a,b);}};};/**
	     * Optimized internal three-arity curry function.
	     *
	     * @private
	     * @category Function
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */var _curry3=function _curry3(fn){return function f3(a,b,c){switch(arguments.length){case 0:return f3;case 1:return _isPlaceholder(a)?f3:_curry2(function(_b,_c){return fn(a,_b,_c);});case 2:return _isPlaceholder(a)&&_isPlaceholder(b)?f3:_isPlaceholder(a)?_curry2(function(_a,_c){return fn(_a,b,_c);}):_isPlaceholder(b)?_curry2(function(_b,_c){return fn(a,_b,_c);}):_curry1(function(_c){return fn(a,b,_c);});default:return _isPlaceholder(a)&&_isPlaceholder(b)&&_isPlaceholder(c)?f3:_isPlaceholder(a)&&_isPlaceholder(b)?_curry2(function(_a,_b){return fn(_a,_b,c);}):_isPlaceholder(a)&&_isPlaceholder(c)?_curry2(function(_a,_c){return fn(_a,b,_c);}):_isPlaceholder(b)&&_isPlaceholder(c)?_curry2(function(_b,_c){return fn(a,_b,_c);}):_isPlaceholder(a)?_curry1(function(_a){return fn(_a,b,c);}):_isPlaceholder(b)?_curry1(function(_b){return fn(a,_b,c);}):_isPlaceholder(c)?_curry1(function(_c){return fn(a,b,_c);}):fn(a,b,c);}};};/**
	     * Internal curryN function.
	     *
	     * @private
	     * @category Function
	     * @param {Number} length The arity of the curried function.
	     * @param {Array} received An array of arguments received thus far.
	     * @param {Function} fn The function to curry.
	     * @return {Function} The curried function.
	     */var _curryN=function _curryN(length,received,fn){return function(){var combined=[];var argsIdx=0;var left=length;var combinedIdx=0;while(combinedIdx<received.length||argsIdx<arguments.length){var result;if(combinedIdx<received.length&&(!_isPlaceholder(received[combinedIdx])||argsIdx>=arguments.length)){result=received[combinedIdx];}else{result=arguments[argsIdx];argsIdx+=1;}combined[combinedIdx]=result;if(!_isPlaceholder(result)){left-=1;}combinedIdx+=1;}return left<=0?fn.apply(this,combined):_arity(left,_curryN(length,combined,fn));};};/**
	     * Returns a function that dispatches with different strategies based on the
	     * object in list position (last argument). If it is an array, executes [fn].
	     * Otherwise, if it has a function with [methodname], it will execute that
	     * function (functor case). Otherwise, if it is a transformer, uses transducer
	     * [xf] to return a new transformer (transducer case). Otherwise, it will
	     * default to executing [fn].
	     *
	     * @private
	     * @param {String} methodname property to check for a custom implementation
	     * @param {Function} xf transducer to initialize if object is transformer
	     * @param {Function} fn default ramda implementation
	     * @return {Function} A function that dispatches on object in list position
	     */var _dispatchable=function _dispatchable(methodname,xf,fn){return function(){var length=arguments.length;if(length===0){return fn();}var obj=arguments[length-1];if(!_isArray(obj)){var args=_slice(arguments,0,length-1);if(typeof obj[methodname]==='function'){return obj[methodname].apply(obj,args);}if(_isTransformer(obj)){var transducer=xf.apply(null,args);return transducer(obj);}}return fn.apply(this,arguments);};};var _dropLastWhile=function dropLastWhile(pred,list){var idx=list.length-1;while(idx>=0&&pred(list[idx])){idx-=1;}return _slice(list,0,idx+1);};var _xall=function(){function XAll(f,xf){this.xf=xf;this.f=f;this.all=true;}XAll.prototype['@@transducer/init']=_xfBase.init;XAll.prototype['@@transducer/result']=function(result){if(this.all){result=this.xf['@@transducer/step'](result,true);}return this.xf['@@transducer/result'](result);};XAll.prototype['@@transducer/step']=function(result,input){if(!this.f(input)){this.all=false;result=_reduced(this.xf['@@transducer/step'](result,false));}return result;};return _curry2(function _xall(f,xf){return new XAll(f,xf);});}();var _xany=function(){function XAny(f,xf){this.xf=xf;this.f=f;this.any=false;}XAny.prototype['@@transducer/init']=_xfBase.init;XAny.prototype['@@transducer/result']=function(result){if(!this.any){result=this.xf['@@transducer/step'](result,false);}return this.xf['@@transducer/result'](result);};XAny.prototype['@@transducer/step']=function(result,input){if(this.f(input)){this.any=true;result=_reduced(this.xf['@@transducer/step'](result,true));}return result;};return _curry2(function _xany(f,xf){return new XAny(f,xf);});}();var _xaperture=function(){function XAperture(n,xf){this.xf=xf;this.pos=0;this.full=false;this.acc=new Array(n);}XAperture.prototype['@@transducer/init']=_xfBase.init;XAperture.prototype['@@transducer/result']=function(result){this.acc=null;return this.xf['@@transducer/result'](result);};XAperture.prototype['@@transducer/step']=function(result,input){this.store(input);return this.full?this.xf['@@transducer/step'](result,this.getCopy()):result;};XAperture.prototype.store=function(input){this.acc[this.pos]=input;this.pos+=1;if(this.pos===this.acc.length){this.pos=0;this.full=true;}};XAperture.prototype.getCopy=function(){return _concat(_slice(this.acc,this.pos),_slice(this.acc,0,this.pos));};return _curry2(function _xaperture(n,xf){return new XAperture(n,xf);});}();var _xdrop=function(){function XDrop(n,xf){this.xf=xf;this.n=n;}XDrop.prototype['@@transducer/init']=_xfBase.init;XDrop.prototype['@@transducer/result']=_xfBase.result;XDrop.prototype['@@transducer/step']=function(result,input){if(this.n>0){this.n-=1;return result;}return this.xf['@@transducer/step'](result,input);};return _curry2(function _xdrop(n,xf){return new XDrop(n,xf);});}();var _xdropLast=function(){function XDropLast(n,xf){this.xf=xf;this.pos=0;this.full=false;this.acc=new Array(n);}XDropLast.prototype['@@transducer/init']=_xfBase.init;XDropLast.prototype['@@transducer/result']=function(result){this.acc=null;return this.xf['@@transducer/result'](result);};XDropLast.prototype['@@transducer/step']=function(result,input){if(this.full){result=this.xf['@@transducer/step'](result,this.acc[this.pos]);}this.store(input);return result;};XDropLast.prototype.store=function(input){this.acc[this.pos]=input;this.pos+=1;if(this.pos===this.acc.length){this.pos=0;this.full=true;}};return _curry2(function _xdropLast(n,xf){return new XDropLast(n,xf);});}();var _xdropRepeatsWith=function(){function XDropRepeatsWith(pred,xf){this.xf=xf;this.pred=pred;this.lastValue=undefined;this.seenFirstValue=false;}XDropRepeatsWith.prototype['@@transducer/init']=function(){return this.xf['@@transducer/init']();};XDropRepeatsWith.prototype['@@transducer/result']=function(result){return this.xf['@@transducer/result'](result);};XDropRepeatsWith.prototype['@@transducer/step']=function(result,input){var sameAsLast=false;if(!this.seenFirstValue){this.seenFirstValue=true;}else if(this.pred(this.lastValue,input)){sameAsLast=true;}this.lastValue=input;return sameAsLast?result:this.xf['@@transducer/step'](result,input);};return _curry2(function _xdropRepeatsWith(pred,xf){return new XDropRepeatsWith(pred,xf);});}();var _xdropWhile=function(){function XDropWhile(f,xf){this.xf=xf;this.f=f;}XDropWhile.prototype['@@transducer/init']=_xfBase.init;XDropWhile.prototype['@@transducer/result']=_xfBase.result;XDropWhile.prototype['@@transducer/step']=function(result,input){if(this.f){if(this.f(input)){return result;}this.f=null;}return this.xf['@@transducer/step'](result,input);};return _curry2(function _xdropWhile(f,xf){return new XDropWhile(f,xf);});}();var _xfilter=function(){function XFilter(f,xf){this.xf=xf;this.f=f;}XFilter.prototype['@@transducer/init']=_xfBase.init;XFilter.prototype['@@transducer/result']=_xfBase.result;XFilter.prototype['@@transducer/step']=function(result,input){return this.f(input)?this.xf['@@transducer/step'](result,input):result;};return _curry2(function _xfilter(f,xf){return new XFilter(f,xf);});}();var _xfind=function(){function XFind(f,xf){this.xf=xf;this.f=f;this.found=false;}XFind.prototype['@@transducer/init']=_xfBase.init;XFind.prototype['@@transducer/result']=function(result){if(!this.found){result=this.xf['@@transducer/step'](result,void 0);}return this.xf['@@transducer/result'](result);};XFind.prototype['@@transducer/step']=function(result,input){if(this.f(input)){this.found=true;result=_reduced(this.xf['@@transducer/step'](result,input));}return result;};return _curry2(function _xfind(f,xf){return new XFind(f,xf);});}();var _xfindIndex=function(){function XFindIndex(f,xf){this.xf=xf;this.f=f;this.idx=-1;this.found=false;}XFindIndex.prototype['@@transducer/init']=_xfBase.init;XFindIndex.prototype['@@transducer/result']=function(result){if(!this.found){result=this.xf['@@transducer/step'](result,-1);}return this.xf['@@transducer/result'](result);};XFindIndex.prototype['@@transducer/step']=function(result,input){this.idx+=1;if(this.f(input)){this.found=true;result=_reduced(this.xf['@@transducer/step'](result,this.idx));}return result;};return _curry2(function _xfindIndex(f,xf){return new XFindIndex(f,xf);});}();var _xfindLast=function(){function XFindLast(f,xf){this.xf=xf;this.f=f;}XFindLast.prototype['@@transducer/init']=_xfBase.init;XFindLast.prototype['@@transducer/result']=function(result){return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result,this.last));};XFindLast.prototype['@@transducer/step']=function(result,input){if(this.f(input)){this.last=input;}return result;};return _curry2(function _xfindLast(f,xf){return new XFindLast(f,xf);});}();var _xfindLastIndex=function(){function XFindLastIndex(f,xf){this.xf=xf;this.f=f;this.idx=-1;this.lastIdx=-1;}XFindLastIndex.prototype['@@transducer/init']=_xfBase.init;XFindLastIndex.prototype['@@transducer/result']=function(result){return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result,this.lastIdx));};XFindLastIndex.prototype['@@transducer/step']=function(result,input){this.idx+=1;if(this.f(input)){this.lastIdx=this.idx;}return result;};return _curry2(function _xfindLastIndex(f,xf){return new XFindLastIndex(f,xf);});}();var _xmap=function(){function XMap(f,xf){this.xf=xf;this.f=f;}XMap.prototype['@@transducer/init']=_xfBase.init;XMap.prototype['@@transducer/result']=_xfBase.result;XMap.prototype['@@transducer/step']=function(result,input){return this.xf['@@transducer/step'](result,this.f(input));};return _curry2(function _xmap(f,xf){return new XMap(f,xf);});}();var _xreduceBy=function(){function XReduceBy(valueFn,valueAcc,keyFn,xf){this.valueFn=valueFn;this.valueAcc=valueAcc;this.keyFn=keyFn;this.xf=xf;this.inputs={};}XReduceBy.prototype['@@transducer/init']=_xfBase.init;XReduceBy.prototype['@@transducer/result']=function(result){var key;for(key in this.inputs){if(_has(key,this.inputs)){result=this.xf['@@transducer/step'](result,this.inputs[key]);if(result['@@transducer/reduced']){result=result['@@transducer/value'];break;}}}this.inputs=null;return this.xf['@@transducer/result'](result);};XReduceBy.prototype['@@transducer/step']=function(result,input){var key=this.keyFn(input);this.inputs[key]=this.inputs[key]||[key,this.valueAcc];this.inputs[key][1]=this.valueFn(this.inputs[key][1],input);return result;};return _curryN(4,[],function _xreduceBy(valueFn,valueAcc,keyFn,xf){return new XReduceBy(valueFn,valueAcc,keyFn,xf);});}();var _xtake=function(){function XTake(n,xf){this.xf=xf;this.n=n;this.i=0;}XTake.prototype['@@transducer/init']=_xfBase.init;XTake.prototype['@@transducer/result']=_xfBase.result;XTake.prototype['@@transducer/step']=function(result,input){this.i+=1;var ret=this.n===0?result:this.xf['@@transducer/step'](result,input);return this.i>=this.n?_reduced(ret):ret;};return _curry2(function _xtake(n,xf){return new XTake(n,xf);});}();var _xtakeWhile=function(){function XTakeWhile(f,xf){this.xf=xf;this.f=f;}XTakeWhile.prototype['@@transducer/init']=_xfBase.init;XTakeWhile.prototype['@@transducer/result']=_xfBase.result;XTakeWhile.prototype['@@transducer/step']=function(result,input){return this.f(input)?this.xf['@@transducer/step'](result,input):_reduced(result);};return _curry2(function _xtakeWhile(f,xf){return new XTakeWhile(f,xf);});}();/**
	     * Adds two values.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a
	     * @param {Number} b
	     * @return {Number}
	     * @see R.subtract
	     * @example
	     *
	     *      R.add(2, 3);       //=>  5
	     *      R.add(7)(10);      //=> 17
	     */var add=_curry2(function add(a,b){return Number(a)+Number(b);});/**
	     * Applies a function to the value at the given index of an array, returning a
	     * new copy of the array with the element at the given index replaced with the
	     * result of the function application.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category List
	     * @sig (a -> a) -> Number -> [a] -> [a]
	     * @param {Function} fn The function to apply.
	     * @param {Number} idx The index.
	     * @param {Array|Arguments} list An array-like object whose value
	     *        at the supplied index will be replaced.
	     * @return {Array} A copy of the supplied array-like object with
	     *         the element at index `idx` replaced with the value
	     *         returned by applying `fn` to the existing element.
	     * @see R.update
	     * @example
	     *
	     *      R.adjust(R.add(10), 1, [0, 1, 2]);     //=> [0, 11, 2]
	     *      R.adjust(R.add(10))(1)([0, 1, 2]);     //=> [0, 11, 2]
	     */var adjust=_curry3(function adjust(fn,idx,list){if(idx>=list.length||idx<-list.length){return list;}var start=idx<0?list.length:0;var _idx=start+idx;var _list=_concat(list);_list[_idx]=fn(list[_idx]);return _list;});/**
	     * Returns `true` if all elements of the list match the predicate, `false` if
	     * there are any that don't.
	     *
	     * Dispatches to the `all` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Boolean
	     * @param {Function} fn The predicate function.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the predicate is satisfied by every element, `false`
	     *         otherwise.
	     * @see R.any, R.none, R.transduce
	     * @example
	     *
	     *      var lessThan2 = R.flip(R.lt)(2);
	     *      var lessThan3 = R.flip(R.lt)(3);
	     *      R.all(lessThan2)([1, 2]); //=> false
	     *      R.all(lessThan3)([1, 2]); //=> true
	     */var all=_curry2(_dispatchable('all',_xall,function all(fn,list){var idx=0;while(idx<list.length){if(!fn(list[idx])){return false;}idx+=1;}return true;}));/**
	     * Returns a function that always returns the given value. Note that for
	     * non-primitives the value returned is a reference to the original value.
	     *
	     * This function is known as `const`, `constant`, or `K` (for K combinator) in
	     * other languages and libraries.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig a -> (* -> a)
	     * @param {*} val The value to wrap in a function
	     * @return {Function} A Function :: * -> val.
	     * @example
	     *
	     *      var t = R.always('Tee');
	     *      t(); //=> 'Tee'
	     */var always=_curry1(function always(val){return function(){return val;};});/**
	     * Returns `true` if both arguments are `true`; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Logic
	     * @sig * -> * -> *
	     * @param {Boolean} a A boolean value
	     * @param {Boolean} b A boolean value
	     * @return {Boolean} `true` if both arguments are `true`, `false` otherwise
	     * @see R.both
	     * @example
	     *
	     *      R.and(true, true); //=> true
	     *      R.and(true, false); //=> false
	     *      R.and(false, true); //=> false
	     *      R.and(false, false); //=> false
	     */var and=_curry2(function and(a,b){return a&&b;});/**
	     * Returns `true` if at least one of elements of the list match the predicate,
	     * `false` otherwise.
	     *
	     * Dispatches to the `any` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Boolean
	     * @param {Function} fn The predicate function.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the predicate is satisfied by at least one element, `false`
	     *         otherwise.
	     * @see R.all, R.none, R.transduce
	     * @example
	     *
	     *      var lessThan0 = R.flip(R.lt)(0);
	     *      var lessThan2 = R.flip(R.lt)(2);
	     *      R.any(lessThan0)([1, 2]); //=> false
	     *      R.any(lessThan2)([1, 2]); //=> true
	     */var any=_curry2(_dispatchable('any',_xany,function any(fn,list){var idx=0;while(idx<list.length){if(fn(list[idx])){return true;}idx+=1;}return false;}));/**
	     * Returns a new list, composed of n-tuples of consecutive elements If `n` is
	     * greater than the length of the list, an empty list is returned.
	     *
	     * Dispatches to the `aperture` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category List
	     * @sig Number -> [a] -> [[a]]
	     * @param {Number} n The size of the tuples to create
	     * @param {Array} list The list to split into `n`-tuples
	     * @return {Array} The new list.
	     * @see R.transduce
	     * @example
	     *
	     *      R.aperture(2, [1, 2, 3, 4, 5]); //=> [[1, 2], [2, 3], [3, 4], [4, 5]]
	     *      R.aperture(3, [1, 2, 3, 4, 5]); //=> [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
	     *      R.aperture(7, [1, 2, 3, 4, 5]); //=> []
	     */var aperture=_curry2(_dispatchable('aperture',_xaperture,_aperture));/**
	     * Returns a new list containing the contents of the given list, followed by
	     * the given element.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig a -> [a] -> [a]
	     * @param {*} el The element to add to the end of the new list.
	     * @param {Array} list The list whose contents will be added to the beginning of the output
	     *        list.
	     * @return {Array} A new list containing the contents of the old list followed by `el`.
	     * @see R.prepend
	     * @example
	     *
	     *      R.append('tests', ['write', 'more']); //=> ['write', 'more', 'tests']
	     *      R.append('tests', []); //=> ['tests']
	     *      R.append(['tests'], ['write', 'more']); //=> ['write', 'more', ['tests']]
	     */var append=_curry2(function append(el,list){return _concat(list,[el]);});/**
	     * Applies function `fn` to the argument list `args`. This is useful for
	     * creating a fixed-arity function from a variadic function. `fn` should be a
	     * bound function if context is significant.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Function
	     * @sig (*... -> a) -> [*] -> a
	     * @param {Function} fn
	     * @param {Array} args
	     * @return {*}
	     * @see R.call, R.unapply
	     * @example
	     *
	     *      var nums = [1, 2, 3, -99, 42, 6, 7];
	     *      R.apply(Math.max, nums); //=> 42
	     */var apply=_curry2(function apply(fn,args){return fn.apply(this,args);});/**
	     * Makes a shallow clone of an object, setting or overriding the specified
	     * property with the given value. Note that this copies and flattens prototype
	     * properties onto the new object as well. All non-primitive properties are
	     * copied by reference.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Object
	     * @sig String -> a -> {k: v} -> {k: v}
	     * @param {String} prop the property name to set
	     * @param {*} val the new value
	     * @param {Object} obj the object to clone
	     * @return {Object} a new object similar to the original except for the specified property.
	     * @see R.dissoc
	     * @example
	     *
	     *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
	     */var assoc=_curry3(function assoc(prop,val,obj){var result={};for(var p in obj){result[p]=obj[p];}result[prop]=val;return result;});/**
	     * Makes a shallow clone of an object, setting or overriding the nodes required
	     * to create the given path, and placing the specific value at the tail end of
	     * that path. Note that this copies and flattens prototype properties onto the
	     * new object as well. All non-primitive properties are copied by reference.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Object
	     * @sig [String] -> a -> {k: v} -> {k: v}
	     * @param {Array} path the path to set
	     * @param {*} val the new value
	     * @param {Object} obj the object to clone
	     * @return {Object} a new object similar to the original except along the specified path.
	     * @see R.dissocPath
	     * @example
	     *
	     *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
	     */var assocPath=_curry3(function assocPath(path,val,obj){switch(path.length){case 0:return val;case 1:return assoc(path[0],val,obj);default:return assoc(path[0],assocPath(_slice(path,1),val,Object(obj[path[0]])),obj);}});/**
	     * Creates a function that is bound to a context.
	     * Note: `R.bind` does not provide the additional argument-binding capabilities of
	     * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.6.0
	     * @category Function
	     * @category Object
	     * @sig (* -> *) -> {*} -> (* -> *)
	     * @param {Function} fn The function to bind to context
	     * @param {Object} thisObj The context to bind `fn` to
	     * @return {Function} A function that will execute in the context of `thisObj`.
	     * @see R.partial
	     * @example
	     *
	     *      var log = R.bind(console.log, console);
	     *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
	     *      // logs {a: 2}
	     */var bind=_curry2(function bind(fn,thisObj){return _arity(fn.length,function(){return fn.apply(thisObj,arguments);});});/**
	     * Restricts a number to be within a range.
	     *
	     * Also works for other ordered types such as Strings and Dates.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.20.0
	     * @category Relation
	     * @sig Ord a => a -> a -> a -> a
	     * @param {Number} minimum number
	     * @param {Number} maximum number
	     * @param {Number} value to be clamped
	     * @return {Number} Returns the clamped value
	     * @example
	     *
	     *      R.clamp(1, 10, -1) // => 1
	     *      R.clamp(1, 10, 11) // => 10
	     *      R.clamp(1, 10, 4)  // => 4
	     */var clamp=_curry3(function clamp(min,max,value){if(min>max){throw new Error('min must not be greater than max in clamp(min, max, value)');}return value<min?min:value>max?max:value;});/**
	     * Makes a comparator function out of a function that reports whether the first
	     * element is less than the second.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (a, b -> Boolean) -> (a, b -> Number)
	     * @param {Function} pred A predicate function of arity two.
	     * @return {Function} A Function :: a -> b -> Int that returns `-1` if a < b, `1` if b < a, otherwise `0`.
	     * @example
	     *
	     *      var cmp = R.comparator((a, b) => a.age < b.age);
	     *      var people = [
	     *        // ...
	     *      ];
	     *      R.sort(cmp, people);
	     */var comparator=_curry1(function comparator(pred){return function(a,b){return pred(a,b)?-1:pred(b,a)?1:0;};});/**
	     * Returns a curried equivalent of the provided function, with the specified
	     * arity. The curried function has two unusual capabilities. First, its
	     * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
	     * following are equivalent:
	     *
	     *   - `g(1)(2)(3)`
	     *   - `g(1)(2, 3)`
	     *   - `g(1, 2)(3)`
	     *   - `g(1, 2, 3)`
	     *
	     * Secondly, the special placeholder value `R.__` may be used to specify
	     * "gaps", allowing partial application of any combination of arguments,
	     * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	     * following are equivalent:
	     *
	     *   - `g(1, 2, 3)`
	     *   - `g(_, 2, 3)(1)`
	     *   - `g(_, _, 3)(1)(2)`
	     *   - `g(_, _, 3)(1, 2)`
	     *   - `g(_, 2)(1)(3)`
	     *   - `g(_, 2)(1, 3)`
	     *   - `g(_, 2)(_, 3)(1)`
	     *
	     * @func
	     * @memberOf R
	     * @since v0.5.0
	     * @category Function
	     * @sig Number -> (* -> a) -> (* -> a)
	     * @param {Number} length The arity for the returned function.
	     * @param {Function} fn The function to curry.
	     * @return {Function} A new, curried function.
	     * @see R.curry
	     * @example
	     *
	     *      var sumArgs = (...args) => R.sum(args);
	     *
	     *      var curriedAddFourNumbers = R.curryN(4, sumArgs);
	     *      var f = curriedAddFourNumbers(1, 2);
	     *      var g = f(3);
	     *      g(4); //=> 10
	     */var curryN=_curry2(function curryN(length,fn){if(length===1){return _curry1(fn);}return _arity(length,_curryN(length,[],fn));});/**
	     * Decrements its argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Math
	     * @sig Number -> Number
	     * @param {Number} n
	     * @return {Number}
	     * @see R.inc
	     * @example
	     *
	     *      R.dec(42); //=> 41
	     */var dec=add(-1);/**
	     * Returns the second argument if it is not `null`, `undefined` or `NaN`
	     * otherwise the first argument is returned.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category Logic
	     * @sig a -> b -> a | b
	     * @param {a} val The default value.
	     * @param {b} val The value to return if it is not null or undefined
	     * @return {*} The the second value or the default value
	     * @example
	     *
	     *      var defaultTo42 = R.defaultTo(42);
	     *
	     *      defaultTo42(null);  //=> 42
	     *      defaultTo42(undefined);  //=> 42
	     *      defaultTo42('Ramda');  //=> 'Ramda'
	     *      defaultTo42(parseInt('string')); //=> 42
	     */var defaultTo=_curry2(function defaultTo(d,v){return v==null||v!==v?d:v;});/**
	     * Finds the set (i.e. no duplicates) of all elements in the first list not
	     * contained in the second list. Duplication is determined according to the
	     * value returned by applying the supplied predicate to two list elements.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig (a -> a -> Boolean) -> [*] -> [*] -> [*]
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @return {Array} The elements in `list1` that are not in `list2`.
	     * @see R.difference, R.symmetricDifference, R.symmetricDifferenceWith
	     * @example
	     *
	     *      var cmp = (x, y) => x.a === y.a;
	     *      var l1 = [{a: 1}, {a: 2}, {a: 3}];
	     *      var l2 = [{a: 3}, {a: 4}];
	     *      R.differenceWith(cmp, l1, l2); //=> [{a: 1}, {a: 2}]
	     */var differenceWith=_curry3(function differenceWith(pred,first,second){var out=[];var idx=0;var firstLen=first.length;while(idx<firstLen){if(!_containsWith(pred,first[idx],second)&&!_containsWith(pred,first[idx],out)){out.push(first[idx]);}idx+=1;}return out;});/**
	     * Returns a new object that does not contain a `prop` property.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category Object
	     * @sig String -> {k: v} -> {k: v}
	     * @param {String} prop the name of the property to dissociate
	     * @param {Object} obj the object to clone
	     * @return {Object} a new object similar to the original but without the specified property
	     * @see R.assoc
	     * @example
	     *
	     *      R.dissoc('b', {a: 1, b: 2, c: 3}); //=> {a: 1, c: 3}
	     */var dissoc=_curry2(function dissoc(prop,obj){var result={};for(var p in obj){if(p!==prop){result[p]=obj[p];}}return result;});/**
	     * Makes a shallow clone of an object, omitting the property at the given path.
	     * Note that this copies and flattens prototype properties onto the new object
	     * as well. All non-primitive properties are copied by reference.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.11.0
	     * @category Object
	     * @sig [String] -> {k: v} -> {k: v}
	     * @param {Array} path the path to set
	     * @param {Object} obj the object to clone
	     * @return {Object} a new object without the property at path
	     * @see R.assocPath
	     * @example
	     *
	     *      R.dissocPath(['a', 'b', 'c'], {a: {b: {c: 42}}}); //=> {a: {b: {}}}
	     */var dissocPath=_curry2(function dissocPath(path,obj){switch(path.length){case 0:return obj;case 1:return dissoc(path[0],obj);default:var head=path[0];var tail=_slice(path,1);return obj[head]==null?obj:assoc(head,dissocPath(tail,obj[head]),obj);}});/**
	     * Divides two numbers. Equivalent to `a / b`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a The first value.
	     * @param {Number} b The second value.
	     * @return {Number} The result of `a / b`.
	     * @see R.multiply
	     * @example
	     *
	     *      R.divide(71, 100); //=> 0.71
	     *
	     *      var half = R.divide(R.__, 2);
	     *      half(42); //=> 21
	     *
	     *      var reciprocal = R.divide(1);
	     *      reciprocal(4);   //=> 0.25
	     */var divide=_curry2(function divide(a,b){return a/b;});/**
	     * Returns a new list excluding the leading elements of a given list which
	     * satisfy the supplied predicate function. It passes each value to the supplied
	     * predicate function, skipping elements while the predicate function returns
	     * `true`. The predicate function is applied to one argument: *(value)*.
	     *
	     * Dispatches to the `dropWhile` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} A new array.
	     * @see R.takeWhile, R.transduce, R.addIndex
	     * @example
	     *
	     *      var lteTwo = x => x <= 2;
	     *
	     *      R.dropWhile(lteTwo, [1, 2, 3, 4, 3, 2, 1]); //=> [3, 4, 3, 2, 1]
	     */var dropWhile=_curry2(_dispatchable('dropWhile',_xdropWhile,function dropWhile(pred,list){var idx=0;var len=list.length;while(idx<len&&pred(list[idx])){idx+=1;}return _slice(list,idx);}));/**
	     * Returns the empty value of its argument's type. Ramda defines the empty
	     * value of Array (`[]`), Object (`{}`), String (`''`), and Arguments. Other
	     * types are supported if they define `<Type>.empty` and/or
	     * `<Type>.prototype.empty`.
	     *
	     * Dispatches to the `empty` method of the first argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category Function
	     * @sig a -> a
	     * @param {*} x
	     * @return {*}
	     * @example
	     *
	     *      R.empty(Just(42));      //=> Nothing()
	     *      R.empty([1, 2, 3]);     //=> []
	     *      R.empty('unicorns');    //=> ''
	     *      R.empty({x: 1, y: 2});  //=> {}
	     */// else
	var empty=_curry1(function empty(x){return x!=null&&typeof x.empty==='function'?x.empty():x!=null&&x.constructor!=null&&typeof x.constructor.empty==='function'?x.constructor.empty():_isArray(x)?[]:_isString(x)?'':_isObject(x)?{}:_isArguments(x)?function(){return arguments;}():// else
	void 0;});/**
	     * Creates a new object by recursively evolving a shallow copy of `object`,
	     * according to the `transformation` functions. All non-primitive properties
	     * are copied by reference.
	     *
	     * A `transformation` function will not be invoked if its corresponding key
	     * does not exist in the evolved object.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Object
	     * @sig {k: (v -> v)} -> {k: v} -> {k: v}
	     * @param {Object} transformations The object specifying transformation functions to apply
	     *        to the object.
	     * @param {Object} object The object to be transformed.
	     * @return {Object} The transformed object.
	     * @example
	     *
	     *      var tomato  = {firstName: '  Tomato ', data: {elapsed: 100, remaining: 1400}, id:123};
	     *      var transformations = {
	     *        firstName: R.trim,
	     *        lastName: R.trim, // Will not get invoked.
	     *        data: {elapsed: R.add(1), remaining: R.add(-1)}
	     *      };
	     *      R.evolve(transformations, tomato); //=> {firstName: 'Tomato', data: {elapsed: 101, remaining: 1399}, id:123}
	     */var evolve=_curry2(function evolve(transformations,object){var result={};var transformation,key,type;for(key in object){transformation=transformations[key];type=typeof transformation==='undefined'?'undefined':_typeof(transformation);result[key]=type==='function'?transformation(object[key]):type==='object'?evolve(transformations[key],object[key]):object[key];}return result;});/**
	     * Returns the first element of the list which matches the predicate, or
	     * `undefined` if no element matches.
	     *
	     * Dispatches to the `find` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> a | undefined
	     * @param {Function} fn The predicate function used to determine if the element is the
	     *        desired one.
	     * @param {Array} list The array to consider.
	     * @return {Object} The element found, or `undefined`.
	     * @see R.transduce
	     * @example
	     *
	     *      var xs = [{a: 1}, {a: 2}, {a: 3}];
	     *      R.find(R.propEq('a', 2))(xs); //=> {a: 2}
	     *      R.find(R.propEq('a', 4))(xs); //=> undefined
	     */var find=_curry2(_dispatchable('find',_xfind,function find(fn,list){var idx=0;var len=list.length;while(idx<len){if(fn(list[idx])){return list[idx];}idx+=1;}}));/**
	     * Returns the index of the first element of the list which matches the
	     * predicate, or `-1` if no element matches.
	     *
	     * Dispatches to the `findIndex` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.1
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Number
	     * @param {Function} fn The predicate function used to determine if the element is the
	     * desired one.
	     * @param {Array} list The array to consider.
	     * @return {Number} The index of the element found, or `-1`.
	     * @see R.transduce
	     * @example
	     *
	     *      var xs = [{a: 1}, {a: 2}, {a: 3}];
	     *      R.findIndex(R.propEq('a', 2))(xs); //=> 1
	     *      R.findIndex(R.propEq('a', 4))(xs); //=> -1
	     */var findIndex=_curry2(_dispatchable('findIndex',_xfindIndex,function findIndex(fn,list){var idx=0;var len=list.length;while(idx<len){if(fn(list[idx])){return idx;}idx+=1;}return-1;}));/**
	     * Returns the last element of the list which matches the predicate, or
	     * `undefined` if no element matches.
	     *
	     * Dispatches to the `findLast` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.1
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> a | undefined
	     * @param {Function} fn The predicate function used to determine if the element is the
	     * desired one.
	     * @param {Array} list The array to consider.
	     * @return {Object} The element found, or `undefined`.
	     * @see R.transduce
	     * @example
	     *
	     *      var xs = [{a: 1, b: 0}, {a:1, b: 1}];
	     *      R.findLast(R.propEq('a', 1))(xs); //=> {a: 1, b: 1}
	     *      R.findLast(R.propEq('a', 4))(xs); //=> undefined
	     */var findLast=_curry2(_dispatchable('findLast',_xfindLast,function findLast(fn,list){var idx=list.length-1;while(idx>=0){if(fn(list[idx])){return list[idx];}idx-=1;}}));/**
	     * Returns the index of the last element of the list which matches the
	     * predicate, or `-1` if no element matches.
	     *
	     * Dispatches to the `findLastIndex` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.1
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Number
	     * @param {Function} fn The predicate function used to determine if the element is the
	     * desired one.
	     * @param {Array} list The array to consider.
	     * @return {Number} The index of the element found, or `-1`.
	     * @see R.transduce
	     * @example
	     *
	     *      var xs = [{a: 1, b: 0}, {a:1, b: 1}];
	     *      R.findLastIndex(R.propEq('a', 1))(xs); //=> 1
	     *      R.findLastIndex(R.propEq('a', 4))(xs); //=> -1
	     */var findLastIndex=_curry2(_dispatchable('findLastIndex',_xfindLastIndex,function findLastIndex(fn,list){var idx=list.length-1;while(idx>=0){if(fn(list[idx])){return idx;}idx-=1;}return-1;}));/**
	     * Iterate over an input `list`, calling a provided function `fn` for each
	     * element in the list.
	     *
	     * `fn` receives one argument: *(value)*.
	     *
	     * Note: `R.forEach` does not skip deleted or unassigned indices (sparse
	     * arrays), unlike the native `Array.prototype.forEach` method. For more
	     * details on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Description
	     *
	     * Also note that, unlike `Array.prototype.forEach`, Ramda's `forEach` returns
	     * the original array. In some libraries this function is named `each`.
	     *
	     * Dispatches to the `forEach` method of the second argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.1
	     * @category List
	     * @sig (a -> *) -> [a] -> [a]
	     * @param {Function} fn The function to invoke. Receives one argument, `value`.
	     * @param {Array} list The list to iterate over.
	     * @return {Array} The original list.
	     * @see R.addIndex
	     * @example
	     *
	     *      var printXPlusFive = x => console.log(x + 5);
	     *      R.forEach(printXPlusFive, [1, 2, 3]); //=> [1, 2, 3]
	     *      // logs 6
	     *      // logs 7
	     *      // logs 8
	     */var forEach=_curry2(_checkForMethod('forEach',function forEach(fn,list){var len=list.length;var idx=0;while(idx<len){fn(list[idx]);idx+=1;}return list;}));/**
	     * Creates a new object from a list key-value pairs. If a key appears in
	     * multiple pairs, the rightmost pair is included in the object.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category List
	     * @sig [[k,v]] -> {k: v}
	     * @param {Array} pairs An array of two-element arrays that will be the keys and values of the output object.
	     * @return {Object} The object made by pairing up `keys` and `values`.
	     * @see R.toPairs, R.pair
	     * @example
	     *
	     *      R.fromPairs([['a', 1], ['b', 2], ['c', 3]]); //=> {a: 1, b: 2, c: 3}
	     */var fromPairs=_curry1(function fromPairs(pairs){var result={};var idx=0;while(idx<pairs.length){result[pairs[idx][0]]=pairs[idx][1];idx+=1;}return result;});/**
	     * Takes a list and returns a list of lists where each sublist's elements are
	     * all "equal" according to the provided equality function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.21.0
	     * @category List
	     * @sig ((a, a) → Boolean) → [a] → [[a]]
	     * @param {Function} fn Function for determining whether two given (adjacent)
	     *        elements should be in the same group
	     * @param {Array} list The array to group. Also accepts a string, which will be
	     *        treated as a list of characters.
	     * @return {List} A list that contains sublists of equal elements,
	     *         whose concatenations are equal to the original list.
	     * @example
	     *
	     * R.groupWith(R.equals, [0, 1, 1, 2, 3, 5, 8, 13, 21])
	     * //=> [[0], [1, 1], [2], [3], [5], [8], [13], [21]]
	     *
	     * R.groupWith((a, b) => a % 2 === b % 2, [0, 1, 1, 2, 3, 5, 8, 13, 21])
	     * //=> [[0], [1, 1], [2], [3, 5], [8], [13, 21]]
	     *
	     * R.groupWith(R.eqBy(isVowel), 'aestiou')
	     * //=> ['ae', 'st', 'iou']
	     */var groupWith=_curry2(function(fn,list){var res=[];var idx=0;var len=list.length;while(idx<len){var nextidx=idx+1;while(nextidx<len&&fn(list[idx],list[nextidx])){nextidx+=1;}res.push(list.slice(idx,nextidx));idx=nextidx;}return res;});/**
	     * Returns `true` if the first argument is greater than the second; `false`
	     * otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @see R.lt
	     * @example
	     *
	     *      R.gt(2, 1); //=> true
	     *      R.gt(2, 2); //=> false
	     *      R.gt(2, 3); //=> false
	     *      R.gt('a', 'z'); //=> false
	     *      R.gt('z', 'a'); //=> true
	     */var gt=_curry2(function gt(a,b){return a>b;});/**
	     * Returns `true` if the first argument is greater than or equal to the second;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {Number} a
	     * @param {Number} b
	     * @return {Boolean}
	     * @see R.lte
	     * @example
	     *
	     *      R.gte(2, 1); //=> true
	     *      R.gte(2, 2); //=> true
	     *      R.gte(2, 3); //=> false
	     *      R.gte('a', 'z'); //=> false
	     *      R.gte('z', 'a'); //=> true
	     */var gte=_curry2(function gte(a,b){return a>=b;});/**
	     * Returns whether or not an object has an own property with the specified name
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Object
	     * @sig s -> {s: x} -> Boolean
	     * @param {String} prop The name of the property to check for.
	     * @param {Object} obj The object to query.
	     * @return {Boolean} Whether the property exists.
	     * @example
	     *
	     *      var hasName = R.has('name');
	     *      hasName({name: 'alice'});   //=> true
	     *      hasName({name: 'bob'});     //=> true
	     *      hasName({});                //=> false
	     *
	     *      var point = {x: 0, y: 0};
	     *      var pointHas = R.has(R.__, point);
	     *      pointHas('x');  //=> true
	     *      pointHas('y');  //=> true
	     *      pointHas('z');  //=> false
	     */var has=_curry2(_has);/**
	     * Returns whether or not an object or its prototype chain has a property with
	     * the specified name
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Object
	     * @sig s -> {s: x} -> Boolean
	     * @param {String} prop The name of the property to check for.
	     * @param {Object} obj The object to query.
	     * @return {Boolean} Whether the property exists.
	     * @example
	     *
	     *      function Rectangle(width, height) {
	     *        this.width = width;
	     *        this.height = height;
	     *      }
	     *      Rectangle.prototype.area = function() {
	     *        return this.width * this.height;
	     *      };
	     *
	     *      var square = new Rectangle(2, 2);
	     *      R.hasIn('width', square);  //=> true
	     *      R.hasIn('area', square);  //=> true
	     */var hasIn=_curry2(function hasIn(prop,obj){return prop in obj;});/**
	     * Returns true if its arguments are identical, false otherwise. Values are
	     * identical if they reference the same memory. `NaN` is identical to `NaN`;
	     * `0` and `-0` are not identical.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.15.0
	     * @category Relation
	     * @sig a -> a -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @example
	     *
	     *      var o = {};
	     *      R.identical(o, o); //=> true
	     *      R.identical(1, 1); //=> true
	     *      R.identical(1, '1'); //=> false
	     *      R.identical([], []); //=> false
	     *      R.identical(0, -0); //=> false
	     *      R.identical(NaN, NaN); //=> true
	     */// SameValue algorithm
	// Steps 1-5, 7-10
	// Steps 6.b-6.e: +0 != -0
	// Step 6.a: NaN == NaN
	var identical=_curry2(function identical(a,b){// SameValue algorithm
	if(a===b){// Steps 1-5, 7-10
	// Steps 6.b-6.e: +0 != -0
	return a!==0||1/a===1/b;}else{// Step 6.a: NaN == NaN
	return a!==a&&b!==b;}});/**
	     * A function that does nothing but return the parameter supplied to it. Good
	     * as a default or placeholder function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig a -> a
	     * @param {*} x The value to return.
	     * @return {*} The input value, `x`.
	     * @example
	     *
	     *      R.identity(1); //=> 1
	     *
	     *      var obj = {};
	     *      R.identity(obj) === obj; //=> true
	     */var identity=_curry1(_identity);/**
	     * Creates a function that will process either the `onTrue` or the `onFalse`
	     * function depending upon the result of the `condition` predicate.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Logic
	     * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
	     * @param {Function} condition A predicate function
	     * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
	     * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
	     * @return {Function} A new unary function that will process either the `onTrue` or the `onFalse`
	     *                    function depending upon the result of the `condition` predicate.
	     * @see R.unless, R.when
	     * @example
	     *
	     *      var incCount = R.ifElse(
	     *        R.has('count'),
	     *        R.over(R.lensProp('count'), R.inc),
	     *        R.assoc('count', 1)
	     *      );
	     *      incCount({});           //=> { count: 1 }
	     *      incCount({ count: 1 }); //=> { count: 2 }
	     */var ifElse=_curry3(function ifElse(condition,onTrue,onFalse){return curryN(Math.max(condition.length,onTrue.length,onFalse.length),function _ifElse(){return condition.apply(this,arguments)?onTrue.apply(this,arguments):onFalse.apply(this,arguments);});});/**
	     * Increments its argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Math
	     * @sig Number -> Number
	     * @param {Number} n
	     * @return {Number}
	     * @see R.dec
	     * @example
	     *
	     *      R.inc(42); //=> 43
	     */var inc=add(1);/**
	     * Inserts the supplied element into the list, at index `index`. _Note that
	     * this is not destructive_: it returns a copy of the list with the changes.
	     * <small>No lists have been harmed in the application of this function.</small>
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.2
	     * @category List
	     * @sig Number -> a -> [a] -> [a]
	     * @param {Number} index The position to insert the element
	     * @param {*} elt The element to insert into the Array
	     * @param {Array} list The list to insert into
	     * @return {Array} A new Array with `elt` inserted at `index`.
	     * @example
	     *
	     *      R.insert(2, 'x', [1,2,3,4]); //=> [1,2,'x',3,4]
	     */var insert=_curry3(function insert(idx,elt,list){idx=idx<list.length&&idx>=0?idx:list.length;var result=_slice(list);result.splice(idx,0,elt);return result;});/**
	     * Inserts the sub-list into the list, at index `index`. _Note that this is not
	     * destructive_: it returns a copy of the list with the changes.
	     * <small>No lists have been harmed in the application of this function.</small>
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category List
	     * @sig Number -> [a] -> [a] -> [a]
	     * @param {Number} index The position to insert the sub-list
	     * @param {Array} elts The sub-list to insert into the Array
	     * @param {Array} list The list to insert the sub-list into
	     * @return {Array} A new Array with `elts` inserted starting at `index`.
	     * @example
	     *
	     *      R.insertAll(2, ['x','y','z'], [1,2,3,4]); //=> [1,2,'x','y','z',3,4]
	     */var insertAll=_curry3(function insertAll(idx,elts,list){idx=idx<list.length&&idx>=0?idx:list.length;return _concat(_concat(_slice(list,0,idx),elts),_slice(list,idx));});/**
	     * Creates a new list with the separator interposed between elements.
	     *
	     * Dispatches to the `intersperse` method of the second argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category List
	     * @sig a -> [a] -> [a]
	     * @param {*} separator The element to add to the list.
	     * @param {Array} list The list to be interposed.
	     * @return {Array} The new list.
	     * @example
	     *
	     *      R.intersperse('n', ['ba', 'a', 'a']); //=> ['ba', 'n', 'a', 'n', 'a']
	     */var intersperse=_curry2(_checkForMethod('intersperse',function intersperse(separator,list){var out=[];var idx=0;var length=list.length;while(idx<length){if(idx===length-1){out.push(list[idx]);}else{out.push(list[idx],separator);}idx+=1;}return out;}));/**
	     * See if an object (`val`) is an instance of the supplied constructor. This
	     * function will check up the inheritance chain, if any.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category Type
	     * @sig (* -> {*}) -> a -> Boolean
	     * @param {Object} ctor A constructor
	     * @param {*} val The value to test
	     * @return {Boolean}
	     * @example
	     *
	     *      R.is(Object, {}); //=> true
	     *      R.is(Number, 1); //=> true
	     *      R.is(Object, 1); //=> false
	     *      R.is(String, 's'); //=> true
	     *      R.is(String, new String('')); //=> true
	     *      R.is(Object, new String('')); //=> true
	     *      R.is(Object, 's'); //=> false
	     *      R.is(Number, {}); //=> false
	     */var is=_curry2(function is(Ctor,val){return val!=null&&val.constructor===Ctor||val instanceof Ctor;});/**
	     * Tests whether or not an object is similar to an array.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.5.0
	     * @category Type
	     * @category List
	     * @sig * -> Boolean
	     * @param {*} x The object to test.
	     * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
	     * @example
	     *
	     *      R.isArrayLike([]); //=> true
	     *      R.isArrayLike(true); //=> false
	     *      R.isArrayLike({}); //=> false
	     *      R.isArrayLike({length: 10}); //=> false
	     *      R.isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
	     */var isArrayLike=_curry1(function isArrayLike(x){if(_isArray(x)){return true;}if(!x){return false;}if((typeof x==='undefined'?'undefined':_typeof(x))!=='object'){return false;}if(_isString(x)){return false;}if(x.nodeType===1){return!!x.length;}if(x.length===0){return true;}if(x.length>0){return x.hasOwnProperty(0)&&x.hasOwnProperty(x.length-1);}return false;});/**
	     * Checks if the input value is `null` or `undefined`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Type
	     * @sig * -> Boolean
	     * @param {*} x The value to test.
	     * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
	     * @example
	     *
	     *      R.isNil(null); //=> true
	     *      R.isNil(undefined); //=> true
	     *      R.isNil(0); //=> false
	     *      R.isNil([]); //=> false
	     */var isNil=_curry1(function isNil(x){return x==null;});/**
	     * Returns a list containing the names of all the enumerable own properties of
	     * the supplied object.
	     * Note that the order of the output array is not guaranteed to be consistent
	     * across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig {k: v} -> [k]
	     * @param {Object} obj The object to extract properties from
	     * @return {Array} An array of the object's own properties.
	     * @example
	     *
	     *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
	     */// cover IE < 9 keys issues
	// Safari bug
	var keys=function(){// cover IE < 9 keys issues
	var hasEnumBug=!{toString:null}.propertyIsEnumerable('toString');var nonEnumerableProps=['constructor','valueOf','isPrototypeOf','toString','propertyIsEnumerable','hasOwnProperty','toLocaleString'];// Safari bug
	var hasArgsEnumBug=function(){'use strict';return arguments.propertyIsEnumerable('length');}();var contains=function contains(list,item){var idx=0;while(idx<list.length){if(list[idx]===item){return true;}idx+=1;}return false;};return typeof Object.keys==='function'&&!hasArgsEnumBug?_curry1(function keys(obj){return Object(obj)!==obj?[]:Object.keys(obj);}):_curry1(function keys(obj){if(Object(obj)!==obj){return[];}var prop,nIdx;var ks=[];var checkArgsLength=hasArgsEnumBug&&_isArguments(obj);for(prop in obj){if(_has(prop,obj)&&(!checkArgsLength||prop!=='length')){ks[ks.length]=prop;}}if(hasEnumBug){nIdx=nonEnumerableProps.length-1;while(nIdx>=0){prop=nonEnumerableProps[nIdx];if(_has(prop,obj)&&!contains(ks,prop)){ks[ks.length]=prop;}nIdx-=1;}}return ks;});}();/**
	     * Returns a list containing the names of all the properties of the supplied
	     * object, including prototype properties.
	     * Note that the order of the output array is not guaranteed to be consistent
	     * across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.0
	     * @category Object
	     * @sig {k: v} -> [k]
	     * @param {Object} obj The object to extract properties from
	     * @return {Array} An array of the object's own and prototype properties.
	     * @example
	     *
	     *      var F = function() { this.x = 'X'; };
	     *      F.prototype.y = 'Y';
	     *      var f = new F();
	     *      R.keysIn(f); //=> ['x', 'y']
	     */var keysIn=_curry1(function keysIn(obj){var prop;var ks=[];for(prop in obj){ks[ks.length]=prop;}return ks;});/**
	     * Returns the number of elements in the array by returning `list.length`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category List
	     * @sig [a] -> Number
	     * @param {Array} list The array to inspect.
	     * @return {Number} The length of the array.
	     * @example
	     *
	     *      R.length([]); //=> 0
	     *      R.length([1, 2, 3]); //=> 3
	     */var length=_curry1(function length(list){return list!=null&&_isNumber(list.length)?list.length:NaN;});/**
	     * Returns `true` if the first argument is less than the second; `false`
	     * otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @see R.gt
	     * @example
	     *
	     *      R.lt(2, 1); //=> false
	     *      R.lt(2, 2); //=> false
	     *      R.lt(2, 3); //=> true
	     *      R.lt('a', 'z'); //=> true
	     *      R.lt('z', 'a'); //=> false
	     */var lt=_curry2(function lt(a,b){return a<b;});/**
	     * Returns `true` if the first argument is less than or equal to the second;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> Boolean
	     * @param {Number} a
	     * @param {Number} b
	     * @return {Boolean}
	     * @see R.gte
	     * @example
	     *
	     *      R.lte(2, 1); //=> false
	     *      R.lte(2, 2); //=> true
	     *      R.lte(2, 3); //=> true
	     *      R.lte('a', 'z'); //=> true
	     *      R.lte('z', 'a'); //=> false
	     */var lte=_curry2(function lte(a,b){return a<=b;});/**
	     * The mapAccum function behaves like a combination of map and reduce; it
	     * applies a function to each element of a list, passing an accumulating
	     * parameter from left to right, and returning a final value of this
	     * accumulator together with the new list.
	     *
	     * The iterator function receives two arguments, *acc* and *value*, and should
	     * return a tuple *[acc, value]*.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category List
	     * @sig (acc -> x -> (acc, y)) -> acc -> [x] -> (acc, [y])
	     * @param {Function} fn The function to be called on every element of the input `list`.
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @see R.addIndex
	     * @example
	     *
	     *      var digits = ['1', '2', '3', '4'];
	     *      var appender = (a, b) => [a + b, a + b];
	     *
	     *      R.mapAccum(appender, 0, digits); //=> ['01234', ['01', '012', '0123', '01234']]
	     */var mapAccum=_curry3(function mapAccum(fn,acc,list){var idx=0;var len=list.length;var result=[];var tuple=[acc];while(idx<len){tuple=fn(tuple[0],list[idx]);result[idx]=tuple[1];idx+=1;}return[tuple[0],result];});/**
	     * The mapAccumRight function behaves like a combination of map and reduce; it
	     * applies a function to each element of a list, passing an accumulating
	     * parameter from right to left, and returning a final value of this
	     * accumulator together with the new list.
	     *
	     * Similar to `mapAccum`, except moves through the input list from the right to
	     * the left.
	     *
	     * The iterator function receives two arguments, *acc* and *value*, and should
	     * return a tuple *[acc, value]*.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category List
	     * @sig (acc -> x -> (acc, y)) -> acc -> [x] -> (acc, [y])
	     * @param {Function} fn The function to be called on every element of the input `list`.
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @see R.addIndex
	     * @example
	     *
	     *      var digits = ['1', '2', '3', '4'];
	     *      var append = (a, b) => [a + b, a + b];
	     *
	     *      R.mapAccumRight(append, 0, digits); //=> ['04321', ['04321', '0432', '043', '04']]
	     */var mapAccumRight=_curry3(function mapAccumRight(fn,acc,list){var idx=list.length-1;var result=[];var tuple=[acc];while(idx>=0){tuple=fn(tuple[0],list[idx]);result[idx]=tuple[1];idx-=1;}return[tuple[0],result];});/**
	     * Tests a regular expression against a String. Note that this function will
	     * return an empty array when there are no matches. This differs from
	     * [`String.prototype.match`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
	     * which returns `null` when there are no matches.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category String
	     * @sig RegExp -> String -> [String | Undefined]
	     * @param {RegExp} rx A regular expression.
	     * @param {String} str The string to match against
	     * @return {Array} The list of matches or empty array.
	     * @see R.test
	     * @example
	     *
	     *      R.match(/([a-z]a)/g, 'bananas'); //=> ['ba', 'na', 'na']
	     *      R.match(/a/, 'b'); //=> []
	     *      R.match(/a/, null); //=> TypeError: null does not have a method named "match"
	     */var match=_curry2(function match(rx,str){return str.match(rx)||[];});/**
	     * mathMod behaves like the modulo operator should mathematically, unlike the
	     * `%` operator (and by extension, R.modulo). So while "-17 % 5" is -2,
	     * mathMod(-17, 5) is 3. mathMod requires Integer arguments, and returns NaN
	     * when the modulus is zero or negative.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} m The dividend.
	     * @param {Number} p the modulus.
	     * @return {Number} The result of `b mod a`.
	     * @example
	     *
	     *      R.mathMod(-17, 5);  //=> 3
	     *      R.mathMod(17, 5);   //=> 2
	     *      R.mathMod(17, -5);  //=> NaN
	     *      R.mathMod(17, 0);   //=> NaN
	     *      R.mathMod(17.2, 5); //=> NaN
	     *      R.mathMod(17, 5.3); //=> NaN
	     *
	     *      var clock = R.mathMod(R.__, 12);
	     *      clock(15); //=> 3
	     *      clock(24); //=> 0
	     *
	     *      var seventeenMod = R.mathMod(17);
	     *      seventeenMod(3);  //=> 2
	     *      seventeenMod(4);  //=> 1
	     *      seventeenMod(10); //=> 7
	     */var mathMod=_curry2(function mathMod(m,p){if(!_isInteger(m)){return NaN;}if(!_isInteger(p)||p<1){return NaN;}return(m%p+p)%p;});/**
	     * Returns the larger of its two arguments.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> a
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.maxBy, R.min
	     * @example
	     *
	     *      R.max(789, 123); //=> 789
	     *      R.max('a', 'b'); //=> 'b'
	     */var max=_curry2(function max(a,b){return b>a?b:a;});/**
	     * Takes a function and two values, and returns whichever value produces the
	     * larger result when passed to the provided function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Relation
	     * @sig Ord b => (a -> b) -> a -> a -> a
	     * @param {Function} f
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.max, R.minBy
	     * @example
	     *
	     *      //  square :: Number -> Number
	     *      var square = n => n * n;
	     *
	     *      R.maxBy(square, -3, 2); //=> -3
	     *
	     *      R.reduce(R.maxBy(square), 0, [3, -5, 4, 1, -2]); //=> -5
	     *      R.reduce(R.maxBy(square), 0, []); //=> 0
	     */var maxBy=_curry3(function maxBy(f,a,b){return f(b)>f(a)?b:a;});/**
	     * Create a new object with the own properties of the first object merged with
	     * the own properties of the second object. If a key exists in both objects,
	     * the value from the second object will be used.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig {k: v} -> {k: v} -> {k: v}
	     * @param {Object} l
	     * @param {Object} r
	     * @return {Object}
	     * @see R.mergeWith, R.mergeWithKey
	     * @example
	     *
	     *      R.merge({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
	     *      //=> { 'name': 'fred', 'age': 40 }
	     *
	     *      var resetToDefault = R.merge(R.__, {x: 0});
	     *      resetToDefault({x: 5, y: 2}); //=> {x: 0, y: 2}
	     */var merge=_curry2(function merge(l,r){return _assign({},l,r);});/**
	     * Merges a list of objects together into one object.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category List
	     * @sig [{k: v}] -> {k: v}
	     * @param {Array} list An array of objects
	     * @return {Object} A merged object.
	     * @see R.reduce
	     * @example
	     *
	     *      R.mergeAll([{foo:1},{bar:2},{baz:3}]); //=> {foo:1,bar:2,baz:3}
	     *      R.mergeAll([{foo:1},{foo:2},{bar:2}]); //=> {foo:2,bar:2}
	     */var mergeAll=_curry1(function mergeAll(list){return _assign.apply(null,[{}].concat(list));});/**
	     * Creates a new object with the own properties of the two provided objects. If
	     * a key exists in both objects, the provided function is applied to the key
	     * and the values associated with the key in each object, with the result being
	     * used as the value associated with the key in the returned object. The key
	     * will be excluded from the returned object if the resulting value is
	     * `undefined`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category Object
	     * @sig (String -> a -> a -> a) -> {a} -> {a} -> {a}
	     * @param {Function} fn
	     * @param {Object} l
	     * @param {Object} r
	     * @return {Object}
	     * @see R.merge, R.mergeWith
	     * @example
	     *
	     *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
	     *      R.mergeWithKey(concatValues,
	     *                     { a: true, thing: 'foo', values: [10, 20] },
	     *                     { b: true, thing: 'bar', values: [15, 35] });
	     *      //=> { a: true, b: true, thing: 'bar', values: [10, 20, 15, 35] }
	     */var mergeWithKey=_curry3(function mergeWithKey(fn,l,r){var result={};var k;for(k in l){if(_has(k,l)){result[k]=_has(k,r)?fn(k,l[k],r[k]):l[k];}}for(k in r){if(_has(k,r)&&!_has(k,result)){result[k]=r[k];}}return result;});/**
	     * Returns the smaller of its two arguments.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord a => a -> a -> a
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.minBy, R.max
	     * @example
	     *
	     *      R.min(789, 123); //=> 123
	     *      R.min('a', 'b'); //=> 'a'
	     */var min=_curry2(function min(a,b){return b<a?b:a;});/**
	     * Takes a function and two values, and returns whichever value produces the
	     * smaller result when passed to the provided function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Relation
	     * @sig Ord b => (a -> b) -> a -> a -> a
	     * @param {Function} f
	     * @param {*} a
	     * @param {*} b
	     * @return {*}
	     * @see R.min, R.maxBy
	     * @example
	     *
	     *      //  square :: Number -> Number
	     *      var square = n => n * n;
	     *
	     *      R.minBy(square, -3, 2); //=> 2
	     *
	     *      R.reduce(R.minBy(square), Infinity, [3, -5, 4, 1, -2]); //=> 1
	     *      R.reduce(R.minBy(square), Infinity, []); //=> Infinity
	     */var minBy=_curry3(function minBy(f,a,b){return f(b)<f(a)?b:a;});/**
	     * Divides the first parameter by the second and returns the remainder. Note
	     * that this function preserves the JavaScript-style behavior for modulo. For
	     * mathematical modulo see `mathMod`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.1
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a The value to the divide.
	     * @param {Number} b The pseudo-modulus
	     * @return {Number} The result of `b % a`.
	     * @see R.mathMod
	     * @example
	     *
	     *      R.modulo(17, 3); //=> 2
	     *      // JS behavior:
	     *      R.modulo(-17, 3); //=> -2
	     *      R.modulo(17, -3); //=> 2
	     *
	     *      var isOdd = R.modulo(R.__, 2);
	     *      isOdd(42); //=> 0
	     *      isOdd(21); //=> 1
	     */var modulo=_curry2(function modulo(a,b){return a%b;});/**
	     * Multiplies two numbers. Equivalent to `a * b` but curried.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a The first value.
	     * @param {Number} b The second value.
	     * @return {Number} The result of `a * b`.
	     * @see R.divide
	     * @example
	     *
	     *      var double = R.multiply(2);
	     *      var triple = R.multiply(3);
	     *      double(3);       //=>  6
	     *      triple(4);       //=> 12
	     *      R.multiply(2, 5);  //=> 10
	     */var multiply=_curry2(function multiply(a,b){return a*b;});/**
	     * Wraps a function of any arity (including nullary) in a function that accepts
	     * exactly `n` parameters. Any extraneous parameters will not be passed to the
	     * supplied function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig Number -> (* -> a) -> (* -> a)
	     * @param {Number} n The desired arity of the new function.
	     * @param {Function} fn The function to wrap.
	     * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
	     *         arity `n`.
	     * @example
	     *
	     *      var takesTwoArgs = (a, b) => [a, b];
	     *
	     *      takesTwoArgs.length; //=> 2
	     *      takesTwoArgs(1, 2); //=> [1, 2]
	     *
	     *      var takesOneArg = R.nAry(1, takesTwoArgs);
	     *      takesOneArg.length; //=> 1
	     *      // Only `n` arguments are passed to the wrapped function
	     *      takesOneArg(1, 2); //=> [1, undefined]
	     */var nAry=_curry2(function nAry(n,fn){switch(n){case 0:return function(){return fn.call(this);};case 1:return function(a0){return fn.call(this,a0);};case 2:return function(a0,a1){return fn.call(this,a0,a1);};case 3:return function(a0,a1,a2){return fn.call(this,a0,a1,a2);};case 4:return function(a0,a1,a2,a3){return fn.call(this,a0,a1,a2,a3);};case 5:return function(a0,a1,a2,a3,a4){return fn.call(this,a0,a1,a2,a3,a4);};case 6:return function(a0,a1,a2,a3,a4,a5){return fn.call(this,a0,a1,a2,a3,a4,a5);};case 7:return function(a0,a1,a2,a3,a4,a5,a6){return fn.call(this,a0,a1,a2,a3,a4,a5,a6);};case 8:return function(a0,a1,a2,a3,a4,a5,a6,a7){return fn.call(this,a0,a1,a2,a3,a4,a5,a6,a7);};case 9:return function(a0,a1,a2,a3,a4,a5,a6,a7,a8){return fn.call(this,a0,a1,a2,a3,a4,a5,a6,a7,a8);};case 10:return function(a0,a1,a2,a3,a4,a5,a6,a7,a8,a9){return fn.call(this,a0,a1,a2,a3,a4,a5,a6,a7,a8,a9);};default:throw new Error('First argument to nAry must be a non-negative integer no greater than ten');}});/**
	     * Negates its argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Math
	     * @sig Number -> Number
	     * @param {Number} n
	     * @return {Number}
	     * @example
	     *
	     *      R.negate(42); //=> -42
	     */var negate=_curry1(function negate(n){return-n;});/**
	     * Returns `true` if no elements of the list match the predicate, `false`
	     * otherwise.
	     *
	     * Dispatches to the `any` method of the second argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> Boolean
	     * @param {Function} fn The predicate function.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the predicate is not satisfied by every element, `false` otherwise.
	     * @see R.all, R.any
	     * @example
	     *
	     *      var isEven = n => n % 2 === 0;
	     *
	     *      R.none(isEven, [1, 3, 5, 7, 9, 11]); //=> true
	     *      R.none(isEven, [1, 3, 5, 7, 8, 11]); //=> false
	     */var none=_curry2(_complement(_dispatchable('any',_xany,any)));/**
	     * A function that returns the `!` of its argument. It will return `true` when
	     * passed false-y value, and `false` when passed a truth-y one.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Logic
	     * @sig * -> Boolean
	     * @param {*} a any value
	     * @return {Boolean} the logical inverse of passed argument.
	     * @see R.complement
	     * @example
	     *
	     *      R.not(true); //=> false
	     *      R.not(false); //=> true
	     *      R.not(0); //=> true
	     *      R.not(1); //=> false
	     */var not=_curry1(function not(a){return!a;});/**
	     * Returns the nth element of the given list or string. If n is negative the
	     * element at index length + n is returned.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Number -> [a] -> a | Undefined
	     * @sig Number -> String -> String
	     * @param {Number} offset
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      var list = ['foo', 'bar', 'baz', 'quux'];
	     *      R.nth(1, list); //=> 'bar'
	     *      R.nth(-1, list); //=> 'quux'
	     *      R.nth(-99, list); //=> undefined
	     *
	     *      R.nth(2, 'abc'); //=> 'c'
	     *      R.nth(3, 'abc'); //=> ''
	     */var nth=_curry2(function nth(offset,list){var idx=offset<0?list.length+offset:offset;return _isString(list)?list.charAt(idx):list[idx];});/**
	     * Returns a function which returns its nth argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Function
	     * @sig Number -> *... -> *
	     * @param {Number} n
	     * @return {Function}
	     * @example
	     *
	     *      R.nthArg(1)('a', 'b', 'c'); //=> 'b'
	     *      R.nthArg(-1)('a', 'b', 'c'); //=> 'c'
	     */var nthArg=_curry1(function nthArg(n){var arity=n<0?1:n+1;return curryN(arity,function(){return nth(n,arguments);});});/**
	     * Creates an object containing a single key:value pair.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.18.0
	     * @category Object
	     * @sig String -> a -> {String:a}
	     * @param {String} key
	     * @param {*} val
	     * @return {Object}
	     * @see R.pair
	     * @example
	     *
	     *      var matchPhrases = R.compose(
	     *        R.objOf('must'),
	     *        R.map(R.objOf('match_phrase'))
	     *      );
	     *      matchPhrases(['foo', 'bar', 'baz']); //=> {must: [{match_phrase: 'foo'}, {match_phrase: 'bar'}, {match_phrase: 'baz'}]}
	     */var objOf=_curry2(function objOf(key,val){var obj={};obj[key]=val;return obj;});/**
	     * Returns a singleton array containing the value provided.
	     *
	     * Note this `of` is different from the ES6 `of`; See
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category Function
	     * @sig a -> [a]
	     * @param {*} x any value
	     * @return {Array} An array wrapping `x`.
	     * @example
	     *
	     *      R.of(null); //=> [null]
	     *      R.of([42]); //=> [[42]]
	     */var of=_curry1(_of);/**
	     * Accepts a function `fn` and returns a function that guards invocation of
	     * `fn` such that `fn` can only ever be called once, no matter how many times
	     * the returned function is invoked. The first value calculated is returned in
	     * subsequent invocations.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (a... -> b) -> (a... -> b)
	     * @param {Function} fn The function to wrap in a call-only-once wrapper.
	     * @return {Function} The wrapped function.
	     * @example
	     *
	     *      var addOneOnce = R.once(x => x + 1);
	     *      addOneOnce(10); //=> 11
	     *      addOneOnce(addOneOnce(50)); //=> 11
	     */var once=_curry1(function once(fn){var called=false;var result;return _arity(fn.length,function(){if(called){return result;}called=true;result=fn.apply(this,arguments);return result;});});/**
	     * Returns `true` if one or both of its arguments are `true`. Returns `false`
	     * if both arguments are `false`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Logic
	     * @sig * -> * -> *
	     * @param {Boolean} a A boolean value
	     * @param {Boolean} b A boolean value
	     * @return {Boolean} `true` if one or both arguments are `true`, `false` otherwise
	     * @see R.either
	     * @example
	     *
	     *      R.or(true, true); //=> true
	     *      R.or(true, false); //=> true
	     *      R.or(false, true); //=> true
	     *      R.or(false, false); //=> false
	     */var or=_curry2(function or(a,b){return a||b;});/**
	     * Returns the result of "setting" the portion of the given data structure
	     * focused by the given lens to the result of applying the given function to
	     * the focused value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category Object
	     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig Lens s a -> (a -> a) -> s -> s
	     * @param {Lens} lens
	     * @param {*} v
	     * @param {*} x
	     * @return {*}
	     * @see R.prop, R.lensIndex, R.lensProp
	     * @example
	     *
	     *      var headLens = R.lensIndex(0);
	     *
	     *      R.over(headLens, R.toUpper, ['foo', 'bar', 'baz']); //=> ['FOO', 'bar', 'baz']
	     */// `Identity` is a functor that holds a single value, where `map` simply
	// transforms the held value with the provided function.
	// The value returned by the getter function is first transformed with `f`,
	// then set as the value of an `Identity`. This is then mapped over with the
	// setter function of the lens.
	var over=function(){// `Identity` is a functor that holds a single value, where `map` simply
	// transforms the held value with the provided function.
	var Identity=function Identity(x){return{value:x,map:function map(f){return Identity(f(x));}};};return _curry3(function over(lens,f,x){// The value returned by the getter function is first transformed with `f`,
	// then set as the value of an `Identity`. This is then mapped over with the
	// setter function of the lens.
	return lens(function(y){return Identity(f(y));})(x).value;});}();/**
	     * Takes two arguments, `fst` and `snd`, and returns `[fst, snd]`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.18.0
	     * @category List
	     * @sig a -> b -> (a,b)
	     * @param {*} fst
	     * @param {*} snd
	     * @return {Array}
	     * @see R.objOf, R.of
	     * @example
	     *
	     *      R.pair('foo', 'bar'); //=> ['foo', 'bar']
	     */var pair=_curry2(function pair(fst,snd){return[fst,snd];});/**
	     * Retrieve the value at a given path.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.0
	     * @category Object
	     * @sig [String] -> {k: v} -> v | Undefined
	     * @param {Array} path The path to use.
	     * @param {Object} obj The object to retrieve the nested property from.
	     * @return {*} The data at `path`.
	     * @see R.prop
	     * @example
	     *
	     *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
	     *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
	     */var path=_curry2(function path(paths,obj){var val=obj;var idx=0;while(idx<paths.length){if(val==null){return;}val=val[paths[idx]];idx+=1;}return val;});/**
	     * If the given, non-null object has a value at the given path, returns the
	     * value at that path. Otherwise returns the provided default value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.18.0
	     * @category Object
	     * @sig a -> [String] -> Object -> a
	     * @param {*} d The default value.
	     * @param {Array} p The path to use.
	     * @param {Object} obj The object to retrieve the nested property from.
	     * @return {*} The data at `path` of the supplied object or the default value.
	     * @example
	     *
	     *      R.pathOr('N/A', ['a', 'b'], {a: {b: 2}}); //=> 2
	     *      R.pathOr('N/A', ['a', 'b'], {c: {b: 2}}); //=> "N/A"
	     */var pathOr=_curry3(function pathOr(d,p,obj){return defaultTo(d,path(p,obj));});/**
	     * Returns `true` if the specified object property at given path satisfies the
	     * given predicate; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category Logic
	     * @sig (a -> Boolean) -> [String] -> Object -> Boolean
	     * @param {Function} pred
	     * @param {Array} propPath
	     * @param {*} obj
	     * @return {Boolean}
	     * @see R.propSatisfies, R.path
	     * @example
	     *
	     *      R.pathSatisfies(y => y > 0, ['x', 'y'], {x: {y: 2}}); //=> true
	     */var pathSatisfies=_curry3(function pathSatisfies(pred,propPath,obj){return propPath.length>0&&pred(path(propPath,obj));});/**
	     * Returns a partial copy of an object containing only the keys specified. If
	     * the key does not exist, the property is ignored.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig [k] -> {k: v} -> {k: v}
	     * @param {Array} names an array of String property names to copy onto a new object
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with only properties from `names` on it.
	     * @see R.omit, R.props
	     * @example
	     *
	     *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
	     *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
	     */var pick=_curry2(function pick(names,obj){var result={};var idx=0;while(idx<names.length){if(names[idx]in obj){result[names[idx]]=obj[names[idx]];}idx+=1;}return result;});/**
	     * Similar to `pick` except that this one includes a `key: undefined` pair for
	     * properties that don't exist.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig [k] -> {k: v} -> {k: v}
	     * @param {Array} names an array of String property names to copy onto a new object
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with only properties from `names` on it.
	     * @see R.pick
	     * @example
	     *
	     *      R.pickAll(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
	     *      R.pickAll(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, e: undefined, f: undefined}
	     */var pickAll=_curry2(function pickAll(names,obj){var result={};var idx=0;var len=names.length;while(idx<len){var name=names[idx];result[name]=obj[name];idx+=1;}return result;});/**
	     * Returns a partial copy of an object containing only the keys that satisfy
	     * the supplied predicate.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Object
	     * @sig (v, k -> Boolean) -> {k: v} -> {k: v}
	     * @param {Function} pred A predicate to determine whether or not a key
	     *        should be included on the output object.
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with only properties that satisfy `pred`
	     *         on it.
	     * @see R.pick, R.filter
	     * @example
	     *
	     *      var isUpperCase = (val, key) => key.toUpperCase() === key;
	     *      R.pickBy(isUpperCase, {a: 1, b: 2, A: 3, B: 4}); //=> {A: 3, B: 4}
	     */var pickBy=_curry2(function pickBy(test,obj){var result={};for(var prop in obj){if(test(obj[prop],prop,obj)){result[prop]=obj[prop];}}return result;});/**
	     * Returns a new list with the given element at the front, followed by the
	     * contents of the list.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig a -> [a] -> [a]
	     * @param {*} el The item to add to the head of the output list.
	     * @param {Array} list The array to add to the tail of the output list.
	     * @return {Array} A new array.
	     * @see R.append
	     * @example
	     *
	     *      R.prepend('fee', ['fi', 'fo', 'fum']); //=> ['fee', 'fi', 'fo', 'fum']
	     */var prepend=_curry2(function prepend(el,list){return _concat([el],list);});/**
	     * Returns a function that when supplied an object returns the indicated
	     * property of that object, if it exists.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig s -> {s: a} -> a | Undefined
	     * @param {String} p The property name
	     * @param {Object} obj The object to query
	     * @return {*} The value at `obj.p`.
	     * @see R.path
	     * @example
	     *
	     *      R.prop('x', {x: 100}); //=> 100
	     *      R.prop('x', {}); //=> undefined
	     */var prop=_curry2(function prop(p,obj){return obj[p];});/**
	     * Returns `true` if the specified object property is of the given type;
	     * `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category Type
	     * @sig Type -> String -> Object -> Boolean
	     * @param {Function} type
	     * @param {String} name
	     * @param {*} obj
	     * @return {Boolean}
	     * @see R.is, R.propSatisfies
	     * @example
	     *
	     *      R.propIs(Number, 'x', {x: 1, y: 2});  //=> true
	     *      R.propIs(Number, 'x', {x: 'foo'});    //=> false
	     *      R.propIs(Number, 'x', {});            //=> false
	     */var propIs=_curry3(function propIs(type,name,obj){return is(type,obj[name]);});/**
	     * If the given, non-null object has an own property with the specified name,
	     * returns the value of that property. Otherwise returns the provided default
	     * value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.6.0
	     * @category Object
	     * @sig a -> String -> Object -> a
	     * @param {*} val The default value.
	     * @param {String} p The name of the property to return.
	     * @param {Object} obj The object to query.
	     * @return {*} The value of given property of the supplied object or the default value.
	     * @example
	     *
	     *      var alice = {
	     *        name: 'ALICE',
	     *        age: 101
	     *      };
	     *      var favorite = R.prop('favoriteLibrary');
	     *      var favoriteWithDefault = R.propOr('Ramda', 'favoriteLibrary');
	     *
	     *      favorite(alice);  //=> undefined
	     *      favoriteWithDefault(alice);  //=> 'Ramda'
	     */var propOr=_curry3(function propOr(val,p,obj){return obj!=null&&_has(p,obj)?obj[p]:val;});/**
	     * Returns `true` if the specified object property satisfies the given
	     * predicate; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category Logic
	     * @sig (a -> Boolean) -> String -> {String: a} -> Boolean
	     * @param {Function} pred
	     * @param {String} name
	     * @param {*} obj
	     * @return {Boolean}
	     * @see R.propEq, R.propIs
	     * @example
	     *
	     *      R.propSatisfies(x => x > 0, 'x', {x: 1, y: 2}); //=> true
	     */var propSatisfies=_curry3(function propSatisfies(pred,name,obj){return pred(obj[name]);});/**
	     * Acts as multiple `prop`: array of keys in, array of values out. Preserves
	     * order.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig [k] -> {k: v} -> [v]
	     * @param {Array} ps The property names to fetch
	     * @param {Object} obj The object to query
	     * @return {Array} The corresponding values or partially applied function.
	     * @example
	     *
	     *      R.props(['x', 'y'], {x: 1, y: 2}); //=> [1, 2]
	     *      R.props(['c', 'a', 'b'], {b: 2, a: 1}); //=> [undefined, 1, 2]
	     *
	     *      var fullName = R.compose(R.join(' '), R.props(['first', 'last']));
	     *      fullName({last: 'Bullet-Tooth', age: 33, first: 'Tony'}); //=> 'Tony Bullet-Tooth'
	     */var props=_curry2(function props(ps,obj){var len=ps.length;var out=[];var idx=0;while(idx<len){out[idx]=obj[ps[idx]];idx+=1;}return out;});/**
	     * Returns a list of numbers from `from` (inclusive) to `to` (exclusive).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Number -> Number -> [Number]
	     * @param {Number} from The first number in the list.
	     * @param {Number} to One more than the last number in the list.
	     * @return {Array} The list of numbers in tthe set `[a, b)`.
	     * @example
	     *
	     *      R.range(1, 5);    //=> [1, 2, 3, 4]
	     *      R.range(50, 53);  //=> [50, 51, 52]
	     */var range=_curry2(function range(from,to){if(!(_isNumber(from)&&_isNumber(to))){throw new TypeError('Both arguments to range must be numbers');}var result=[];var n=from;while(n<to){result.push(n);n+=1;}return result;});/**
	     * Returns a single item by iterating through the list, successively calling
	     * the iterator function and passing it an accumulator value and the current
	     * value from the array, and then passing the result to the next call.
	     *
	     * Similar to `reduce`, except moves through the input list from the right to
	     * the left.
	     *
	     * The iterator function receives two values: *(acc, value)*
	     *
	     * Note: `R.reduceRight` does not skip deleted or unassigned indices (sparse
	     * arrays), unlike the native `Array.prototype.reduce` method. For more details
	     * on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight#Description
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a,b -> a) -> a -> [b] -> a
	     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	     *        current element from the array.
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @see R.addIndex
	     * @example
	     *
	     *      var pairs = [ ['a', 1], ['b', 2], ['c', 3] ];
	     *      var flattenPairs = (acc, pair) => acc.concat(pair);
	     *
	     *      R.reduceRight(flattenPairs, [], pairs); //=> [ 'c', 3, 'b', 2, 'a', 1 ]
	     */var reduceRight=_curry3(function reduceRight(fn,acc,list){var idx=list.length-1;while(idx>=0){acc=fn(acc,list[idx]);idx-=1;}return acc;});/**
	     * Returns a value wrapped to indicate that it is the final value of the reduce
	     * and transduce functions. The returned value should be considered a black
	     * box: the internal structure is not guaranteed to be stable.
	     *
	     * Note: this optimization is unavailable to functions not explicitly listed
	     * above. For instance, it is not currently supported by reduceRight.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.15.0
	     * @category List
	     * @sig a -> *
	     * @param {*} x The final value of the reduce.
	     * @return {*} The wrapped value.
	     * @see R.reduce, R.transduce
	     * @example
	     *
	     *      R.reduce(
	     *        R.pipe(R.add, R.when(R.gte(R.__, 10), R.reduced)),
	     *        0,
	     *        [1, 2, 3, 4, 5]) // 10
	     */var reduced=_curry1(_reduced);/**
	     * Removes the sub-list of `list` starting at index `start` and containing
	     * `count` elements. _Note that this is not destructive_: it returns a copy of
	     * the list with the changes.
	     * <small>No lists have been harmed in the application of this function.</small>
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.2
	     * @category List
	     * @sig Number -> Number -> [a] -> [a]
	     * @param {Number} start The position to start removing elements
	     * @param {Number} count The number of elements to remove
	     * @param {Array} list The list to remove from
	     * @return {Array} A new Array with `count` elements from `start` removed.
	     * @example
	     *
	     *      R.remove(2, 3, [1,2,3,4,5,6,7,8]); //=> [1,2,6,7,8]
	     */var remove=_curry3(function remove(start,count,list){return _concat(_slice(list,0,Math.min(start,list.length)),_slice(list,Math.min(list.length,start+count)));});/**
	     * Replace a substring or regex match in a string with a replacement.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category String
	     * @sig RegExp|String -> String -> String -> String
	     * @param {RegExp|String} pattern A regular expression or a substring to match.
	     * @param {String} replacement The string to replace the matches with.
	     * @param {String} str The String to do the search and replacement in.
	     * @return {String} The result.
	     * @example
	     *
	     *      R.replace('foo', 'bar', 'foo foo foo'); //=> 'bar foo foo'
	     *      R.replace(/foo/, 'bar', 'foo foo foo'); //=> 'bar foo foo'
	     *
	     *      // Use the "g" (global) flag to replace all occurrences:
	     *      R.replace(/foo/g, 'bar', 'foo foo foo'); //=> 'bar bar bar'
	     */var replace=_curry3(function replace(regex,replacement,str){return str.replace(regex,replacement);});/**
	     * Returns a new list or string with the elements or characters in reverse
	     * order.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [a]
	     * @sig String -> String
	     * @param {Array|String} list
	     * @return {Array|String}
	     * @example
	     *
	     *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
	     *      R.reverse([1, 2]);     //=> [2, 1]
	     *      R.reverse([1]);        //=> [1]
	     *      R.reverse([]);         //=> []
	     *
	     *      R.reverse('abc');      //=> 'cba'
	     *      R.reverse('ab');       //=> 'ba'
	     *      R.reverse('a');        //=> 'a'
	     *      R.reverse('');         //=> ''
	     */var reverse=_curry1(function reverse(list){return _isString(list)?list.split('').reverse().join(''):_slice(list).reverse();});/**
	     * Scan is similar to reduce, but returns a list of successively reduced values
	     * from the left
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category List
	     * @sig (a,b -> a) -> a -> [b] -> [a]
	     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	     *        current element from the array
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {Array} A list of all intermediately reduced values.
	     * @example
	     *
	     *      var numbers = [1, 2, 3, 4];
	     *      var factorials = R.scan(R.multiply, 1, numbers); //=> [1, 1, 2, 6, 24]
	     */var scan=_curry3(function scan(fn,acc,list){var idx=0;var len=list.length;var result=[acc];while(idx<len){acc=fn(acc,list[idx]);result[idx+1]=acc;idx+=1;}return result;});/**
	     * Returns the result of "setting" the portion of the given data structure
	     * focused by the given lens to the given value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category Object
	     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig Lens s a -> a -> s -> s
	     * @param {Lens} lens
	     * @param {*} v
	     * @param {*} x
	     * @return {*}
	     * @see R.prop, R.lensIndex, R.lensProp
	     * @example
	     *
	     *      var xLens = R.lensProp('x');
	     *
	     *      R.set(xLens, 4, {x: 1, y: 2});  //=> {x: 4, y: 2}
	     *      R.set(xLens, 8, {x: 1, y: 2});  //=> {x: 8, y: 2}
	     */var set=_curry3(function set(lens,v,x){return over(lens,always(v),x);});/**
	     * Returns the elements of the given list or string (or object with a `slice`
	     * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
	     *
	     * Dispatches to the `slice` method of the third argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.4
	     * @category List
	     * @sig Number -> Number -> [a] -> [a]
	     * @sig Number -> Number -> String -> String
	     * @param {Number} fromIndex The start index (inclusive).
	     * @param {Number} toIndex The end index (exclusive).
	     * @param {*} list
	     * @return {*}
	     * @example
	     *
	     *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
	     *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
	     *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
	     *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
	     *      R.slice(0, 3, 'ramda');                     //=> 'ram'
	     */var slice=_curry3(_checkForMethod('slice',function slice(fromIndex,toIndex,list){return Array.prototype.slice.call(list,fromIndex,toIndex);}));/**
	     * Returns a copy of the list, sorted according to the comparator function,
	     * which should accept two values at a time and return a negative number if the
	     * first value is smaller, a positive number if it's larger, and zero if they
	     * are equal. Please note that this is a **copy** of the list. It does not
	     * modify the original.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a,a -> Number) -> [a] -> [a]
	     * @param {Function} comparator A sorting function :: a -> b -> Int
	     * @param {Array} list The list to sort
	     * @return {Array} a new array with its elements sorted by the comparator function.
	     * @example
	     *
	     *      var diff = function(a, b) { return a - b; };
	     *      R.sort(diff, [4,2,7,5]); //=> [2, 4, 5, 7]
	     */var sort=_curry2(function sort(comparator,list){return _slice(list).sort(comparator);});/**
	     * Sorts the list according to the supplied function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig Ord b => (a -> b) -> [a] -> [a]
	     * @param {Function} fn
	     * @param {Array} list The list to sort.
	     * @return {Array} A new list sorted by the keys generated by `fn`.
	     * @example
	     *
	     *      var sortByFirstItem = R.sortBy(R.prop(0));
	     *      var sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));
	     *      var pairs = [[-1, 1], [-2, 2], [-3, 3]];
	     *      sortByFirstItem(pairs); //=> [[-3, 3], [-2, 2], [-1, 1]]
	     *      var alice = {
	     *        name: 'ALICE',
	     *        age: 101
	     *      };
	     *      var bob = {
	     *        name: 'Bob',
	     *        age: -10
	     *      };
	     *      var clara = {
	     *        name: 'clara',
	     *        age: 314.159
	     *      };
	     *      var people = [clara, bob, alice];
	     *      sortByNameCaseInsensitive(people); //=> [alice, bob, clara]
	     */var sortBy=_curry2(function sortBy(fn,list){return _slice(list).sort(function(a,b){var aa=fn(a);var bb=fn(b);return aa<bb?-1:aa>bb?1:0;});});/**
	     * Splits a given list or string at a given index.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category List
	     * @sig Number -> [a] -> [[a], [a]]
	     * @sig Number -> String -> [String, String]
	     * @param {Number} index The index where the array/string is split.
	     * @param {Array|String} array The array/string to be split.
	     * @return {Array}
	     * @example
	     *
	     *      R.splitAt(1, [1, 2, 3]);          //=> [[1], [2, 3]]
	     *      R.splitAt(5, 'hello world');      //=> ['hello', ' world']
	     *      R.splitAt(-1, 'foobar');          //=> ['fooba', 'r']
	     */var splitAt=_curry2(function splitAt(index,array){return[slice(0,index,array),slice(index,length(array),array)];});/**
	     * Splits a collection into slices of the specified length.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category List
	     * @sig Number -> [a] -> [[a]]
	     * @sig Number -> String -> [String]
	     * @param {Number} n
	     * @param {Array} list
	     * @return {Array}
	     * @example
	     *
	     *      R.splitEvery(3, [1, 2, 3, 4, 5, 6, 7]); //=> [[1, 2, 3], [4, 5, 6], [7]]
	     *      R.splitEvery(3, 'foobarbaz'); //=> ['foo', 'bar', 'baz']
	     */var splitEvery=_curry2(function splitEvery(n,list){if(n<=0){throw new Error('First argument to splitEvery must be a positive integer');}var result=[];var idx=0;while(idx<list.length){result.push(slice(idx,idx+=n,list));}return result;});/**
	     * Takes a list and a predicate and returns a pair of lists with the following properties:
	     *
	     *  - the result of concatenating the two output lists is equivalent to the input list;
	     *  - none of the elements of the first output list satisfies the predicate; and
	     *  - if the second output list is non-empty, its first element satisfies the predicate.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [[a], [a]]
	     * @param {Function} pred The predicate that determines where the array is split.
	     * @param {Array} list The array to be split.
	     * @return {Array}
	     * @example
	     *
	     *      R.splitWhen(R.equals(2), [1, 2, 3, 1, 2, 3]);   //=> [[1], [2, 3, 1, 2, 3]]
	     */var splitWhen=_curry2(function splitWhen(pred,list){var idx=0;var len=list.length;var prefix=[];while(idx<len&&!pred(list[idx])){prefix.push(list[idx]);idx+=1;}return[prefix,_slice(list,idx)];});/**
	     * Subtracts its second argument from its first argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Math
	     * @sig Number -> Number -> Number
	     * @param {Number} a The first value.
	     * @param {Number} b The second value.
	     * @return {Number} The result of `a - b`.
	     * @see R.add
	     * @example
	     *
	     *      R.subtract(10, 8); //=> 2
	     *
	     *      var minus5 = R.subtract(R.__, 5);
	     *      minus5(17); //=> 12
	     *
	     *      var complementaryAngle = R.subtract(90);
	     *      complementaryAngle(30); //=> 60
	     *      complementaryAngle(72); //=> 18
	     */var subtract=_curry2(function subtract(a,b){return Number(a)-Number(b);});/**
	     * Returns all but the first element of the given list or string (or object
	     * with a `tail` method).
	     *
	     * Dispatches to the `slice` method of the first argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [a]
	     * @sig String -> String
	     * @param {*} list
	     * @return {*}
	     * @see R.head, R.init, R.last
	     * @example
	     *
	     *      R.tail([1, 2, 3]);  //=> [2, 3]
	     *      R.tail([1, 2]);     //=> [2]
	     *      R.tail([1]);        //=> []
	     *      R.tail([]);         //=> []
	     *
	     *      R.tail('abc');  //=> 'bc'
	     *      R.tail('ab');   //=> 'b'
	     *      R.tail('a');    //=> ''
	     *      R.tail('');     //=> ''
	     */var tail=_checkForMethod('tail',slice(1,Infinity));/**
	     * Returns the first `n` elements of the given list, string, or
	     * transducer/transformer (or object with a `take` method).
	     *
	     * Dispatches to the `take` method of the second argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Number -> [a] -> [a]
	     * @sig Number -> String -> String
	     * @param {Number} n
	     * @param {*} list
	     * @return {*}
	     * @see R.drop
	     * @example
	     *
	     *      R.take(1, ['foo', 'bar', 'baz']); //=> ['foo']
	     *      R.take(2, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
	     *      R.take(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
	     *      R.take(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
	     *      R.take(3, 'ramda');               //=> 'ram'
	     *
	     *      var personnel = [
	     *        'Dave Brubeck',
	     *        'Paul Desmond',
	     *        'Eugene Wright',
	     *        'Joe Morello',
	     *        'Gerry Mulligan',
	     *        'Bob Bates',
	     *        'Joe Dodge',
	     *        'Ron Crotty'
	     *      ];
	     *
	     *      var takeFive = R.take(5);
	     *      takeFive(personnel);
	     *      //=> ['Dave Brubeck', 'Paul Desmond', 'Eugene Wright', 'Joe Morello', 'Gerry Mulligan']
	     */var take=_curry2(_dispatchable('take',_xtake,function take(n,xs){return slice(0,n<0?Infinity:n,xs);}));/**
	     * Returns a new list containing the last `n` elements of a given list, passing
	     * each value to the supplied predicate function, and terminating when the
	     * predicate function returns `false`. Excludes the element that caused the
	     * predicate function to fail. The predicate function is passed one argument:
	     * *(value)*.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} A new array.
	     * @see R.dropLastWhile, R.addIndex
	     * @example
	     *
	     *      var isNotOne = x => x !== 1;
	     *
	     *      R.takeLastWhile(isNotOne, [1, 2, 3, 4]); //=> [2, 3, 4]
	     */var takeLastWhile=_curry2(function takeLastWhile(fn,list){var idx=list.length-1;while(idx>=0&&fn(list[idx])){idx-=1;}return _slice(list,idx+1,Infinity);});/**
	     * Returns a new list containing the first `n` elements of a given list,
	     * passing each value to the supplied predicate function, and terminating when
	     * the predicate function returns `false`. Excludes the element that caused the
	     * predicate function to fail. The predicate function is passed one argument:
	     * *(value)*.
	     *
	     * Dispatches to the `takeWhile` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} A new array.
	     * @see R.dropWhile, R.transduce, R.addIndex
	     * @example
	     *
	     *      var isNotFour = x => x !== 4;
	     *
	     *      R.takeWhile(isNotFour, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3]
	     */var takeWhile=_curry2(_dispatchable('takeWhile',_xtakeWhile,function takeWhile(fn,list){var idx=0;var len=list.length;while(idx<len&&fn(list[idx])){idx+=1;}return _slice(list,0,idx);}));/**
	     * Runs the given function with the supplied object, then returns the object.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (a -> *) -> a -> a
	     * @param {Function} fn The function to call with `x`. The return value of `fn` will be thrown away.
	     * @param {*} x
	     * @return {*} `x`.
	     * @example
	     *
	     *      var sayX = x => console.log('x is ' + x);
	     *      R.tap(sayX, 100); //=> 100
	     *      // logs 'x is 100'
	     */var tap=_curry2(function tap(fn,x){fn(x);return x;});/**
	     * Calls an input function `n` times, returning an array containing the results
	     * of those function calls.
	     *
	     * `fn` is passed one argument: The current value of `n`, which begins at `0`
	     * and is gradually incremented to `n - 1`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.3
	     * @category List
	     * @sig (Number -> a) -> Number -> [a]
	     * @param {Function} fn The function to invoke. Passed one argument, the current value of `n`.
	     * @param {Number} n A value between `0` and `n - 1`. Increments after each function call.
	     * @return {Array} An array containing the return values of all calls to `fn`.
	     * @example
	     *
	     *      R.times(R.identity, 5); //=> [0, 1, 2, 3, 4]
	     */var times=_curry2(function times(fn,n){var len=Number(n);var idx=0;var list;if(len<0||isNaN(len)){throw new RangeError('n must be a non-negative number');}list=new Array(len);while(idx<len){list[idx]=fn(idx);idx+=1;}return list;});/**
	     * Converts an object into an array of key, value arrays. Only the object's
	     * own properties are used.
	     * Note that the order of the output array is not guaranteed to be consistent
	     * across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.4.0
	     * @category Object
	     * @sig {String: *} -> [[String,*]]
	     * @param {Object} obj The object to extract from
	     * @return {Array} An array of key, value arrays from the object's own properties.
	     * @see R.fromPairs
	     * @example
	     *
	     *      R.toPairs({a: 1, b: 2, c: 3}); //=> [['a', 1], ['b', 2], ['c', 3]]
	     */var toPairs=_curry1(function toPairs(obj){var pairs=[];for(var prop in obj){if(_has(prop,obj)){pairs[pairs.length]=[prop,obj[prop]];}}return pairs;});/**
	     * Converts an object into an array of key, value arrays. The object's own
	     * properties and prototype properties are used. Note that the order of the
	     * output array is not guaranteed to be consistent across different JS
	     * platforms.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.4.0
	     * @category Object
	     * @sig {String: *} -> [[String,*]]
	     * @param {Object} obj The object to extract from
	     * @return {Array} An array of key, value arrays from the object's own
	     *         and prototype properties.
	     * @example
	     *
	     *      var F = function() { this.x = 'X'; };
	     *      F.prototype.y = 'Y';
	     *      var f = new F();
	     *      R.toPairsIn(f); //=> [['x','X'], ['y','Y']]
	     */var toPairsIn=_curry1(function toPairsIn(obj){var pairs=[];for(var prop in obj){pairs[pairs.length]=[prop,obj[prop]];}return pairs;});/**
	     * Transposes the rows and columns of a 2D list.
	     * When passed a list of `n` lists of length `x`,
	     * returns a list of `x` lists of length `n`.
	     *
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category List
	     * @sig [[a]] -> [[a]]
	     * @param {Array} list A 2D list
	     * @return {Array} A 2D list
	     * @example
	     *
	     *      R.transpose([[1, 'a'], [2, 'b'], [3, 'c']]) //=> [[1, 2, 3], ['a', 'b', 'c']]
	     *      R.transpose([[1, 2, 3], ['a', 'b', 'c']]) //=> [[1, 'a'], [2, 'b'], [3, 'c']]
	     *
	     * If some of the rows are shorter than the following rows, their elements are skipped:
	     *
	     *      R.transpose([[10, 11], [20], [], [30, 31, 32]]) //=> [[10, 20, 30], [11, 31], [32]]
	     */var transpose=_curry1(function transpose(outerlist){var i=0;var result=[];while(i<outerlist.length){var innerlist=outerlist[i];var j=0;while(j<innerlist.length){if(typeof result[j]==='undefined'){result[j]=[];}result[j].push(innerlist[j]);j+=1;}i+=1;}return result;});/**
	     * Removes (strips) whitespace from both ends of the string.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.6.0
	     * @category String
	     * @sig String -> String
	     * @param {String} str The string to trim.
	     * @return {String} Trimmed version of `str`.
	     * @example
	     *
	     *      R.trim('   xyz  '); //=> 'xyz'
	     *      R.map(R.trim, R.split(',', 'x, y, z')); //=> ['x', 'y', 'z']
	     */var trim=function(){var ws='\t\n\x0B\f\r \xA0\u1680\u180E\u2000\u2001\u2002\u2003'+'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028'+'\u2029\uFEFF';var zeroWidth='\u200B';var hasProtoTrim=typeof String.prototype.trim==='function';if(!hasProtoTrim||ws.trim()||!zeroWidth.trim()){return _curry1(function trim(str){var beginRx=new RegExp('^['+ws+']['+ws+']*');var endRx=new RegExp('['+ws+']['+ws+']*$');return str.replace(beginRx,'').replace(endRx,'');});}else{return _curry1(function trim(str){return str.trim();});}}();/**
	     * `tryCatch` takes two functions, a `tryer` and a `catcher`. The returned
	     * function evaluates the `tryer`; if it does not throw, it simply returns the
	     * result. If the `tryer` *does* throw, the returned function evaluates the
	     * `catcher` function and returns its result. Note that for effective
	     * composition with this function, both the `tryer` and `catcher` functions
	     * must return the same type of results.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.20.0
	     * @category Function
	     * @sig (...x -> a) -> ((e, ...x) -> a) -> (...x -> a)
	     * @param {Function} tryer The function that may throw.
	     * @param {Function} catcher The function that will be evaluated if `tryer` throws.
	     * @return {Function} A new function that will catch exceptions and send then to the catcher.
	     * @example
	     *
	     *      R.tryCatch(R.prop('x'), R.F)({x: true}); //=> true
	     *      R.tryCatch(R.prop('x'), R.F)(null);      //=> false
	     */var tryCatch=_curry2(function _tryCatch(tryer,catcher){return _arity(tryer.length,function(){try{return tryer.apply(this,arguments);}catch(e){return catcher.apply(this,_concat([e],arguments));}});});/**
	     * Gives a single-word string description of the (native) type of a value,
	     * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
	     * attempt to distinguish user Object types any further, reporting them all as
	     * 'Object'.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Type
	     * @sig (* -> {*}) -> String
	     * @param {*} val The value to test
	     * @return {String}
	     * @example
	     *
	     *      R.type({}); //=> "Object"
	     *      R.type(1); //=> "Number"
	     *      R.type(false); //=> "Boolean"
	     *      R.type('s'); //=> "String"
	     *      R.type(null); //=> "Null"
	     *      R.type([]); //=> "Array"
	     *      R.type(/[A-z]/); //=> "RegExp"
	     */var type=_curry1(function type(val){return val===null?'Null':val===undefined?'Undefined':Object.prototype.toString.call(val).slice(8,-1);});/**
	     * Takes a function `fn`, which takes a single array argument, and returns a
	     * function which:
	     *
	     *   - takes any number of positional arguments;
	     *   - passes these arguments to `fn` as an array; and
	     *   - returns the result.
	     *
	     * In other words, R.unapply derives a variadic function from a function which
	     * takes an array. R.unapply is the inverse of R.apply.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Function
	     * @sig ([*...] -> a) -> (*... -> a)
	     * @param {Function} fn
	     * @return {Function}
	     * @see R.apply
	     * @example
	     *
	     *      R.unapply(JSON.stringify)(1, 2, 3); //=> '[1,2,3]'
	     */var unapply=_curry1(function unapply(fn){return function(){return fn(_slice(arguments));};});/**
	     * Wraps a function of any arity (including nullary) in a function that accepts
	     * exactly 1 parameter. Any extraneous parameters will not be passed to the
	     * supplied function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.0
	     * @category Function
	     * @sig (* -> b) -> (a -> b)
	     * @param {Function} fn The function to wrap.
	     * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
	     *         arity 1.
	     * @example
	     *
	     *      var takesTwoArgs = function(a, b) {
	     *        return [a, b];
	     *      };
	     *      takesTwoArgs.length; //=> 2
	     *      takesTwoArgs(1, 2); //=> [1, 2]
	     *
	     *      var takesOneArg = R.unary(takesTwoArgs);
	     *      takesOneArg.length; //=> 1
	     *      // Only 1 argument is passed to the wrapped function
	     *      takesOneArg(1, 2); //=> [1, undefined]
	     */var unary=_curry1(function unary(fn){return nAry(1,fn);});/**
	     * Returns a function of arity `n` from a (manually) curried function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category Function
	     * @sig Number -> (a -> b) -> (a -> c)
	     * @param {Number} length The arity for the returned function.
	     * @param {Function} fn The function to uncurry.
	     * @return {Function} A new function.
	     * @see R.curry
	     * @example
	     *
	     *      var addFour = a => b => c => d => a + b + c + d;
	     *
	     *      var uncurriedAddFour = R.uncurryN(4, addFour);
	     *      uncurriedAddFour(1, 2, 3, 4); //=> 10
	     */var uncurryN=_curry2(function uncurryN(depth,fn){return curryN(depth,function(){var currentDepth=1;var value=fn;var idx=0;var endIdx;while(currentDepth<=depth&&typeof value==='function'){endIdx=currentDepth===depth?arguments.length:idx+value.length;value=value.apply(this,_slice(arguments,idx,endIdx));currentDepth+=1;idx=endIdx;}return value;});});/**
	     * Builds a list from a seed value. Accepts an iterator function, which returns
	     * either false to stop iteration or an array of length 2 containing the value
	     * to add to the resulting list and the seed to be used in the next call to the
	     * iterator function.
	     *
	     * The iterator function receives one argument: *(seed)*.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category List
	     * @sig (a -> [b]) -> * -> [b]
	     * @param {Function} fn The iterator function. receives one argument, `seed`, and returns
	     *        either false to quit iteration or an array of length two to proceed. The element
	     *        at index 0 of this array will be added to the resulting array, and the element
	     *        at index 1 will be passed to the next call to `fn`.
	     * @param {*} seed The seed value.
	     * @return {Array} The final list.
	     * @example
	     *
	     *      var f = n => n > 50 ? false : [-n, n + 10];
	     *      R.unfold(f, 10); //=> [-10, -20, -30, -40, -50]
	     */var unfold=_curry2(function unfold(fn,seed){var pair=fn(seed);var result=[];while(pair&&pair.length){result[result.length]=pair[0];pair=fn(pair[1]);}return result;});/**
	     * Returns a new list containing only one copy of each element in the original
	     * list, based upon the value returned by applying the supplied predicate to
	     * two list elements. Prefers the first item if two items compare equal based
	     * on the predicate.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.0
	     * @category List
	     * @sig (a, a -> Boolean) -> [a] -> [a]
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {Array} list The array to consider.
	     * @return {Array} The list of unique items.
	     * @example
	     *
	     *      var strEq = R.eqBy(String);
	     *      R.uniqWith(strEq)([1, '1', 2, 1]); //=> [1, 2]
	     *      R.uniqWith(strEq)([{}, {}]);       //=> [{}]
	     *      R.uniqWith(strEq)([1, '1', 1]);    //=> [1]
	     *      R.uniqWith(strEq)(['1', 1, 1]);    //=> ['1']
	     */var uniqWith=_curry2(function uniqWith(pred,list){var idx=0;var len=list.length;var result=[];var item;while(idx<len){item=list[idx];if(!_containsWith(pred,item,result)){result[result.length]=item;}idx+=1;}return result;});/**
	     * Tests the final argument by passing it to the given predicate function. If
	     * the predicate is not satisfied, the function will return the result of
	     * calling the `whenFalseFn` function with the same argument. If the predicate
	     * is satisfied, the argument is returned as is.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.18.0
	     * @category Logic
	     * @sig (a -> Boolean) -> (a -> a) -> a -> a
	     * @param {Function} pred        A predicate function
	     * @param {Function} whenFalseFn A function to invoke when the `pred` evaluates
	     *                               to a falsy value.
	     * @param {*}        x           An object to test with the `pred` function and
	     *                               pass to `whenFalseFn` if necessary.
	     * @return {*} Either `x` or the result of applying `x` to `whenFalseFn`.
	     * @see R.ifElse, R.when
	     * @example
	     *
	     *      // coerceArray :: (a|[a]) -> [a]
	     *      var coerceArray = R.unless(R.isArrayLike, R.of);
	     *      coerceArray([1, 2, 3]); //=> [1, 2, 3]
	     *      coerceArray(1);         //=> [1]
	     */var unless=_curry3(function unless(pred,whenFalseFn,x){return pred(x)?x:whenFalseFn(x);});/**
	     * Takes a predicate, a transformation function, and an initial value,
	     * and returns a value of the same type as the initial value.
	     * It does so by applying the transformation until the predicate is satisfied,
	     * at which point it returns the satisfactory value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.20.0
	     * @category Logic
	     * @sig (a -> Boolean) -> (a -> a) -> a -> a
	     * @param {Function} pred A predicate function
	     * @param {Function} fn The iterator function
	     * @param {*} init Initial value
	     * @return {*} Final value that satisfies predicate
	     * @example
	     *
	     *      R.until(R.gt(R.__, 100), R.multiply(2))(1) // => 128
	     */var until=_curry3(function until(pred,fn,init){var val=init;while(!pred(val)){val=fn(val);}return val;});/**
	     * Returns a new copy of the array with the element at the provided index
	     * replaced with the given value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category List
	     * @sig Number -> a -> [a] -> [a]
	     * @param {Number} idx The index to update.
	     * @param {*} x The value to exist at the given index of the returned array.
	     * @param {Array|Arguments} list The source array-like object to be updated.
	     * @return {Array} A copy of `list` with the value at index `idx` replaced with `x`.
	     * @see R.adjust
	     * @example
	     *
	     *      R.update(1, 11, [0, 1, 2]);     //=> [0, 11, 2]
	     *      R.update(1)(11)([0, 1, 2]);     //=> [0, 11, 2]
	     */var update=_curry3(function update(idx,x,list){return adjust(always(x),idx,list);});/**
	     * Accepts a function `fn` and a list of transformer functions and returns a
	     * new curried function. When the new function is invoked, it calls the
	     * function `fn` with parameters consisting of the result of calling each
	     * supplied handler on successive arguments to the new function.
	     *
	     * If more arguments are passed to the returned function than transformer
	     * functions, those arguments are passed directly to `fn` as additional
	     * parameters. If you expect additional arguments that don't need to be
	     * transformed, although you can ignore them, it's best to pass an identity
	     * function so that the new function reports the correct arity.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (x1 -> x2 -> ... -> z) -> [(a -> x1), (b -> x2), ...] -> (a -> b -> ... -> z)
	     * @param {Function} fn The function to wrap.
	     * @param {Array} transformers A list of transformer functions
	     * @return {Function} The wrapped function.
	     * @example
	     *
	     *      R.useWith(Math.pow, [R.identity, R.identity])(3, 4); //=> 81
	     *      R.useWith(Math.pow, [R.identity, R.identity])(3)(4); //=> 81
	     *      R.useWith(Math.pow, [R.dec, R.inc])(3, 4); //=> 32
	     *      R.useWith(Math.pow, [R.dec, R.inc])(3)(4); //=> 32
	     */var useWith=_curry2(function useWith(fn,transformers){return curryN(transformers.length,function(){var args=[];var idx=0;while(idx<transformers.length){args.push(transformers[idx].call(this,arguments[idx]));idx+=1;}return fn.apply(this,args.concat(_slice(arguments,transformers.length)));});});/**
	     * Returns a list of all the enumerable own properties of the supplied object.
	     * Note that the order of the output array is not guaranteed across different
	     * JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig {k: v} -> [v]
	     * @param {Object} obj The object to extract values from
	     * @return {Array} An array of the values of the object's own properties.
	     * @example
	     *
	     *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
	     */var values=_curry1(function values(obj){var props=keys(obj);var len=props.length;var vals=[];var idx=0;while(idx<len){vals[idx]=obj[props[idx]];idx+=1;}return vals;});/**
	     * Returns a list of all the properties, including prototype properties, of the
	     * supplied object.
	     * Note that the order of the output array is not guaranteed to be consistent
	     * across different JS platforms.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.0
	     * @category Object
	     * @sig {k: v} -> [v]
	     * @param {Object} obj The object to extract values from
	     * @return {Array} An array of the values of the object's own and prototype properties.
	     * @example
	     *
	     *      var F = function() { this.x = 'X'; };
	     *      F.prototype.y = 'Y';
	     *      var f = new F();
	     *      R.valuesIn(f); //=> ['X', 'Y']
	     */var valuesIn=_curry1(function valuesIn(obj){var prop;var vs=[];for(prop in obj){vs[vs.length]=obj[prop];}return vs;});/**
	     * Returns a "view" of the given data structure, determined by the given lens.
	     * The lens's focus determines which portion of the data structure is visible.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category Object
	     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig Lens s a -> s -> a
	     * @param {Lens} lens
	     * @param {*} x
	     * @return {*}
	     * @see R.prop, R.lensIndex, R.lensProp
	     * @example
	     *
	     *      var xLens = R.lensProp('x');
	     *
	     *      R.view(xLens, {x: 1, y: 2});  //=> 1
	     *      R.view(xLens, {x: 4, y: 2});  //=> 4
	     */// `Const` is a functor that effectively ignores the function given to `map`.
	// Using `Const` effectively ignores the setter function of the `lens`,
	// leaving the value returned by the getter function unmodified.
	var view=function(){// `Const` is a functor that effectively ignores the function given to `map`.
	var Const=function Const(x){return{value:x,map:function map(){return this;}};};return _curry2(function view(lens,x){// Using `Const` effectively ignores the setter function of the `lens`,
	// leaving the value returned by the getter function unmodified.
	return lens(Const)(x).value;});}();/**
	     * Tests the final argument by passing it to the given predicate function. If
	     * the predicate is satisfied, the function will return the result of calling
	     * the `whenTrueFn` function with the same argument. If the predicate is not
	     * satisfied, the argument is returned as is.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.18.0
	     * @category Logic
	     * @sig (a -> Boolean) -> (a -> a) -> a -> a
	     * @param {Function} pred       A predicate function
	     * @param {Function} whenTrueFn A function to invoke when the `condition`
	     *                              evaluates to a truthy value.
	     * @param {*}        x          An object to test with the `pred` function and
	     *                              pass to `whenTrueFn` if necessary.
	     * @return {*} Either `x` or the result of applying `x` to `whenTrueFn`.
	     * @see R.ifElse, R.unless
	     * @example
	     *
	     *      // truncate :: String -> String
	     *      var truncate = R.when(
	     *        R.propSatisfies(R.gt(R.__, 10), 'length'),
	     *        R.pipe(R.take(10), R.append('…'), R.join(''))
	     *      );
	     *      truncate('12345');         //=> '12345'
	     *      truncate('0123456789ABC'); //=> '0123456789…'
	     */var when=_curry3(function when(pred,whenTrueFn,x){return pred(x)?whenTrueFn(x):x;});/**
	     * Takes a spec object and a test object; returns true if the test satisfies
	     * the spec. Each of the spec's own properties must be a predicate function.
	     * Each predicate is applied to the value of the corresponding property of the
	     * test object. `where` returns true if all the predicates return true, false
	     * otherwise.
	     *
	     * `where` is well suited to declaratively expressing constraints for other
	     * functions such as `filter` and `find`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.1
	     * @category Object
	     * @sig {String: (* -> Boolean)} -> {String: *} -> Boolean
	     * @param {Object} spec
	     * @param {Object} testObj
	     * @return {Boolean}
	     * @example
	     *
	     *      // pred :: Object -> Boolean
	     *      var pred = where({
	     *        a: equals('foo'),
	     *        b: complement(equals('bar')),
	     *        x: gt(__, 10),
	     *        y: lt(__, 20)
	     *      });
	     *
	     *      pred({a: 'foo', b: 'xxx', x: 11, y: 19}); //=> true
	     *      pred({a: 'xxx', b: 'xxx', x: 11, y: 19}); //=> false
	     *      pred({a: 'foo', b: 'bar', x: 11, y: 19}); //=> false
	     *      pred({a: 'foo', b: 'xxx', x: 10, y: 19}); //=> false
	     *      pred({a: 'foo', b: 'xxx', x: 11, y: 20}); //=> false
	     */var where=_curry2(function where(spec,testObj){for(var prop in spec){if(_has(prop,spec)&&!spec[prop](testObj[prop])){return false;}}return true;});/**
	     * Wrap a function inside another to allow you to make adjustments to the
	     * parameters, or do other processing either before the internal function is
	     * called or with its results.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (a... -> b) -> ((a... -> b) -> a... -> c) -> (a... -> c)
	     * @param {Function} fn The function to wrap.
	     * @param {Function} wrapper The wrapper function.
	     * @return {Function} The wrapped function.
	     * @deprecated since v0.22.0
	     * @example
	     *
	     *      var greet = name => 'Hello ' + name;
	     *
	     *      var shoutedGreet = R.wrap(greet, (gr, name) => gr(name).toUpperCase());
	     *
	     *      shoutedGreet("Kathy"); //=> "HELLO KATHY"
	     *
	     *      var shortenedGreet = R.wrap(greet, function(gr, name) {
	     *        return gr(name.substring(0, 3));
	     *      });
	     *      shortenedGreet("Robert"); //=> "Hello Rob"
	     */var wrap=_curry2(function wrap(fn,wrapper){return curryN(fn.length,function(){return wrapper.apply(this,_concat([fn],arguments));});});/**
	     * Creates a new list out of the two supplied by creating each possible pair
	     * from the lists.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [b] -> [[a,b]]
	     * @param {Array} as The first list.
	     * @param {Array} bs The second list.
	     * @return {Array} The list made by combining each possible pair from
	     *         `as` and `bs` into pairs (`[a, b]`).
	     * @example
	     *
	     *      R.xprod([1, 2], ['a', 'b']); //=> [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
	     */// = xprodWith(prepend); (takes about 3 times as long...)
	var xprod=_curry2(function xprod(a,b){// = xprodWith(prepend); (takes about 3 times as long...)
	var idx=0;var ilen=a.length;var j;var jlen=b.length;var result=[];while(idx<ilen){j=0;while(j<jlen){result[result.length]=[a[idx],b[j]];j+=1;}idx+=1;}return result;});/**
	     * Creates a new list out of the two supplied by pairing up equally-positioned
	     * items from both lists. The returned list is truncated to the length of the
	     * shorter of the two input lists.
	     * Note: `zip` is equivalent to `zipWith(function(a, b) { return [a, b] })`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [b] -> [[a,b]]
	     * @param {Array} list1 The first array to consider.
	     * @param {Array} list2 The second array to consider.
	     * @return {Array} The list made by pairing up same-indexed elements of `list1` and `list2`.
	     * @example
	     *
	     *      R.zip([1, 2, 3], ['a', 'b', 'c']); //=> [[1, 'a'], [2, 'b'], [3, 'c']]
	     */var zip=_curry2(function zip(a,b){var rv=[];var idx=0;var len=Math.min(a.length,b.length);while(idx<len){rv[idx]=[a[idx],b[idx]];idx+=1;}return rv;});/**
	     * Creates a new object out of a list of keys and a list of values.
	     * Key/value pairing is truncated to the length of the shorter of the two lists.
	     * Note: `zipObj` is equivalent to `pipe(zipWith(pair), fromPairs)`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category List
	     * @sig [String] -> [*] -> {String: *}
	     * @param {Array} keys The array that will be properties on the output object.
	     * @param {Array} values The list of values on the output object.
	     * @return {Object} The object made by pairing up same-indexed elements of `keys` and `values`.
	     * @example
	     *
	     *      R.zipObj(['a', 'b', 'c'], [1, 2, 3]); //=> {a: 1, b: 2, c: 3}
	     */var zipObj=_curry2(function zipObj(keys,values){var idx=0;var len=Math.min(keys.length,values.length);var out={};while(idx<len){out[keys[idx]]=values[idx];idx+=1;}return out;});/**
	     * Creates a new list out of the two supplied by applying the function to each
	     * equally-positioned pair in the lists. The returned list is truncated to the
	     * length of the shorter of the two input lists.
	     *
	     * @function
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a,b -> c) -> [a] -> [b] -> [c]
	     * @param {Function} fn The function used to combine the two elements into one value.
	     * @param {Array} list1 The first array to consider.
	     * @param {Array} list2 The second array to consider.
	     * @return {Array} The list made by combining same-indexed elements of `list1` and `list2`
	     *         using `fn`.
	     * @example
	     *
	     *      var f = (x, y) => {
	     *        // ...
	     *      };
	     *      R.zipWith(f, [1, 2, 3], ['a', 'b', 'c']);
	     *      //=> [f(1, 'a'), f(2, 'b'), f(3, 'c')]
	     */var zipWith=_curry3(function zipWith(fn,a,b){var rv=[];var idx=0;var len=Math.min(a.length,b.length);while(idx<len){rv[idx]=fn(a[idx],b[idx]);idx+=1;}return rv;});/**
	     * A function that always returns `false`. Any passed in parameters are ignored.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Function
	     * @sig * -> Boolean
	     * @param {*}
	     * @return {Boolean}
	     * @see R.always, R.T
	     * @example
	     *
	     *      R.F(); //=> false
	     */var F=always(false);/**
	     * A function that always returns `true`. Any passed in parameters are ignored.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Function
	     * @sig * -> Boolean
	     * @param {*}
	     * @return {Boolean}
	     * @see R.always, R.F
	     * @example
	     *
	     *      R.T(); //=> true
	     */var T=always(true);/**
	     * Copies an object.
	     *
	     * @private
	     * @param {*} value The value to be copied
	     * @param {Array} refFrom Array containing the source references
	     * @param {Array} refTo Array containing the copied source references
	     * @param {Boolean} deep Whether or not to perform deep cloning.
	     * @return {*} The copied value.
	     */var _clone=function _clone(value,refFrom,refTo,deep){var copy=function copy(copiedValue){var len=refFrom.length;var idx=0;while(idx<len){if(value===refFrom[idx]){return refTo[idx];}idx+=1;}refFrom[idx+1]=value;refTo[idx+1]=copiedValue;for(var key in value){copiedValue[key]=deep?_clone(value[key],refFrom,refTo,true):value[key];}return copiedValue;};switch(type(value)){case'Object':return copy({});case'Array':return copy([]);case'Date':return new Date(value.valueOf());case'RegExp':return _cloneRegExp(value);default:return value;}};var _createPartialApplicator=function _createPartialApplicator(concat){return _curry2(function(fn,args){return _arity(Math.max(0,fn.length-args.length),function(){return fn.apply(this,concat(args,arguments));});});};var _dropLast=function dropLast(n,xs){return take(n<xs.length?xs.length-n:0,xs);};// Values of other types are only equal if identical.
	var _equals=function _equals(a,b,stackA,stackB){if(identical(a,b)){return true;}if(type(a)!==type(b)){return false;}if(a==null||b==null){return false;}if(typeof a.equals==='function'||typeof b.equals==='function'){return typeof a.equals==='function'&&a.equals(b)&&typeof b.equals==='function'&&b.equals(a);}switch(type(a)){case'Arguments':case'Array':case'Object':if(typeof a.constructor==='function'&&_functionName(a.constructor)==='Promise'){return a===b;}break;case'Boolean':case'Number':case'String':if(!((typeof a==='undefined'?'undefined':_typeof(a))===(typeof b==='undefined'?'undefined':_typeof(b))&&identical(a.valueOf(),b.valueOf()))){return false;}break;case'Date':if(!identical(a.valueOf(),b.valueOf())){return false;}break;case'Error':return a.name===b.name&&a.message===b.message;case'RegExp':if(!(a.source===b.source&&a.global===b.global&&a.ignoreCase===b.ignoreCase&&a.multiline===b.multiline&&a.sticky===b.sticky&&a.unicode===b.unicode)){return false;}break;case'Map':case'Set':if(!_equals(_arrayFromIterator(a.entries()),_arrayFromIterator(b.entries()),stackA,stackB)){return false;}break;case'Int8Array':case'Uint8Array':case'Uint8ClampedArray':case'Int16Array':case'Uint16Array':case'Int32Array':case'Uint32Array':case'Float32Array':case'Float64Array':break;case'ArrayBuffer':break;default:// Values of other types are only equal if identical.
	return false;}var keysA=keys(a);if(keysA.length!==keys(b).length){return false;}var idx=stackA.length-1;while(idx>=0){if(stackA[idx]===a){return stackB[idx]===b;}idx-=1;}stackA.push(a);stackB.push(b);idx=keysA.length-1;while(idx>=0){var key=keysA[idx];if(!(_has(key,b)&&_equals(b[key],a[key],stackA,stackB))){return false;}idx-=1;}stackA.pop();stackB.pop();return true;};/**
	     * `_makeFlat` is a helper function that returns a one-level or fully recursive
	     * function based on the flag passed in.
	     *
	     * @private
	     */var _makeFlat=function _makeFlat(recursive){return function flatt(list){var value,jlen,j;var result=[];var idx=0;var ilen=list.length;while(idx<ilen){if(isArrayLike(list[idx])){value=recursive?flatt(list[idx]):list[idx];j=0;jlen=value.length;while(j<jlen){result[result.length]=value[j];j+=1;}}else{result[result.length]=list[idx];}idx+=1;}return result;};};var _reduce=function(){function _arrayReduce(xf,acc,list){var idx=0;var len=list.length;while(idx<len){acc=xf['@@transducer/step'](acc,list[idx]);if(acc&&acc['@@transducer/reduced']){acc=acc['@@transducer/value'];break;}idx+=1;}return xf['@@transducer/result'](acc);}function _iterableReduce(xf,acc,iter){var step=iter.next();while(!step.done){acc=xf['@@transducer/step'](acc,step.value);if(acc&&acc['@@transducer/reduced']){acc=acc['@@transducer/value'];break;}step=iter.next();}return xf['@@transducer/result'](acc);}function _methodReduce(xf,acc,obj){return xf['@@transducer/result'](obj.reduce(bind(xf['@@transducer/step'],xf),acc));}var symIterator=typeof Symbol!=='undefined'?Symbol.iterator:'@@iterator';return function _reduce(fn,acc,list){if(typeof fn==='function'){fn=_xwrap(fn);}if(isArrayLike(list)){return _arrayReduce(fn,acc,list);}if(typeof list.reduce==='function'){return _methodReduce(fn,acc,list);}if(list[symIterator]!=null){return _iterableReduce(fn,acc,list[symIterator]());}if(typeof list.next==='function'){return _iterableReduce(fn,acc,list);}throw new TypeError('reduce: list must be array or iterable');};}();var _stepCat=function(){var _stepCatArray={'@@transducer/init':Array,'@@transducer/step':function transducerStep(xs,x){xs.push(x);return xs;},'@@transducer/result':_identity};var _stepCatString={'@@transducer/init':String,'@@transducer/step':function transducerStep(a,b){return a+b;},'@@transducer/result':_identity};var _stepCatObject={'@@transducer/init':Object,'@@transducer/step':function transducerStep(result,input){return _assign(result,isArrayLike(input)?objOf(input[0],input[1]):input);},'@@transducer/result':_identity};return function _stepCat(obj){if(_isTransformer(obj)){return obj;}if(isArrayLike(obj)){return _stepCatArray;}if(typeof obj==='string'){return _stepCatString;}if((typeof obj==='undefined'?'undefined':_typeof(obj))==='object'){return _stepCatObject;}throw new Error('Cannot create transformer for '+obj);};}();var _xdropLastWhile=function(){function XDropLastWhile(fn,xf){this.f=fn;this.retained=[];this.xf=xf;}XDropLastWhile.prototype['@@transducer/init']=_xfBase.init;XDropLastWhile.prototype['@@transducer/result']=function(result){this.retained=null;return this.xf['@@transducer/result'](result);};XDropLastWhile.prototype['@@transducer/step']=function(result,input){return this.f(input)?this.retain(result,input):this.flush(result,input);};XDropLastWhile.prototype.flush=function(result,input){result=_reduce(this.xf['@@transducer/step'],result,this.retained);this.retained=[];return this.xf['@@transducer/step'](result,input);};XDropLastWhile.prototype.retain=function(result,input){this.retained.push(input);return result;};return _curry2(function _xdropLastWhile(fn,xf){return new XDropLastWhile(fn,xf);});}();/**
	     * Creates a new list iteration function from an existing one by adding two new
	     * parameters to its callback function: the current index, and the entire list.
	     *
	     * This would turn, for instance, Ramda's simple `map` function into one that
	     * more closely resembles `Array.prototype.map`. Note that this will only work
	     * for functions in which the iteration callback function is the first
	     * parameter, and where the list is the last parameter. (This latter might be
	     * unimportant if the list parameter is not used.)
	     *
	     * @func
	     * @memberOf R
	     * @since v0.15.0
	     * @category Function
	     * @category List
	     * @sig ((a ... -> b) ... -> [a] -> *) -> (a ..., Int, [a] -> b) ... -> [a] -> *)
	     * @param {Function} fn A list iteration function that does not pass index or list to its callback
	     * @return {Function} An altered list iteration function that passes (item, index, list) to its callback
	     * @example
	     *
	     *      var mapIndexed = R.addIndex(R.map);
	     *      mapIndexed((val, idx) => idx + '-' + val, ['f', 'o', 'o', 'b', 'a', 'r']);
	     *      //=> ['0-f', '1-o', '2-o', '3-b', '4-a', '5-r']
	     */var addIndex=_curry1(function addIndex(fn){return curryN(fn.length,function(){var idx=0;var origFn=arguments[0];var list=arguments[arguments.length-1];var args=_slice(arguments);args[0]=function(){var result=origFn.apply(this,_concat(arguments,[idx,list]));idx+=1;return result;};return fn.apply(this,args);});});/**
	     * Wraps a function of any arity (including nullary) in a function that accepts
	     * exactly 2 parameters. Any extraneous parameters will not be passed to the
	     * supplied function.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.2.0
	     * @category Function
	     * @sig (* -> c) -> (a, b -> c)
	     * @param {Function} fn The function to wrap.
	     * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
	     *         arity 2.
	     * @example
	     *
	     *      var takesThreeArgs = function(a, b, c) {
	     *        return [a, b, c];
	     *      };
	     *      takesThreeArgs.length; //=> 3
	     *      takesThreeArgs(1, 2, 3); //=> [1, 2, 3]
	     *
	     *      var takesTwoArgs = R.binary(takesThreeArgs);
	     *      takesTwoArgs.length; //=> 2
	     *      // Only 2 arguments are passed to the wrapped function
	     *      takesTwoArgs(1, 2, 3); //=> [1, 2, undefined]
	     */var binary=_curry1(function binary(fn){return nAry(2,fn);});/**
	     * Creates a deep copy of the value which may contain (nested) `Array`s and
	     * `Object`s, `Number`s, `String`s, `Boolean`s and `Date`s. `Function`s are not
	     * copied, but assigned by their reference.
	     *
	     * Dispatches to a `clone` method if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig {*} -> {*}
	     * @param {*} value The object or array to clone
	     * @return {*} A new object or array.
	     * @example
	     *
	     *      var objects = [{}, {}, {}];
	     *      var objectsClone = R.clone(objects);
	     *      objects[0] === objectsClone[0]; //=> false
	     */var clone=_curry1(function clone(value){return value!=null&&typeof value.clone==='function'?value.clone():_clone(value,[],[],true);});/**
	     * Returns a curried equivalent of the provided function. The curried function
	     * has two unusual capabilities. First, its arguments needn't be provided one
	     * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
	     * following are equivalent:
	     *
	     *   - `g(1)(2)(3)`
	     *   - `g(1)(2, 3)`
	     *   - `g(1, 2)(3)`
	     *   - `g(1, 2, 3)`
	     *
	     * Secondly, the special placeholder value `R.__` may be used to specify
	     * "gaps", allowing partial application of any combination of arguments,
	     * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	     * following are equivalent:
	     *
	     *   - `g(1, 2, 3)`
	     *   - `g(_, 2, 3)(1)`
	     *   - `g(_, _, 3)(1)(2)`
	     *   - `g(_, _, 3)(1, 2)`
	     *   - `g(_, 2)(1)(3)`
	     *   - `g(_, 2)(1, 3)`
	     *   - `g(_, 2)(_, 3)(1)`
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (* -> a) -> (* -> a)
	     * @param {Function} fn The function to curry.
	     * @return {Function} A new, curried function.
	     * @see R.curryN
	     * @example
	     *
	     *      var addFourNumbers = (a, b, c, d) => a + b + c + d;
	     *
	     *      var curriedAddFourNumbers = R.curry(addFourNumbers);
	     *      var f = curriedAddFourNumbers(1, 2);
	     *      var g = f(3);
	     *      g(4); //=> 10
	     */var curry=_curry1(function curry(fn){return curryN(fn.length,fn);});/**
	     * Returns all but the first `n` elements of the given list, string, or
	     * transducer/transformer (or object with a `drop` method).
	     *
	     * Dispatches to the `drop` method of the second argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Number -> [a] -> [a]
	     * @sig Number -> String -> String
	     * @param {Number} n
	     * @param {*} list
	     * @return {*}
	     * @see R.take, R.transduce
	     * @example
	     *
	     *      R.drop(1, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
	     *      R.drop(2, ['foo', 'bar', 'baz']); //=> ['baz']
	     *      R.drop(3, ['foo', 'bar', 'baz']); //=> []
	     *      R.drop(4, ['foo', 'bar', 'baz']); //=> []
	     *      R.drop(3, 'ramda');               //=> 'da'
	     */var drop=_curry2(_dispatchable('drop',_xdrop,function drop(n,xs){return slice(Math.max(0,n),Infinity,xs);}));/**
	     * Returns a list containing all but the last `n` elements of the given `list`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category List
	     * @sig Number -> [a] -> [a]
	     * @sig Number -> String -> String
	     * @param {Number} n The number of elements of `xs` to skip.
	     * @param {Array} xs The collection to consider.
	     * @return {Array}
	     * @see R.takeLast
	     * @example
	     *
	     *      R.dropLast(1, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
	     *      R.dropLast(2, ['foo', 'bar', 'baz']); //=> ['foo']
	     *      R.dropLast(3, ['foo', 'bar', 'baz']); //=> []
	     *      R.dropLast(4, ['foo', 'bar', 'baz']); //=> []
	     *      R.dropLast(3, 'ramda');               //=> 'ra'
	     */var dropLast=_curry2(_dispatchable('dropLast',_xdropLast,_dropLast));/**
	     * Returns a new list excluding all the tailing elements of a given list which
	     * satisfy the supplied predicate function. It passes each value from the right
	     * to the supplied predicate function, skipping elements while the predicate
	     * function returns `true`. The predicate function is applied to one argument:
	     * *(value)*.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category List
	     * @sig (a -> Boolean) -> [a] -> [a]
	     * @param {Function} fn The function called per iteration.
	     * @param {Array} list The collection to iterate over.
	     * @return {Array} A new array.
	     * @see R.takeLastWhile, R.addIndex
	     * @example
	     *
	     *      var lteThree = x => x <= 3;
	     *
	     *      R.dropLastWhile(lteThree, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3, 4]
	     */var dropLastWhile=_curry2(_dispatchable('dropLastWhile',_xdropLastWhile,_dropLastWhile));/**
	     * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
	     * cyclical data structures.
	     *
	     * Dispatches symmetrically to the `equals` methods of both arguments, if
	     * present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.15.0
	     * @category Relation
	     * @sig a -> b -> Boolean
	     * @param {*} a
	     * @param {*} b
	     * @return {Boolean}
	     * @example
	     *
	     *      R.equals(1, 1); //=> true
	     *      R.equals(1, '1'); //=> false
	     *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
	     *
	     *      var a = {}; a.v = a;
	     *      var b = {}; b.v = b;
	     *      R.equals(a, b); //=> true
	     */var equals=_curry2(function equals(a,b){return _equals(a,b,[],[]);});/**
	     * Takes a predicate and a "filterable", and returns a new filterable of the
	     * same type containing the members of the given filterable which satisfy the
	     * given predicate.
	     *
	     * Dispatches to the `filter` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Filterable f => (a -> Boolean) -> f a -> f a
	     * @param {Function} pred
	     * @param {Array} filterable
	     * @return {Array}
	     * @see R.reject, R.transduce, R.addIndex
	     * @example
	     *
	     *      var isEven = n => n % 2 === 0;
	     *
	     *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
	     *
	     *      R.filter(isEven, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
	     */// else
	var filter=_curry2(_dispatchable('filter',_xfilter,function(pred,filterable){return _isObject(filterable)?_reduce(function(acc,key){if(pred(filterable[key])){acc[key]=filterable[key];}return acc;},{},keys(filterable)):// else
	_filter(pred,filterable);}));/**
	     * Returns a new list by pulling every item out of it (and all its sub-arrays)
	     * and putting them in a new array, depth-first.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [b]
	     * @param {Array} list The array to consider.
	     * @return {Array} The flattened list.
	     * @see R.unnest
	     * @example
	     *
	     *      R.flatten([1, 2, [3, 4], 5, [6, [7, 8, [9, [10, 11], 12]]]]);
	     *      //=> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	     */var flatten=_curry1(_makeFlat(true));/**
	     * Returns a new function much like the supplied one, except that the first two
	     * arguments' order is reversed.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (a -> b -> c -> ... -> z) -> (b -> a -> c -> ... -> z)
	     * @param {Function} fn The function to invoke with its first two parameters reversed.
	     * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
	     * @example
	     *
	     *      var mergeThree = (a, b, c) => [].concat(a, b, c);
	     *
	     *      mergeThree(1, 2, 3); //=> [1, 2, 3]
	     *
	     *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
	     */var flip=_curry1(function flip(fn){return curry(function(a,b){var args=_slice(arguments);args[0]=b;args[1]=a;return fn.apply(this,args);});});/**
	     * Returns the first element of the given list or string. In some libraries
	     * this function is named `first`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> a | Undefined
	     * @sig String -> String
	     * @param {Array|String} list
	     * @return {*}
	     * @see R.tail, R.init, R.last
	     * @example
	     *
	     *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
	     *      R.head([]); //=> undefined
	     *
	     *      R.head('abc'); //=> 'a'
	     *      R.head(''); //=> ''
	     */var head=nth(0);/**
	     * Returns all but the last element of the given list or string.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category List
	     * @sig [a] -> [a]
	     * @sig String -> String
	     * @param {*} list
	     * @return {*}
	     * @see R.last, R.head, R.tail
	     * @example
	     *
	     *      R.init([1, 2, 3]);  //=> [1, 2]
	     *      R.init([1, 2]);     //=> [1]
	     *      R.init([1]);        //=> []
	     *      R.init([]);         //=> []
	     *
	     *      R.init('abc');  //=> 'ab'
	     *      R.init('ab');   //=> 'a'
	     *      R.init('a');    //=> ''
	     *      R.init('');     //=> ''
	     */var init=slice(0,-1);/**
	     * Combines two lists into a set (i.e. no duplicates) composed of those
	     * elements common to both lists. Duplication is determined according to the
	     * value returned by applying the supplied predicate to two list elements.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig (a -> a -> Boolean) -> [*] -> [*] -> [*]
	     * @param {Function} pred A predicate function that determines whether
	     *        the two supplied elements are equal.
	     * @param {Array} list1 One list of items to compare
	     * @param {Array} list2 A second list of items to compare
	     * @return {Array} A new list containing those elements common to both lists.
	     * @see R.intersection
	     * @example
	     *
	     *      var buffaloSpringfield = [
	     *        {id: 824, name: 'Richie Furay'},
	     *        {id: 956, name: 'Dewey Martin'},
	     *        {id: 313, name: 'Bruce Palmer'},
	     *        {id: 456, name: 'Stephen Stills'},
	     *        {id: 177, name: 'Neil Young'}
	     *      ];
	     *      var csny = [
	     *        {id: 204, name: 'David Crosby'},
	     *        {id: 456, name: 'Stephen Stills'},
	     *        {id: 539, name: 'Graham Nash'},
	     *        {id: 177, name: 'Neil Young'}
	     *      ];
	     *
	     *      R.intersectionWith(R.eqBy(R.prop('id')), buffaloSpringfield, csny);
	     *      //=> [{id: 456, name: 'Stephen Stills'}, {id: 177, name: 'Neil Young'}]
	     */var intersectionWith=_curry3(function intersectionWith(pred,list1,list2){var lookupList,filteredList;if(list1.length>list2.length){lookupList=list1;filteredList=list2;}else{lookupList=list2;filteredList=list1;}var results=[];var idx=0;while(idx<filteredList.length){if(_containsWith(pred,filteredList[idx],lookupList)){results[results.length]=filteredList[idx];}idx+=1;}return uniqWith(pred,results);});/**
	     * Transforms the items of the list with the transducer and appends the
	     * transformed items to the accumulator using an appropriate iterator function
	     * based on the accumulator type.
	     *
	     * The accumulator can be an array, string, object or a transformer. Iterated
	     * items will be appended to arrays and concatenated to strings. Objects will
	     * be merged directly or 2-item arrays will be merged as key, value pairs.
	     *
	     * The accumulator can also be a transformer object that provides a 2-arity
	     * reducing iterator function, step, 0-arity initial value function, init, and
	     * 1-arity result extraction function result. The step function is used as the
	     * iterator function in reduce. The result function is used to convert the
	     * final accumulator into the return type and in most cases is R.identity. The
	     * init function is used to provide the initial accumulator.
	     *
	     * The iteration is performed with R.reduce after initializing the transducer.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category List
	     * @sig a -> (b -> b) -> [c] -> a
	     * @param {*} acc The initial accumulator value.
	     * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @example
	     *
	     *      var numbers = [1, 2, 3, 4];
	     *      var transducer = R.compose(R.map(R.add(1)), R.take(2));
	     *
	     *      R.into([], transducer, numbers); //=> [2, 3]
	     *
	     *      var intoArray = R.into([]);
	     *      intoArray(transducer, numbers); //=> [2, 3]
	     */var into=_curry3(function into(acc,xf,list){return _isTransformer(acc)?_reduce(xf(acc),acc['@@transducer/init'](),list):_reduce(xf(_stepCat(acc)),_clone(acc,[],[],false),list);});/**
	     * Same as R.invertObj, however this accounts for objects with duplicate values
	     * by putting the values into an array.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Object
	     * @sig {s: x} -> {x: [ s, ... ]}
	     * @param {Object} obj The object or array to invert
	     * @return {Object} out A new object with keys
	     * in an array.
	     * @example
	     *
	     *      var raceResultsByFirstName = {
	     *        first: 'alice',
	     *        second: 'jake',
	     *        third: 'alice',
	     *      };
	     *      R.invert(raceResultsByFirstName);
	     *      //=> { 'alice': ['first', 'third'], 'jake':['second'] }
	     */var invert=_curry1(function invert(obj){var props=keys(obj);var len=props.length;var idx=0;var out={};while(idx<len){var key=props[idx];var val=obj[key];var list=_has(val,out)?out[val]:out[val]=[];list[list.length]=key;idx+=1;}return out;});/**
	     * Returns a new object with the keys of the given object as values, and the
	     * values of the given object, which are coerced to strings, as keys. Note
	     * that the last key found is preferred when handling the same value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Object
	     * @sig {s: x} -> {x: s}
	     * @param {Object} obj The object or array to invert
	     * @return {Object} out A new object
	     * @example
	     *
	     *      var raceResults = {
	     *        first: 'alice',
	     *        second: 'jake'
	     *      };
	     *      R.invertObj(raceResults);
	     *      //=> { 'alice': 'first', 'jake':'second' }
	     *
	     *      // Alternatively:
	     *      var raceResults = ['alice', 'jake'];
	     *      R.invertObj(raceResults);
	     *      //=> { 'alice': '0', 'jake':'1' }
	     */var invertObj=_curry1(function invertObj(obj){var props=keys(obj);var len=props.length;var idx=0;var out={};while(idx<len){var key=props[idx];out[obj[key]]=key;idx+=1;}return out;});/**
	     * Returns `true` if the given value is its type's empty value; `false`
	     * otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Logic
	     * @sig a -> Boolean
	     * @param {*} x
	     * @return {Boolean}
	     * @see R.empty
	     * @example
	     *
	     *      R.isEmpty([1, 2, 3]);   //=> false
	     *      R.isEmpty([]);          //=> true
	     *      R.isEmpty('');          //=> true
	     *      R.isEmpty(null);        //=> false
	     *      R.isEmpty({});          //=> true
	     *      R.isEmpty({length: 0}); //=> false
	     */var isEmpty=_curry1(function isEmpty(x){return x!=null&&equals(x,empty(x));});/**
	     * Returns the last element of the given list or string.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.4
	     * @category List
	     * @sig [a] -> a | Undefined
	     * @sig String -> String
	     * @param {*} list
	     * @return {*}
	     * @see R.init, R.head, R.tail
	     * @example
	     *
	     *      R.last(['fi', 'fo', 'fum']); //=> 'fum'
	     *      R.last([]); //=> undefined
	     *
	     *      R.last('abc'); //=> 'c'
	     *      R.last(''); //=> ''
	     */var last=nth(-1);/**
	     * Returns the position of the last occurrence of an item in an array, or -1 if
	     * the item is not included in the array. `R.equals` is used to determine
	     * equality.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig a -> [a] -> Number
	     * @param {*} target The item to find.
	     * @param {Array} xs The array to search in.
	     * @return {Number} the index of the target, or -1 if the target is not found.
	     * @see R.indexOf
	     * @example
	     *
	     *      R.lastIndexOf(3, [-1,3,3,0,1,2,3,4]); //=> 6
	     *      R.lastIndexOf(10, [1,2,3,4]); //=> -1
	     */var lastIndexOf=_curry2(function lastIndexOf(target,xs){if(typeof xs.lastIndexOf==='function'&&!_isArray(xs)){return xs.lastIndexOf(target);}else{var idx=xs.length-1;while(idx>=0){if(equals(xs[idx],target)){return idx;}idx-=1;}return-1;}});/**
	     * Takes a function and
	     * a [functor](https://github.com/fantasyland/fantasy-land#functor),
	     * applies the function to each of the functor's values, and returns
	     * a functor of the same shape.
	     *
	     * Ramda provides suitable `map` implementations for `Array` and `Object`,
	     * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
	     *
	     * Dispatches to the `map` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * Also treats functions as functors and will compose them together.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Functor f => (a -> b) -> f a -> f b
	     * @param {Function} fn The function to be called on every element of the input `list`.
	     * @param {Array} list The list to be iterated over.
	     * @return {Array} The new list.
	     * @see R.transduce, R.addIndex
	     * @example
	     *
	     *      var double = x => x * 2;
	     *
	     *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
	     *
	     *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
	     */var map=_curry2(_dispatchable('map',_xmap,function map(fn,functor){switch(Object.prototype.toString.call(functor)){case'[object Function]':return curryN(functor.length,function(){return fn.call(this,functor.apply(this,arguments));});case'[object Object]':return _reduce(function(acc,key){acc[key]=fn(functor[key]);return acc;},{},keys(functor));default:return _map(fn,functor);}}));/**
	     * An Object-specific version of `map`. The function is applied to three
	     * arguments: *(value, key, obj)*. If only the value is significant, use
	     * `map` instead.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Object
	     * @sig ((*, String, Object) -> *) -> Object -> Object
	     * @param {Function} fn
	     * @param {Object} obj
	     * @return {Object}
	     * @see R.map
	     * @example
	     *
	     *      var values = { x: 1, y: 2, z: 3 };
	     *      var prependKeyAndDouble = (num, key, obj) => key + (num * 2);
	     *
	     *      R.mapObjIndexed(prependKeyAndDouble, values); //=> { x: 'x2', y: 'y4', z: 'z6' }
	     */var mapObjIndexed=_curry2(function mapObjIndexed(fn,obj){return _reduce(function(acc,key){acc[key]=fn(obj[key],key,obj);return acc;},{},keys(obj));});/**
	     * Creates a new object with the own properties of the two provided objects. If
	     * a key exists in both objects, the provided function is applied to the values
	     * associated with the key in each object, with the result being used as the
	     * value associated with the key in the returned object. The key will be
	     * excluded from the returned object if the resulting value is `undefined`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category Object
	     * @sig (a -> a -> a) -> {a} -> {a} -> {a}
	     * @param {Function} fn
	     * @param {Object} l
	     * @param {Object} r
	     * @return {Object}
	     * @see R.merge, R.mergeWithKey
	     * @example
	     *
	     *      R.mergeWith(R.concat,
	     *                  { a: true, values: [10, 20] },
	     *                  { b: true, values: [15, 35] });
	     *      //=> { a: true, b: true, values: [10, 20, 15, 35] }
	     */var mergeWith=_curry3(function mergeWith(fn,l,r){return mergeWithKey(function(_,_l,_r){return fn(_l,_r);},l,r);});/**
	     * Takes a function `f` and a list of arguments, and returns a function `g`.
	     * When applied, `g` returns the result of applying `f` to the arguments
	     * provided initially followed by the arguments provided to `g`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category Function
	     * @sig ((a, b, c, ..., n) -> x) -> [a, b, c, ...] -> ((d, e, f, ..., n) -> x)
	     * @param {Function} f
	     * @param {Array} args
	     * @return {Function}
	     * @see R.partialRight
	     * @example
	     *
	     *      var multiply = (a, b) => a * b;
	     *      var double = R.partial(multiply, [2]);
	     *      double(2); //=> 4
	     *
	     *      var greet = (salutation, title, firstName, lastName) =>
	     *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
	     *
	     *      var sayHello = R.partial(greet, ['Hello']);
	     *      var sayHelloToMs = R.partial(sayHello, ['Ms.']);
	     *      sayHelloToMs('Jane', 'Jones'); //=> 'Hello, Ms. Jane Jones!'
	     */var partial=_createPartialApplicator(_concat);/**
	     * Takes a function `f` and a list of arguments, and returns a function `g`.
	     * When applied, `g` returns the result of applying `f` to the arguments
	     * provided to `g` followed by the arguments provided initially.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category Function
	     * @sig ((a, b, c, ..., n) -> x) -> [d, e, f, ..., n] -> ((a, b, c, ...) -> x)
	     * @param {Function} f
	     * @param {Array} args
	     * @return {Function}
	     * @see R.partial
	     * @example
	     *
	     *      var greet = (salutation, title, firstName, lastName) =>
	     *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
	     *
	     *      var greetMsJaneJones = R.partialRight(greet, ['Ms.', 'Jane', 'Jones']);
	     *
	     *      greetMsJaneJones('Hello'); //=> 'Hello, Ms. Jane Jones!'
	     */var partialRight=_createPartialApplicator(flip(_concat));/**
	     * Determines whether a nested path on an object has a specific value, in
	     * `R.equals` terms. Most likely used to filter a list.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Relation
	     * @sig [String] -> * -> {String: *} -> Boolean
	     * @param {Array} path The path of the nested property to use
	     * @param {*} val The value to compare the nested property with
	     * @param {Object} obj The object to check the nested property in
	     * @return {Boolean} `true` if the value equals the nested object property,
	     *         `false` otherwise.
	     * @example
	     *
	     *      var user1 = { address: { zipCode: 90210 } };
	     *      var user2 = { address: { zipCode: 55555 } };
	     *      var user3 = { name: 'Bob' };
	     *      var users = [ user1, user2, user3 ];
	     *      var isFamous = R.pathEq(['address', 'zipCode'], 90210);
	     *      R.filter(isFamous, users); //=> [ user1 ]
	     */var pathEq=_curry3(function pathEq(_path,val,obj){return equals(path(_path,obj),val);});/**
	     * Returns a new list by plucking the same named property off all objects in
	     * the list supplied.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig k -> [{k: v}] -> [v]
	     * @param {Number|String} key The key name to pluck off of each object.
	     * @param {Array} list The array to consider.
	     * @return {Array} The list of values for the given key.
	     * @see R.props
	     * @example
	     *
	     *      R.pluck('a')([{a: 1}, {a: 2}]); //=> [1, 2]
	     *      R.pluck(0)([[1, 2], [3, 4]]);   //=> [1, 3]
	     */var pluck=_curry2(function pluck(p,list){return map(prop(p),list);});/**
	     * Reasonable analog to SQL `select` statement.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @category Relation
	     * @sig [k] -> [{k: v}] -> [{k: v}]
	     * @param {Array} props The property names to project
	     * @param {Array} objs The objects to query
	     * @return {Array} An array of objects with just the `props` properties.
	     * @example
	     *
	     *      var abby = {name: 'Abby', age: 7, hair: 'blond', grade: 2};
	     *      var fred = {name: 'Fred', age: 12, hair: 'brown', grade: 7};
	     *      var kids = [abby, fred];
	     *      R.project(['name', 'grade'], kids); //=> [{name: 'Abby', grade: 2}, {name: 'Fred', grade: 7}]
	     */// passing `identity` gives correct arity
	var project=useWith(_map,[pickAll,identity]);/**
	     * Returns `true` if the specified object property is equal, in `R.equals`
	     * terms, to the given value; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig String -> a -> Object -> Boolean
	     * @param {String} name
	     * @param {*} val
	     * @param {*} obj
	     * @return {Boolean}
	     * @see R.equals, R.propSatisfies
	     * @example
	     *
	     *      var abby = {name: 'Abby', age: 7, hair: 'blond'};
	     *      var fred = {name: 'Fred', age: 12, hair: 'brown'};
	     *      var rusty = {name: 'Rusty', age: 10, hair: 'brown'};
	     *      var alois = {name: 'Alois', age: 15, disposition: 'surly'};
	     *      var kids = [abby, fred, rusty, alois];
	     *      var hasBrownHair = R.propEq('hair', 'brown');
	     *      R.filter(hasBrownHair, kids); //=> [fred, rusty]
	     */var propEq=_curry3(function propEq(name,val,obj){return equals(val,obj[name]);});/**
	     * Returns a single item by iterating through the list, successively calling
	     * the iterator function and passing it an accumulator value and the current
	     * value from the array, and then passing the result to the next call.
	     *
	     * The iterator function receives two values: *(acc, value)*. It may use
	     * `R.reduced` to shortcut the iteration.
	     *
	     * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
	     * arrays), unlike the native `Array.prototype.reduce` method. For more details
	     * on this behavior, see:
	     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
	     *
	     * Dispatches to the `reduce` method of the third argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig ((a, b) -> a) -> a -> [b] -> a
	     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	     *        current element from the array.
	     * @param {*} acc The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @see R.reduced, R.addIndex
	     * @example
	     *
	     *      var numbers = [1, 2, 3];
	     *      var plus = (a, b) => a + b;
	     *
	     *      R.reduce(plus, 10, numbers); //=> 16
	     */var reduce=_curry3(_reduce);/**
	     * Groups the elements of the list according to the result of calling
	     * the String-returning function `keyFn` on each element and reduces the elements
	     * of each group to a single value via the reducer function `valueFn`.
	     *
	     * This function is basically a more general `groupBy` function.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.20.0
	     * @category List
	     * @sig ((a, b) -> a) -> a -> (b -> String) -> [b] -> {String: a}
	     * @param {Function} valueFn The function that reduces the elements of each group to a single
	     *        value. Receives two values, accumulator for a particular group and the current element.
	     * @param {*} acc The (initial) accumulator value for each group.
	     * @param {Function} keyFn The function that maps the list's element into a key.
	     * @param {Array} list The array to group.
	     * @return {Object} An object with the output of `keyFn` for keys, mapped to the output of
	     *         `valueFn` for elements which produced that key when passed to `keyFn`.
	     * @see R.groupBy, R.reduce
	     * @example
	     *
	     *      var reduceToNamesBy = R.reduceBy((acc, student) => acc.concat(student.name), []);
	     *      var namesByGrade = reduceToNamesBy(function(student) {
	     *        var score = student.score;
	     *        return score < 65 ? 'F' :
	     *               score < 70 ? 'D' :
	     *               score < 80 ? 'C' :
	     *               score < 90 ? 'B' : 'A';
	     *      });
	     *      var students = [{name: 'Lucy', score: 92},
	     *                      {name: 'Drew', score: 85},
	     *                      // ...
	     *                      {name: 'Bart', score: 62}];
	     *      namesByGrade(students);
	     *      // {
	     *      //   'A': ['Lucy'],
	     *      //   'B': ['Drew']
	     *      //   // ...,
	     *      //   'F': ['Bart']
	     *      // }
	     */var reduceBy=_curryN(4,[],_dispatchable('reduceBy',_xreduceBy,function reduceBy(valueFn,valueAcc,keyFn,list){return _reduce(function(acc,elt){var key=keyFn(elt);acc[key]=valueFn(_has(key,acc)?acc[key]:valueAcc,elt);return acc;},{},list);}));/**
	     * Like `reduce`, `reduceWhile` returns a single item by iterating through
	     * the list, successively calling the iterator function. `reduceWhile` also
	     * takes a predicate that is evaluated before each step. If the predicate returns
	     * `false`, it "short-circuits" the iteration and returns the current value
	     * of the accumulator.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.22.0
	     * @category List
	     * @sig ((a, b) -> Boolean) -> ((a, b) -> a) -> a -> [b] -> a
	     * @param {Function} pred The predicate. It is passed the accumulator and the
	     *        current element.
	     * @param {Function} fn The iterator function. Receives two values, the
	     *        accumulator and the current element.
	     * @param {*} a The accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @see R.reduce, R.reduced
	     * @example
	     *
	     *      var isOdd = (acc, x) => x % 2 === 1;
	     *      var xs = [1, 3, 5, 60, 777, 800];
	     *      R.reduceWhile(isOdd, R.add, 0, xs); //=> 9
	     *
	     *      var ys = [2, 4, 6]
	     *      R.reduceWhile(isOdd, R.add, 111, ys); //=> 111
	     */var reduceWhile=_curryN(4,[],function _reduceWhile(pred,fn,a,list){return _reduce(function(acc,x){return pred(acc,x)?fn(acc,x):_reduced(acc);},a,list);});/**
	     * The complement of `filter`.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig Filterable f => (a -> Boolean) -> f a -> f a
	     * @param {Function} pred
	     * @param {Array} filterable
	     * @return {Array}
	     * @see R.filter, R.transduce, R.addIndex
	     * @example
	     *
	     *      var isOdd = (n) => n % 2 === 1;
	     *
	     *      R.reject(isOdd, [1, 2, 3, 4]); //=> [2, 4]
	     *
	     *      R.reject(isOdd, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
	     */var reject=_curry2(function reject(pred,filterable){return filter(_complement(pred),filterable);});/**
	     * Returns a fixed list of size `n` containing a specified identical value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.1
	     * @category List
	     * @sig a -> n -> [a]
	     * @param {*} value The value to repeat.
	     * @param {Number} n The desired size of the output list.
	     * @return {Array} A new array containing `n` `value`s.
	     * @example
	     *
	     *      R.repeat('hi', 5); //=> ['hi', 'hi', 'hi', 'hi', 'hi']
	     *
	     *      var obj = {};
	     *      var repeatedObjs = R.repeat(obj, 5); //=> [{}, {}, {}, {}, {}]
	     *      repeatedObjs[0] === repeatedObjs[1]; //=> true
	     */var repeat=_curry2(function repeat(value,n){return times(always(value),n);});/**
	     * Adds together all the elements of a list.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Math
	     * @sig [Number] -> Number
	     * @param {Array} list An array of numbers
	     * @return {Number} The sum of all the numbers in the list.
	     * @see R.reduce
	     * @example
	     *
	     *      R.sum([2,4,6,8,100,1]); //=> 121
	     */var sum=reduce(add,0);/**
	     * Returns a new list containing the last `n` elements of the given list.
	     * If `n > list.length`, returns a list of `list.length` elements.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category List
	     * @sig Number -> [a] -> [a]
	     * @sig Number -> String -> String
	     * @param {Number} n The number of elements to return.
	     * @param {Array} xs The collection to consider.
	     * @return {Array}
	     * @see R.dropLast
	     * @example
	     *
	     *      R.takeLast(1, ['foo', 'bar', 'baz']); //=> ['baz']
	     *      R.takeLast(2, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
	     *      R.takeLast(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
	     *      R.takeLast(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
	     *      R.takeLast(3, 'ramda');               //=> 'mda'
	     */var takeLast=_curry2(function takeLast(n,xs){return drop(n>=0?xs.length-n:0,xs);});/**
	     * Initializes a transducer using supplied iterator function. Returns a single
	     * item by iterating through the list, successively calling the transformed
	     * iterator function and passing it an accumulator value and the current value
	     * from the array, and then passing the result to the next call.
	     *
	     * The iterator function receives two values: *(acc, value)*. It will be
	     * wrapped as a transformer to initialize the transducer. A transformer can be
	     * passed directly in place of an iterator function. In both cases, iteration
	     * may be stopped early with the `R.reduced` function.
	     *
	     * A transducer is a function that accepts a transformer and returns a
	     * transformer and can be composed directly.
	     *
	     * A transformer is an an object that provides a 2-arity reducing iterator
	     * function, step, 0-arity initial value function, init, and 1-arity result
	     * extraction function, result. The step function is used as the iterator
	     * function in reduce. The result function is used to convert the final
	     * accumulator into the return type and in most cases is R.identity. The init
	     * function can be used to provide an initial accumulator, but is ignored by
	     * transduce.
	     *
	     * The iteration is performed with R.reduce after initializing the transducer.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category List
	     * @sig (c -> c) -> (a,b -> a) -> a -> [b] -> a
	     * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
	     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	     *        current element from the array. Wrapped as transformer, if necessary, and used to
	     *        initialize the transducer
	     * @param {*} acc The initial accumulator value.
	     * @param {Array} list The list to iterate over.
	     * @return {*} The final, accumulated value.
	     * @see R.reduce, R.reduced, R.into
	     * @example
	     *
	     *      var numbers = [1, 2, 3, 4];
	     *      var transducer = R.compose(R.map(R.add(1)), R.take(2));
	     *
	     *      R.transduce(transducer, R.flip(R.append), [], numbers); //=> [2, 3]
	     */var transduce=curryN(4,function transduce(xf,fn,acc,list){return _reduce(xf(typeof fn==='function'?_xwrap(fn):fn),acc,list);});/**
	     * Combines two lists into a set (i.e. no duplicates) composed of the elements
	     * of each list. Duplication is determined according to the value returned by
	     * applying the supplied predicate to two list elements.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig (a -> a -> Boolean) -> [*] -> [*] -> [*]
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @return {Array} The first and second lists concatenated, with
	     *         duplicates removed.
	     * @see R.union
	     * @example
	     *
	     *      var l1 = [{a: 1}, {a: 2}];
	     *      var l2 = [{a: 1}, {a: 4}];
	     *      R.unionWith(R.eqBy(R.prop('a')), l1, l2); //=> [{a: 1}, {a: 2}, {a: 4}]
	     */var unionWith=_curry3(function unionWith(pred,list1,list2){return uniqWith(pred,_concat(list1,list2));});/**
	     * Takes a spec object and a test object; returns true if the test satisfies
	     * the spec, false otherwise. An object satisfies the spec if, for each of the
	     * spec's own properties, accessing that property of the object gives the same
	     * value (in `R.equals` terms) as accessing that property of the spec.
	     *
	     * `whereEq` is a specialization of [`where`](#where).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category Object
	     * @sig {String: *} -> {String: *} -> Boolean
	     * @param {Object} spec
	     * @param {Object} testObj
	     * @return {Boolean}
	     * @see R.where
	     * @example
	     *
	     *      // pred :: Object -> Boolean
	     *      var pred = R.whereEq({a: 1, b: 2});
	     *
	     *      pred({a: 1});              //=> false
	     *      pred({a: 1, b: 2});        //=> true
	     *      pred({a: 1, b: 2, c: 3});  //=> true
	     *      pred({a: 1, b: 1});        //=> false
	     */var whereEq=_curry2(function whereEq(spec,testObj){return where(map(equals,spec),testObj);});var _flatCat=function(){var preservingReduced=function preservingReduced(xf){return{'@@transducer/init':_xfBase.init,'@@transducer/result':function transducerResult(result){return xf['@@transducer/result'](result);},'@@transducer/step':function transducerStep(result,input){var ret=xf['@@transducer/step'](result,input);return ret['@@transducer/reduced']?_forceReduced(ret):ret;}};};return function _xcat(xf){var rxf=preservingReduced(xf);return{'@@transducer/init':_xfBase.init,'@@transducer/result':function transducerResult(result){return rxf['@@transducer/result'](result);},'@@transducer/step':function transducerStep(result,input){return!isArrayLike(input)?_reduce(rxf,result,[input]):_reduce(rxf,result,input);}};};}();// Array.prototype.indexOf doesn't exist below IE9
	// manually crawl the list to distinguish between +0 and -0
	// NaN
	// non-zero numbers can utilise Set
	// all these types can utilise Set
	// null can utilise Set
	// anything else not covered above, defer to R.equals
	var _indexOf=function _indexOf(list,a,idx){var inf,item;// Array.prototype.indexOf doesn't exist below IE9
	if(typeof list.indexOf==='function'){switch(typeof a==='undefined'?'undefined':_typeof(a)){case'number':if(a===0){// manually crawl the list to distinguish between +0 and -0
	inf=1/a;while(idx<list.length){item=list[idx];if(item===0&&1/item===inf){return idx;}idx+=1;}return-1;}else if(a!==a){// NaN
	while(idx<list.length){item=list[idx];if(typeof item==='number'&&item!==item){return idx;}idx+=1;}return-1;}// non-zero numbers can utilise Set
	return list.indexOf(a,idx);// all these types can utilise Set
	case'string':case'boolean':case'function':case'undefined':return list.indexOf(a,idx);case'object':if(a===null){// null can utilise Set
	return list.indexOf(a,idx);}}}// anything else not covered above, defer to R.equals
	while(idx<list.length){if(equals(list[idx],a)){return idx;}idx+=1;}return-1;};var _xchain=_curry2(function _xchain(f,xf){return map(f,_flatCat(xf));});/**
	     * Takes a list of predicates and returns a predicate that returns true for a
	     * given list of arguments if every one of the provided predicates is satisfied
	     * by those arguments.
	     *
	     * The function returned is a curried function whose arity matches that of the
	     * highest-arity predicate.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Logic
	     * @sig [(*... -> Boolean)] -> (*... -> Boolean)
	     * @param {Array} preds
	     * @return {Function}
	     * @see R.anyPass
	     * @example
	     *
	     *      var isQueen = R.propEq('rank', 'Q');
	     *      var isSpade = R.propEq('suit', '♠︎');
	     *      var isQueenOfSpades = R.allPass([isQueen, isSpade]);
	     *
	     *      isQueenOfSpades({rank: 'Q', suit: '♣︎'}); //=> false
	     *      isQueenOfSpades({rank: 'Q', suit: '♠︎'}); //=> true
	     */var allPass=_curry1(function allPass(preds){return curryN(reduce(max,0,pluck('length',preds)),function(){var idx=0;var len=preds.length;while(idx<len){if(!preds[idx].apply(this,arguments)){return false;}idx+=1;}return true;});});/**
	     * Takes a list of predicates and returns a predicate that returns true for a
	     * given list of arguments if at least one of the provided predicates is
	     * satisfied by those arguments.
	     *
	     * The function returned is a curried function whose arity matches that of the
	     * highest-arity predicate.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Logic
	     * @sig [(*... -> Boolean)] -> (*... -> Boolean)
	     * @param {Array} preds
	     * @return {Function}
	     * @see R.allPass
	     * @example
	     *
	     *      var gte = R.anyPass([R.gt, R.equals]);
	     *
	     *      gte(3, 2); //=> true
	     *      gte(2, 2); //=> true
	     *      gte(2, 3); //=> false
	     */var anyPass=_curry1(function anyPass(preds){return curryN(reduce(max,0,pluck('length',preds)),function(){var idx=0;var len=preds.length;while(idx<len){if(preds[idx].apply(this,arguments)){return true;}idx+=1;}return false;});});/**
	     * ap applies a list of functions to a list of values.
	     *
	     * Dispatches to the `ap` method of the second argument, if present. Also
	     * treats curried functions as applicatives.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category Function
	     * @sig [a -> b] -> [a] -> [b]
	     * @sig Apply f => f (a -> b) -> f a -> f b
	     * @param {Array} fns An array of functions
	     * @param {Array} vs An array of values
	     * @return {Array} An array of results of applying each of `fns` to all of `vs` in turn.
	     * @example
	     *
	     *      R.ap([R.multiply(2), R.add(3)], [1,2,3]); //=> [2, 4, 6, 4, 5, 6]
	     */// else
	var ap=_curry2(function ap(applicative,fn){return typeof applicative.ap==='function'?applicative.ap(fn):typeof applicative==='function'?function(x){return applicative(x)(fn(x));}:// else
	_reduce(function(acc,f){return _concat(acc,map(f,fn));},[],applicative);});/**
	     * Given a spec object recursively mapping properties to functions, creates a
	     * function producing an object of the same structure, by mapping each property
	     * to the result of calling its associated function with the supplied arguments.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.20.0
	     * @category Function
	     * @sig {k: ((a, b, ..., m) -> v)} -> ((a, b, ..., m) -> {k: v})
	     * @param {Object} spec an object recursively mapping properties to functions for
	     *        producing the values for these properties.
	     * @return {Function} A function that returns an object of the same structure
	     * as `spec', with each property set to the value returned by calling its
	     * associated function with the supplied arguments.
	     * @see R.converge, R.juxt
	     * @example
	     *
	     *      var getMetrics = R.applySpec({
	     *                                      sum: R.add,
	     *                                      nested: { mul: R.multiply }
	     *                                   });
	     *      getMetrics(2, 4); // => { sum: 6, nested: { mul: 8 } }
	     */var applySpec=_curry1(function applySpec(spec){spec=map(function(v){return typeof v=='function'?v:applySpec(v);},spec);return curryN(reduce(max,0,pluck('length',values(spec))),function(){var args=arguments;return map(function(f){return apply(f,args);},spec);});});/**
	     * Returns the result of calling its first argument with the remaining
	     * arguments. This is occasionally useful as a converging function for
	     * `R.converge`: the left branch can produce a function while the right branch
	     * produces a value to be passed to that function as an argument.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category Function
	     * @sig (*... -> a),*... -> a
	     * @param {Function} fn The function to apply to the remaining arguments.
	     * @param {...*} args Any number of positional arguments.
	     * @return {*}
	     * @see R.apply
	     * @example
	     *
	     *      var indentN = R.pipe(R.times(R.always(' ')),
	     *                           R.join(''),
	     *                           R.replace(/^(?!$)/gm));
	     *
	     *      var format = R.converge(R.call, [
	     *                                  R.pipe(R.prop('indent'), indentN),
	     *                                  R.prop('value')
	     *                              ]);
	     *
	     *      format({indent: 2, value: 'foo\nbar\nbaz\n'}); //=> '  foo\n  bar\n  baz\n'
	     */var call=curry(function call(fn){return fn.apply(this,_slice(arguments,1));});/**
	     * `chain` maps a function over a list and concatenates the results. `chain`
	     * is also known as `flatMap` in some libraries
	     *
	     * Dispatches to the `chain` method of the second argument, if present,
	     * according to the [FantasyLand Chain spec](https://github.com/fantasyland/fantasy-land#chain).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category List
	     * @sig Chain m => (a -> m b) -> m a -> m b
	     * @param {Function} fn
	     * @param {Array} list
	     * @return {Array}
	     * @example
	     *
	     *      var duplicate = n => [n, n];
	     *      R.chain(duplicate, [1, 2, 3]); //=> [1, 1, 2, 2, 3, 3]
	     */var chain=_curry2(_dispatchable('chain',_xchain,function chain(fn,monad){if(typeof monad==='function'){return function(){return monad.call(this,fn.apply(this,arguments)).apply(this,arguments);};}return _makeFlat(false)(map(fn,monad));}));/**
	     * Returns a function, `fn`, which encapsulates if/else-if/else logic.
	     * `R.cond` takes a list of [predicate, transform] pairs. All of the arguments
	     * to `fn` are applied to each of the predicates in turn until one returns a
	     * "truthy" value, at which point `fn` returns the result of applying its
	     * arguments to the corresponding transformer. If none of the predicates
	     * matches, `fn` returns undefined.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.6.0
	     * @category Logic
	     * @sig [[(*... -> Boolean),(*... -> *)]] -> (*... -> *)
	     * @param {Array} pairs
	     * @return {Function}
	     * @example
	     *
	     *      var fn = R.cond([
	     *        [R.equals(0),   R.always('water freezes at 0°C')],
	     *        [R.equals(100), R.always('water boils at 100°C')],
	     *        [R.T,           temp => 'nothing special happens at ' + temp + '°C']
	     *      ]);
	     *      fn(0); //=> 'water freezes at 0°C'
	     *      fn(50); //=> 'nothing special happens at 50°C'
	     *      fn(100); //=> 'water boils at 100°C'
	     */var cond=_curry1(function cond(pairs){var arity=reduce(max,0,map(function(pair){return pair[0].length;},pairs));return _arity(arity,function(){var idx=0;while(idx<pairs.length){if(pairs[idx][0].apply(this,arguments)){return pairs[idx][1].apply(this,arguments);}idx+=1;}});});/**
	     * Wraps a constructor function inside a curried function that can be called
	     * with the same arguments and returns the same type. The arity of the function
	     * returned is specified to allow using variadic constructor functions.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.4.0
	     * @category Function
	     * @sig Number -> (* -> {*}) -> (* -> {*})
	     * @param {Number} n The arity of the constructor function.
	     * @param {Function} Fn The constructor function to wrap.
	     * @return {Function} A wrapped, curried constructor function.
	     * @example
	     *
	     *      // Variadic constructor function
	     *      var Widget = () => {
	     *        this.children = Array.prototype.slice.call(arguments);
	     *        // ...
	     *      };
	     *      Widget.prototype = {
	     *        // ...
	     *      };
	     *      var allConfigs = [
	     *        // ...
	     *      ];
	     *      R.map(R.constructN(1, Widget), allConfigs); // a list of Widgets
	     */var constructN=_curry2(function constructN(n,Fn){if(n>10){throw new Error('Constructor with greater than ten arguments');}if(n===0){return function(){return new Fn();};}return curry(nAry(n,function($0,$1,$2,$3,$4,$5,$6,$7,$8,$9){switch(arguments.length){case 1:return new Fn($0);case 2:return new Fn($0,$1);case 3:return new Fn($0,$1,$2);case 4:return new Fn($0,$1,$2,$3);case 5:return new Fn($0,$1,$2,$3,$4);case 6:return new Fn($0,$1,$2,$3,$4,$5);case 7:return new Fn($0,$1,$2,$3,$4,$5,$6);case 8:return new Fn($0,$1,$2,$3,$4,$5,$6,$7);case 9:return new Fn($0,$1,$2,$3,$4,$5,$6,$7,$8);case 10:return new Fn($0,$1,$2,$3,$4,$5,$6,$7,$8,$9);}}));});/**
	     * Accepts a converging function and a list of branching functions and returns
	     * a new function. When invoked, this new function is applied to some
	     * arguments, each branching function is applied to those same arguments. The
	     * results of each branching function are passed as arguments to the converging
	     * function to produce the return value.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.4.2
	     * @category Function
	     * @sig (x1 -> x2 -> ... -> z) -> [(a -> b -> ... -> x1), (a -> b -> ... -> x2), ...] -> (a -> b -> ... -> z)
	     * @param {Function} after A function. `after` will be invoked with the return values of
	     *        `fn1` and `fn2` as its arguments.
	     * @param {Array} functions A list of functions.
	     * @return {Function} A new function.
	     * @example
	     *
	     *      var add = (a, b) => a + b;
	     *      var multiply = (a, b) => a * b;
	     *      var subtract = (a, b) => a - b;
	     *
	     *      //≅ multiply( add(1, 2), subtract(1, 2) );
	     *      R.converge(multiply, [add, subtract])(1, 2); //=> -3
	     *
	     *      var add3 = (a, b, c) => a + b + c;
	     *      R.converge(add3, [multiply, add, subtract])(1, 2); //=> 4
	     */var converge=_curry2(function converge(after,fns){return curryN(reduce(max,0,pluck('length',fns)),function(){var args=arguments;var context=this;return after.apply(context,_map(function(fn){return fn.apply(context,args);},fns));});});/**
	     * Counts the elements of a list according to how many match each value of a
	     * key generated by the supplied function. Returns an object mapping the keys
	     * produced by `fn` to the number of occurrences in the list. Note that all
	     * keys are coerced to strings because of how JavaScript objects work.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig (a -> String) -> [a] -> {*}
	     * @param {Function} fn The function used to map values to keys.
	     * @param {Array} list The list to count elements from.
	     * @return {Object} An object mapping keys to number of occurrences in the list.
	     * @example
	     *
	     *      var numbers = [1.0, 1.1, 1.2, 2.0, 3.0, 2.2];
	     *      var letters = R.split('', 'abcABCaaaBBc');
	     *      R.countBy(Math.floor)(numbers);    //=> {'1': 3, '2': 2, '3': 1}
	     *      R.countBy(R.toLower)(letters);   //=> {'a': 5, 'b': 4, 'c': 3}
	     */var countBy=reduceBy(function(acc,elem){return acc+1;},0);/**
	     * Returns a new list without any consecutively repeating elements. Equality is
	     * determined by applying the supplied predicate two consecutive elements. The
	     * first element in a series of equal element is the one being preserved.
	     *
	     * Dispatches to the `dropRepeatsWith` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category List
	     * @sig (a, a -> Boolean) -> [a] -> [a]
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {Array} list The array to consider.
	     * @return {Array} `list` without repeating elements.
	     * @see R.transduce
	     * @example
	     *
	     *      var l = [1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3];
	     *      R.dropRepeatsWith(R.eqBy(Math.abs), l); //=> [1, 3, 4, -5, 3]
	     */var dropRepeatsWith=_curry2(_dispatchable('dropRepeatsWith',_xdropRepeatsWith,function dropRepeatsWith(pred,list){var result=[];var idx=1;var len=list.length;if(len!==0){result[0]=list[0];while(idx<len){if(!pred(last(result),list[idx])){result[result.length]=list[idx];}idx+=1;}}return result;}));/**
	     * Takes a function and two values in its domain and returns `true` if the
	     * values map to the same value in the codomain; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.18.0
	     * @category Relation
	     * @sig (a -> b) -> a -> a -> Boolean
	     * @param {Function} f
	     * @param {*} x
	     * @param {*} y
	     * @return {Boolean}
	     * @example
	     *
	     *      R.eqBy(Math.abs, 5, -5); //=> true
	     */var eqBy=_curry3(function eqBy(f,x,y){return equals(f(x),f(y));});/**
	     * Reports whether two objects have the same value, in `R.equals` terms, for
	     * the specified property. Useful as a curried predicate.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig k -> {k: v} -> {k: v} -> Boolean
	     * @param {String} prop The name of the property to compare
	     * @param {Object} obj1
	     * @param {Object} obj2
	     * @return {Boolean}
	     *
	     * @example
	     *
	     *      var o1 = { a: 1, b: 2, c: 3, d: 4 };
	     *      var o2 = { a: 10, b: 20, c: 3, d: 40 };
	     *      R.eqProps('a', o1, o2); //=> false
	     *      R.eqProps('c', o1, o2); //=> true
	     */var eqProps=_curry3(function eqProps(prop,obj1,obj2){return equals(obj1[prop],obj2[prop]);});/**
	     * Splits a list into sub-lists stored in an object, based on the result of
	     * calling a String-returning function on each element, and grouping the
	     * results according to values returned.
	     *
	     * Dispatches to the `groupBy` method of the second argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig (a -> String) -> [a] -> {String: [a]}
	     * @param {Function} fn Function :: a -> String
	     * @param {Array} list The array to group
	     * @return {Object} An object with the output of `fn` for keys, mapped to arrays of elements
	     *         that produced that key when passed to `fn`.
	     * @see R.transduce
	     * @example
	     *
	     *      var byGrade = R.groupBy(function(student) {
	     *        var score = student.score;
	     *        return score < 65 ? 'F' :
	     *               score < 70 ? 'D' :
	     *               score < 80 ? 'C' :
	     *               score < 90 ? 'B' : 'A';
	     *      });
	     *      var students = [{name: 'Abby', score: 84},
	     *                      {name: 'Eddy', score: 58},
	     *                      // ...
	     *                      {name: 'Jack', score: 69}];
	     *      byGrade(students);
	     *      // {
	     *      //   'A': [{name: 'Dianne', score: 99}],
	     *      //   'B': [{name: 'Abby', score: 84}]
	     *      //   // ...,
	     *      //   'F': [{name: 'Eddy', score: 58}]
	     *      // }
	     */var groupBy=_curry2(_checkForMethod('groupBy',reduceBy(function(acc,item){if(acc==null){acc=[];}acc.push(item);return acc;},null)));/**
	     * Given a function that generates a key, turns a list of objects into an
	     * object indexing the objects by the given key. Note that if multiple
	     * objects generate the same value for the indexing key only the last value
	     * will be included in the generated object.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category List
	     * @sig (a -> String) -> [{k: v}] -> {k: {k: v}}
	     * @param {Function} fn Function :: a -> String
	     * @param {Array} array The array of objects to index
	     * @return {Object} An object indexing each array element by the given property.
	     * @example
	     *
	     *      var list = [{id: 'xyz', title: 'A'}, {id: 'abc', title: 'B'}];
	     *      R.indexBy(R.prop('id'), list);
	     *      //=> {abc: {id: 'abc', title: 'B'}, xyz: {id: 'xyz', title: 'A'}}
	     */var indexBy=reduceBy(function(acc,elem){return elem;},null);/**
	     * Returns the position of the first occurrence of an item in an array, or -1
	     * if the item is not included in the array. `R.equals` is used to determine
	     * equality.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig a -> [a] -> Number
	     * @param {*} target The item to find.
	     * @param {Array} xs The array to search in.
	     * @return {Number} the index of the target, or -1 if the target is not found.
	     * @see R.lastIndexOf
	     * @example
	     *
	     *      R.indexOf(3, [1,2,3,4]); //=> 2
	     *      R.indexOf(10, [1,2,3,4]); //=> -1
	     */var indexOf=_curry2(function indexOf(target,xs){return typeof xs.indexOf==='function'&&!_isArray(xs)?xs.indexOf(target):_indexOf(xs,target,0);});/**
	     * juxt applies a list of functions to a list of values.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category Function
	     * @sig [(a, b, ..., m) -> n] -> ((a, b, ..., m) -> [n])
	     * @param {Array} fns An array of functions
	     * @return {Function} A function that returns a list of values after applying each of the original `fns` to its parameters.
	     * @see R.applySpec
	     * @example
	     *
	     *      var getRange = R.juxt([Math.min, Math.max]);
	     *      getRange(3, 4, 9, -3); //=> [-3, 9]
	     */var juxt=_curry1(function juxt(fns){return converge(_arrayOf,fns);});/**
	     * Returns a lens for the given getter and setter functions. The getter "gets"
	     * the value of the focus; the setter "sets" the value of the focus. The setter
	     * should not mutate the data structure.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.8.0
	     * @category Object
	     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig (s -> a) -> ((a, s) -> s) -> Lens s a
	     * @param {Function} getter
	     * @param {Function} setter
	     * @return {Lens}
	     * @see R.view, R.set, R.over, R.lensIndex, R.lensProp
	     * @example
	     *
	     *      var xLens = R.lens(R.prop('x'), R.assoc('x'));
	     *
	     *      R.view(xLens, {x: 1, y: 2});            //=> 1
	     *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
	     *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
	     */var lens=_curry2(function lens(getter,setter){return function(toFunctorFn){return function(target){return map(function(focus){return setter(focus,target);},toFunctorFn(getter(target)));};};});/**
	     * Returns a lens whose focus is the specified index.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category Object
	     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig Number -> Lens s a
	     * @param {Number} n
	     * @return {Lens}
	     * @see R.view, R.set, R.over
	     * @example
	     *
	     *      var headLens = R.lensIndex(0);
	     *
	     *      R.view(headLens, ['a', 'b', 'c']);            //=> 'a'
	     *      R.set(headLens, 'x', ['a', 'b', 'c']);        //=> ['x', 'b', 'c']
	     *      R.over(headLens, R.toUpper, ['a', 'b', 'c']); //=> ['A', 'b', 'c']
	     */var lensIndex=_curry1(function lensIndex(n){return lens(nth(n),update(n));});/**
	     * Returns a lens whose focus is the specified path.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category Object
	     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig [String] -> Lens s a
	     * @param {Array} path The path to use.
	     * @return {Lens}
	     * @see R.view, R.set, R.over
	     * @example
	     *
	     *      var xyLens = R.lensPath(['x', 'y']);
	     *
	     *      R.view(xyLens, {x: {y: 2, z: 3}});            //=> 2
	     *      R.set(xyLens, 4, {x: {y: 2, z: 3}});          //=> {x: {y: 4, z: 3}}
	     *      R.over(xyLens, R.negate, {x: {y: 2, z: 3}});  //=> {x: {y: -2, z: 3}}
	     */var lensPath=_curry1(function lensPath(p){return lens(path(p),assocPath(p));});/**
	     * Returns a lens whose focus is the specified property.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category Object
	     * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
	     * @sig String -> Lens s a
	     * @param {String} k
	     * @return {Lens}
	     * @see R.view, R.set, R.over
	     * @example
	     *
	     *      var xLens = R.lensProp('x');
	     *
	     *      R.view(xLens, {x: 1, y: 2});            //=> 1
	     *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
	     *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
	     */var lensProp=_curry1(function lensProp(k){return lens(prop(k),assoc(k));});/**
	     * "lifts" a function to be the specified arity, so that it may "map over" that
	     * many lists, Functions or other objects that satisfy the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Function
	     * @sig Number -> (*... -> *) -> ([*]... -> [*])
	     * @param {Function} fn The function to lift into higher context
	     * @return {Function} The lifted function.
	     * @see R.lift, R.ap
	     * @example
	     *
	     *      var madd3 = R.liftN(3, R.curryN(3, (...args) => R.sum(args)));
	     *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
	     */var liftN=_curry2(function liftN(arity,fn){var lifted=curryN(arity,fn);return curryN(arity,function(){return _reduce(ap,map(lifted,arguments[0]),_slice(arguments,1));});});/**
	     * Returns the mean of the given list of numbers.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category Math
	     * @sig [Number] -> Number
	     * @param {Array} list
	     * @return {Number}
	     * @example
	     *
	     *      R.mean([2, 7, 9]); //=> 6
	     *      R.mean([]); //=> NaN
	     */var mean=_curry1(function mean(list){return sum(list)/list.length;});/**
	     * Returns the median of the given list of numbers.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category Math
	     * @sig [Number] -> Number
	     * @param {Array} list
	     * @return {Number}
	     * @example
	     *
	     *      R.median([2, 9, 7]); //=> 7
	     *      R.median([7, 2, 10, 9]); //=> 8
	     *      R.median([]); //=> NaN
	     */var median=_curry1(function median(list){var len=list.length;if(len===0){return NaN;}var width=2-len%2;var idx=(len-width)/2;return mean(_slice(list).sort(function(a,b){return a<b?-1:a>b?1:0;}).slice(idx,idx+width));});/**
	     * Takes a predicate and a list or other "filterable" object and returns the
	     * pair of filterable objects of the same type of elements which do and do not
	     * satisfy, the predicate, respectively.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.4
	     * @category List
	     * @sig Filterable f => (a -> Boolean) -> f a -> [f a, f a]
	     * @param {Function} pred A predicate to determine which side the element belongs to.
	     * @param {Array} filterable the list (or other filterable) to partition.
	     * @return {Array} An array, containing first the subset of elements that satisfy the
	     *         predicate, and second the subset of elements that do not satisfy.
	     * @see R.filter, R.reject
	     * @example
	     *
	     *      R.partition(R.contains('s'), ['sss', 'ttt', 'foo', 'bars']);
	     *      // => [ [ 'sss', 'bars' ],  [ 'ttt', 'foo' ] ]
	     *
	     *      R.partition(R.contains('s'), { a: 'sss', b: 'ttt', foo: 'bars' });
	     *      // => [ { a: 'sss', foo: 'bars' }, { b: 'ttt' }  ]
	     */var partition=juxt([filter,reject]);/**
	     * Performs left-to-right function composition. The leftmost function may have
	     * any arity; the remaining functions must be unary.
	     *
	     * In some libraries this function is named `sequence`.
	     *
	     * **Note:** The result of pipe is not automatically curried.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.compose
	     * @example
	     *
	     *      var f = R.pipe(Math.pow, R.negate, R.inc);
	     *
	     *      f(3, 4); // -(3^4) + 1
	     */var pipe=function pipe(){if(arguments.length===0){throw new Error('pipe requires at least one argument');}return _arity(arguments[0].length,reduce(_pipe,arguments[0],tail(arguments)));};/**
	     * Performs left-to-right composition of one or more Promise-returning
	     * functions. The leftmost function may have any arity; the remaining functions
	     * must be unary.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category Function
	     * @sig ((a -> Promise b), (b -> Promise c), ..., (y -> Promise z)) -> (a -> Promise z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.composeP
	     * @example
	     *
	     *      //  followersForUser :: String -> Promise [User]
	     *      var followersForUser = R.pipeP(db.getUserById, db.getFollowers);
	     */var pipeP=function pipeP(){if(arguments.length===0){throw new Error('pipeP requires at least one argument');}return _arity(arguments[0].length,reduce(_pipeP,arguments[0],tail(arguments)));};/**
	     * Multiplies together all the elements of a list.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Math
	     * @sig [Number] -> Number
	     * @param {Array} list An array of numbers
	     * @return {Number} The product of all the numbers in the list.
	     * @see R.reduce
	     * @example
	     *
	     *      R.product([2,4,6,8,100,1]); //=> 38400
	     */var product=reduce(multiply,1);/**
	     * Transforms a [Traversable](https://github.com/fantasyland/fantasy-land#traversable)
	     * of [Applicative](https://github.com/fantasyland/fantasy-land#applicative) into an
	     * Applicative of Traversable.
	     *
	     * Dispatches to the `sequence` method of the second argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category List
	     * @sig (Applicative f, Traversable t) => (a -> f a) -> t (f a) -> f (t a)
	     * @param {Function} of
	     * @param {*} traversable
	     * @return {*}
	     * @see R.traverse
	     * @example
	     *
	     *      R.sequence(Maybe.of, [Just(1), Just(2), Just(3)]);   //=> Just([1, 2, 3])
	     *      R.sequence(Maybe.of, [Just(1), Just(2), Nothing()]); //=> Nothing()
	     *
	     *      R.sequence(R.of, Just([1, 2, 3])); //=> [Just(1), Just(2), Just(3)]
	     *      R.sequence(R.of, Nothing());       //=> [Nothing()]
	     */var sequence=_curry2(function sequence(of,traversable){return typeof traversable.sequence==='function'?traversable.sequence(of):reduceRight(function(acc,x){return ap(map(prepend,x),acc);},of([]),traversable);});/**
	     * Maps an [Applicative](https://github.com/fantasyland/fantasy-land#applicative)-returning
	     * function over a [Traversable](https://github.com/fantasyland/fantasy-land#traversable),
	     * then uses [`sequence`](#sequence) to transform the resulting Traversable of Applicative
	     * into an Applicative of Traversable.
	     *
	     * Dispatches to the `sequence` method of the third argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category List
	     * @sig (Applicative f, Traversable t) => (a -> f a) -> (a -> f b) -> t a -> f (t b)
	     * @param {Function} of
	     * @param {Function} f
	     * @param {*} traversable
	     * @return {*}
	     * @see R.sequence
	     * @example
	     *
	     *      // Returns `Nothing` if the given divisor is `0`
	     *      safeDiv = n => d => d === 0 ? Nothing() : Just(n / d)
	     *
	     *      R.traverse(Maybe.of, safeDiv(10), [2, 4, 5]); //=> Just([5, 2.5, 2])
	     *      R.traverse(Maybe.of, safeDiv(10), [2, 0, 5]); //=> Nothing
	     */var traverse=_curry3(function traverse(of,f,traversable){return sequence(of,map(f,traversable));});/**
	     * Shorthand for `R.chain(R.identity)`, which removes one level of nesting from
	     * any [Chain](https://github.com/fantasyland/fantasy-land#chain).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.3.0
	     * @category List
	     * @sig Chain c => c (c a) -> c a
	     * @param {*} list
	     * @return {*}
	     * @see R.flatten, R.chain
	     * @example
	     *
	     *      R.unnest([1, [2], [[3]]]); //=> [1, 2, [3]]
	     *      R.unnest([[1, 2], [3, 4], [5, 6]]); //=> [1, 2, 3, 4, 5, 6]
	     */var unnest=chain(_identity);var _contains=function _contains(a,list){return _indexOf(list,a,0)>=0;};//  mapPairs :: (Object, [String]) -> [String]
	var _toString=function _toString(x,seen){var recur=function recur(y){var xs=seen.concat([x]);return _contains(y,xs)?'<Circular>':_toString(y,xs);};//  mapPairs :: (Object, [String]) -> [String]
	var mapPairs=function mapPairs(obj,keys){return _map(function(k){return _quote(k)+': '+recur(obj[k]);},keys.slice().sort());};switch(Object.prototype.toString.call(x)){case'[object Arguments]':return'(function() { return arguments; }('+_map(recur,x).join(', ')+'))';case'[object Array]':return'['+_map(recur,x).concat(mapPairs(x,reject(function(k){return /^\d+$/.test(k);},keys(x)))).join(', ')+']';case'[object Boolean]':return(typeof x==='undefined'?'undefined':_typeof(x))==='object'?'new Boolean('+recur(x.valueOf())+')':x.toString();case'[object Date]':return'new Date('+(isNaN(x.valueOf())?recur(NaN):_quote(_toISOString(x)))+')';case'[object Null]':return'null';case'[object Number]':return(typeof x==='undefined'?'undefined':_typeof(x))==='object'?'new Number('+recur(x.valueOf())+')':1/x===-Infinity?'-0':x.toString(10);case'[object String]':return(typeof x==='undefined'?'undefined':_typeof(x))==='object'?'new String('+recur(x.valueOf())+')':_quote(x);case'[object Undefined]':return'undefined';default:if(typeof x.toString==='function'){var repr=x.toString();if(repr!=='[object Object]'){return repr;}}return'{'+mapPairs(x,keys(x)).join(', ')+'}';}};/**
	     * Performs right-to-left function composition. The rightmost function may have
	     * any arity; the remaining functions must be unary.
	     *
	     * **Note:** The result of compose is not automatically curried.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.pipe
	     * @example
	     *
	     *      var f = R.compose(R.inc, R.negate, Math.pow);
	     *
	     *      f(3, 4); // -(3^4) + 1
	     */var compose=function compose(){if(arguments.length===0){throw new Error('compose requires at least one argument');}return pipe.apply(this,reverse(arguments));};/**
	     * Returns the right-to-left Kleisli composition of the provided functions,
	     * each of which must return a value of a type supported by [`chain`](#chain).
	     *
	     * `R.composeK(h, g, f)` is equivalent to `R.compose(R.chain(h), R.chain(g), R.chain(f))`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category Function
	     * @sig Chain m => ((y -> m z), (x -> m y), ..., (a -> m b)) -> (m a -> m z)
	     * @param {...Function}
	     * @return {Function}
	     * @see R.pipeK
	     * @example
	     *
	     *      //  parseJson :: String -> Maybe *
	     *      //  get :: String -> Object -> Maybe *
	     *
	     *      //  getStateCode :: Maybe String -> Maybe String
	     *      var getStateCode = R.composeK(
	     *        R.compose(Maybe.of, R.toUpper),
	     *        get('state'),
	     *        get('address'),
	     *        get('user'),
	     *        parseJson
	     *      );
	     *
	     *      getStateCode(Maybe.of('{"user":{"address":{"state":"ny"}}}'));
	     *      //=> Just('NY')
	     *      getStateCode(Maybe.of('[Invalid JSON]'));
	     *      //=> Nothing()
	     */var composeK=function composeK(){return compose.apply(this,prepend(identity,map(chain,arguments)));};/**
	     * Performs right-to-left composition of one or more Promise-returning
	     * functions. The rightmost function may have any arity; the remaining
	     * functions must be unary.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.10.0
	     * @category Function
	     * @sig ((y -> Promise z), (x -> Promise y), ..., (a -> Promise b)) -> (a -> Promise z)
	     * @param {...Function} functions
	     * @return {Function}
	     * @see R.pipeP
	     * @example
	     *
	     *      //  followersForUser :: String -> Promise [User]
	     *      var followersForUser = R.composeP(db.getFollowers, db.getUserById);
	     */var composeP=function composeP(){if(arguments.length===0){throw new Error('composeP requires at least one argument');}return pipeP.apply(this,reverse(arguments));};/**
	     * Wraps a constructor function inside a curried function that can be called
	     * with the same arguments and returns the same type.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (* -> {*}) -> (* -> {*})
	     * @param {Function} Fn The constructor function to wrap.
	     * @return {Function} A wrapped, curried constructor function.
	     * @example
	     *
	     *      // Constructor function
	     *      var Widget = config => {
	     *        // ...
	     *      };
	     *      Widget.prototype = {
	     *        // ...
	     *      };
	     *      var allConfigs = [
	     *        // ...
	     *      ];
	     *      R.map(R.construct(Widget), allConfigs); // a list of Widgets
	     */var construct=_curry1(function construct(Fn){return constructN(Fn.length,Fn);});/**
	     * Returns `true` if the specified value is equal, in `R.equals` terms, to at
	     * least one element of the given list; `false` otherwise.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig a -> [a] -> Boolean
	     * @param {Object} a The item to compare against.
	     * @param {Array} list The array to consider.
	     * @return {Boolean} `true` if the item is in the list, `false` otherwise.
	     * @see R.any
	     * @example
	     *
	     *      R.contains(3, [1, 2, 3]); //=> true
	     *      R.contains(4, [1, 2, 3]); //=> false
	     *      R.contains([42], [[42]]); //=> true
	     */var contains=_curry2(_contains);/**
	     * Finds the set (i.e. no duplicates) of all elements in the first list not
	     * contained in the second list.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig [*] -> [*] -> [*]
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @return {Array} The elements in `list1` that are not in `list2`.
	     * @see R.differenceWith, R.symmetricDifference, R.symmetricDifferenceWith
	     * @example
	     *
	     *      R.difference([1,2,3,4], [7,6,5,4,3]); //=> [1,2]
	     *      R.difference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5]
	     */var difference=_curry2(function difference(first,second){var out=[];var idx=0;var firstLen=first.length;while(idx<firstLen){if(!_contains(first[idx],second)&&!_contains(first[idx],out)){out[out.length]=first[idx];}idx+=1;}return out;});/**
	     * Returns a new list without any consecutively repeating elements. `R.equals`
	     * is used to determine equality.
	     *
	     * Dispatches to the `dropRepeats` method of the first argument, if present.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category List
	     * @sig [a] -> [a]
	     * @param {Array} list The array to consider.
	     * @return {Array} `list` without repeating elements.
	     * @see R.transduce
	     * @example
	     *
	     *     R.dropRepeats([1, 1, 1, 2, 3, 4, 4, 2, 2]); //=> [1, 2, 3, 4, 2]
	     */var dropRepeats=_curry1(_dispatchable('dropRepeats',_xdropRepeatsWith(equals),dropRepeatsWith(equals)));/**
	     * "lifts" a function of arity > 1 so that it may "map over" a list, Function or other
	     * object that satisfies the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
	     *
	     * @func
	     * @memberOf R
	     * @since v0.7.0
	     * @category Function
	     * @sig (*... -> *) -> ([*]... -> [*])
	     * @param {Function} fn The function to lift into higher context
	     * @return {Function} The lifted function.
	     * @see R.liftN
	     * @example
	     *
	     *      var madd3 = R.lift(R.curry((a, b, c) => a + b + c));
	     *
	     *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
	     *
	     *      var madd5 = R.lift(R.curry((a, b, c, d, e) => a + b + c + d + e));
	     *
	     *      madd5([1,2], [3], [4, 5], [6], [7, 8]); //=> [21, 22, 22, 23, 22, 23, 23, 24]
	     */var lift=_curry1(function lift(fn){return liftN(fn.length,fn);});/**
	     * Returns a partial copy of an object omitting the keys specified.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Object
	     * @sig [String] -> {String: *} -> {String: *}
	     * @param {Array} names an array of String property names to omit from the new object
	     * @param {Object} obj The object to copy from
	     * @return {Object} A new object with properties from `names` not on it.
	     * @see R.pick
	     * @example
	     *
	     *      R.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, c: 3}
	     */var omit=_curry2(function omit(names,obj){var result={};for(var prop in obj){if(!_contains(prop,names)){result[prop]=obj[prop];}}return result;});/**
	     * Returns the left-to-right Kleisli composition of the provided functions,
	     * each of which must return a value of a type supported by [`chain`](#chain).
	     *
	     * `R.pipeK(f, g, h)` is equivalent to `R.pipe(R.chain(f), R.chain(g), R.chain(h))`.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category Function
	     * @sig Chain m => ((a -> m b), (b -> m c), ..., (y -> m z)) -> (m a -> m z)
	     * @param {...Function}
	     * @return {Function}
	     * @see R.composeK
	     * @example
	     *
	     *      //  parseJson :: String -> Maybe *
	     *      //  get :: String -> Object -> Maybe *
	     *
	     *      //  getStateCode :: Maybe String -> Maybe String
	     *      var getStateCode = R.pipeK(
	     *        parseJson,
	     *        get('user'),
	     *        get('address'),
	     *        get('state'),
	     *        R.compose(Maybe.of, R.toUpper)
	     *      );
	     *
	     *      getStateCode(Maybe.of('{"user":{"address":{"state":"ny"}}}'));
	     *      //=> Just('NY')
	     *      getStateCode(Maybe.of('[Invalid JSON]'));
	     *      //=> Nothing()
	     */var pipeK=function pipeK(){return composeK.apply(this,reverse(arguments));};/**
	     * Returns the string representation of the given value. `eval`'ing the output
	     * should result in a value equivalent to the input value. Many of the built-in
	     * `toString` methods do not satisfy this requirement.
	     *
	     * If the given value is an `[object Object]` with a `toString` method other
	     * than `Object.prototype.toString`, this method is invoked with no arguments
	     * to produce the return value. This means user-defined constructor functions
	     * can provide a suitable `toString` method. For example:
	     *
	     *     function Point(x, y) {
	     *       this.x = x;
	     *       this.y = y;
	     *     }
	     *
	     *     Point.prototype.toString = function() {
	     *       return 'new Point(' + this.x + ', ' + this.y + ')';
	     *     };
	     *
	     *     R.toString(new Point(1, 2)); //=> 'new Point(1, 2)'
	     *
	     * @func
	     * @memberOf R
	     * @since v0.14.0
	     * @category String
	     * @sig * -> String
	     * @param {*} val
	     * @return {String}
	     * @example
	     *
	     *      R.toString(42); //=> '42'
	     *      R.toString('abc'); //=> '"abc"'
	     *      R.toString([1, 2, 3]); //=> '[1, 2, 3]'
	     *      R.toString({foo: 1, bar: 2, baz: 3}); //=> '{"bar": 2, "baz": 3, "foo": 1}'
	     *      R.toString(new Date('2001-02-03T04:05:06Z')); //=> 'new Date("2001-02-03T04:05:06.000Z")'
	     */var toString=_curry1(function toString(val){return _toString(val,[]);});/**
	     * Returns a new list without values in the first argument.
	     * `R.equals` is used to determine equality.
	     *
	     * Acts as a transducer if a transformer is given in list position.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category List
	     * @sig [a] -> [a] -> [a]
	     * @param {Array} list1 The values to be removed from `list2`.
	     * @param {Array} list2 The array to remove values from.
	     * @return {Array} The new array without values in `list1`.
	     * @see R.transduce
	     * @example
	     *
	     *      R.without([1, 2], [1, 2, 1, 3, 4]); //=> [3, 4]
	     */var without=_curry2(function(xs,list){return reject(flip(_contains)(xs),list);});// A simple Set type that honours R.equals semantics
	/* globals Set */// until we figure out why jsdoc chokes on this
	// @param item The item to add to the Set
	// @returns {boolean} true if the item did not exist prior, otherwise false
	//
	//
	// @param item The item to check for existence in the Set
	// @returns {boolean} true if the item exists in the Set, otherwise false
	//
	//
	// Combines the logic for checking whether an item is a member of the set and
	// for adding a new item to the set.
	//
	// @param item       The item to check or add to the Set instance.
	// @param shouldAdd  If true, the item will be added to the set if it doesn't
	//                   already exist.
	// @param set        The set instance to check or add to.
	// @return {boolean} true if the item already existed, otherwise false.
	//
	// distinguish between +0 and -0
	// these types can all utilise the native Set
	// set._items['boolean'] holds a two element array
	// representing [ falseExists, trueExists ]
	// compare functions for reference equality
	/* falls through */// reduce the search size of heterogeneous sets by creating buckets
	// for each type.
	// scan through all previously applied items
	var _Set=function(){function _Set(){/* globals Set */this._nativeSet=typeof Set==='function'?new Set():null;this._items={};}// until we figure out why jsdoc chokes on this
	// @param item The item to add to the Set
	// @returns {boolean} true if the item did not exist prior, otherwise false
	//
	_Set.prototype.add=function(item){return!hasOrAdd(item,true,this);};//
	// @param item The item to check for existence in the Set
	// @returns {boolean} true if the item exists in the Set, otherwise false
	//
	_Set.prototype.has=function(item){return hasOrAdd(item,false,this);};//
	// Combines the logic for checking whether an item is a member of the set and
	// for adding a new item to the set.
	//
	// @param item       The item to check or add to the Set instance.
	// @param shouldAdd  If true, the item will be added to the set if it doesn't
	//                   already exist.
	// @param set        The set instance to check or add to.
	// @return {boolean} true if the item already existed, otherwise false.
	//
	function hasOrAdd(item,shouldAdd,set){var type=typeof item==='undefined'?'undefined':_typeof(item);var prevSize,newSize;switch(type){case'string':case'number':// distinguish between +0 and -0
	if(item===0&&1/item===-Infinity){if(set._items['-0']){return true;}else{if(shouldAdd){set._items['-0']=true;}return false;}}// these types can all utilise the native Set
	if(set._nativeSet!==null){if(shouldAdd){prevSize=set._nativeSet.size;set._nativeSet.add(item);newSize=set._nativeSet.size;return newSize===prevSize;}else{return set._nativeSet.has(item);}}else{if(!(type in set._items)){if(shouldAdd){set._items[type]={};set._items[type][item]=true;}return false;}else if(item in set._items[type]){return true;}else{if(shouldAdd){set._items[type][item]=true;}return false;}}case'boolean':// set._items['boolean'] holds a two element array
	// representing [ falseExists, trueExists ]
	if(type in set._items){var bIdx=item?1:0;if(set._items[type][bIdx]){return true;}else{if(shouldAdd){set._items[type][bIdx]=true;}return false;}}else{if(shouldAdd){set._items[type]=item?[false,true]:[true,false];}return false;}case'function':// compare functions for reference equality
	if(set._nativeSet!==null){if(shouldAdd){prevSize=set._nativeSet.size;set._nativeSet.add(item);newSize=set._nativeSet.size;return newSize>prevSize;}else{return set._nativeSet.has(item);}}else{if(!(type in set._items)){if(shouldAdd){set._items[type]=[item];}return false;}if(!_contains(item,set._items[type])){if(shouldAdd){set._items[type].push(item);}return false;}return true;}case'undefined':if(set._items[type]){return true;}else{if(shouldAdd){set._items[type]=true;}return false;}case'object':if(item===null){if(!set._items['null']){if(shouldAdd){set._items['null']=true;}return false;}return true;}/* falls through */default:// reduce the search size of heterogeneous sets by creating buckets
	// for each type.
	type=Object.prototype.toString.call(item);if(!(type in set._items)){if(shouldAdd){set._items[type]=[item];}return false;}// scan through all previously applied items
	if(!_contains(item,set._items[type])){if(shouldAdd){set._items[type].push(item);}return false;}return true;}}return _Set;}();/**
	     * A function wrapping calls to the two functions in an `&&` operation,
	     * returning the result of the first function if it is false-y and the result
	     * of the second function otherwise. Note that this is short-circuited,
	     * meaning that the second function will not be invoked if the first returns a
	     * false-y value.
	     *
	     * In addition to functions, `R.both` also accepts any fantasy-land compatible
	     * applicative functor.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category Logic
	     * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
	     * @param {Function} f a predicate
	     * @param {Function} g another predicate
	     * @return {Function} a function that applies its arguments to `f` and `g` and `&&`s their outputs together.
	     * @see R.and
	     * @example
	     *
	     *      var gt10 = x => x > 10;
	     *      var even = x => x % 2 === 0;
	     *      var f = R.both(gt10, even);
	     *      f(100); //=> true
	     *      f(101); //=> false
	     */var both=_curry2(function both(f,g){return _isFunction(f)?function _both(){return f.apply(this,arguments)&&g.apply(this,arguments);}:lift(and)(f,g);});/**
	     * Takes a function `f` and returns a function `g` such that:
	     *
	     *   - applying `g` to zero or more arguments will give __true__ if applying
	     *     the same arguments to `f` gives a logical __false__ value; and
	     *
	     *   - applying `g` to zero or more arguments will give __false__ if applying
	     *     the same arguments to `f` gives a logical __true__ value.
	     *
	     * `R.complement` will work on all other functors as well.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category Logic
	     * @sig (*... -> *) -> (*... -> Boolean)
	     * @param {Function} f
	     * @return {Function}
	     * @see R.not
	     * @example
	     *
	     *      var isEven = n => n % 2 === 0;
	     *      var isOdd = R.complement(isEven);
	     *      isOdd(21); //=> true
	     *      isOdd(42); //=> false
	     */var complement=lift(not);/**
	     * Returns the result of concatenating the given lists or strings.
	     *
	     * Note: `R.concat` expects both arguments to be of the same type,
	     * unlike the native `Array.prototype.concat` method. It will throw
	     * an error if you `concat` an Array with a non-Array value.
	     *
	     * Dispatches to the `concat` method of the first argument, if present.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [a] -> [a]
	     * @sig String -> String -> String
	     * @param {Array|String} a
	     * @param {Array|String} b
	     * @return {Array|String}
	     *
	     * @example
	     *
	     *      R.concat([], []); //=> []
	     *      R.concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
	     *      R.concat('ABC', 'DEF'); // 'ABCDEF'
	     */var concat=_curry2(function concat(a,b){if(a==null||!_isFunction(a.concat)){throw new TypeError(toString(a)+' does not have a method named "concat"');}if(_isArray(a)&&!_isArray(b)){throw new TypeError(toString(b)+' is not an array');}return a.concat(b);});/**
	     * A function wrapping calls to the two functions in an `||` operation,
	     * returning the result of the first function if it is truth-y and the result
	     * of the second function otherwise. Note that this is short-circuited,
	     * meaning that the second function will not be invoked if the first returns a
	     * truth-y value.
	     *
	     * In addition to functions, `R.either` also accepts any fantasy-land compatible
	     * applicative functor.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category Logic
	     * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
	     * @param {Function} f a predicate
	     * @param {Function} g another predicate
	     * @return {Function} a function that applies its arguments to `f` and `g` and `||`s their outputs together.
	     * @see R.or
	     * @example
	     *
	     *      var gt10 = x => x > 10;
	     *      var even = x => x % 2 === 0;
	     *      var f = R.either(gt10, even);
	     *      f(101); //=> true
	     *      f(8); //=> true
	     */var either=_curry2(function either(f,g){return _isFunction(f)?function _either(){return f.apply(this,arguments)||g.apply(this,arguments);}:lift(or)(f,g);});/**
	     * Turns a named method with a specified arity into a function that can be
	     * called directly supplied with arguments and a target object.
	     *
	     * The returned function is curried and accepts `arity + 1` parameters where
	     * the final parameter is the target object.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
	     * @param {Number} arity Number of arguments the returned function should take
	     *        before the target object.
	     * @param {String} method Name of the method to call.
	     * @return {Function} A new curried function.
	     * @example
	     *
	     *      var sliceFrom = R.invoker(1, 'slice');
	     *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
	     *      var sliceFrom6 = R.invoker(2, 'slice')(6);
	     *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
	     */var invoker=_curry2(function invoker(arity,method){return curryN(arity+1,function(){var target=arguments[arity];if(target!=null&&_isFunction(target[method])){return target[method].apply(target,_slice(arguments,0,arity));}throw new TypeError(toString(target)+' does not have a method named "'+method+'"');});});/**
	     * Returns a string made by inserting the `separator` between each element and
	     * concatenating all the elements into a single string.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig String -> [a] -> String
	     * @param {Number|String} separator The string used to separate the elements.
	     * @param {Array} xs The elements to join into a string.
	     * @return {String} str The string made by concatenating `xs` with `separator`.
	     * @see R.split
	     * @example
	     *
	     *      var spacer = R.join(' ');
	     *      spacer(['a', 2, 3.4]);   //=> 'a 2 3.4'
	     *      R.join('|', [1, 2, 3]);    //=> '1|2|3'
	     */var join=invoker(1,'join');/**
	     * Creates a new function that, when invoked, caches the result of calling `fn`
	     * for a given argument set and returns the result. Subsequent calls to the
	     * memoized `fn` with the same argument set will not result in an additional
	     * call to `fn`; instead, the cached result for that set of arguments will be
	     * returned.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Function
	     * @sig (*... -> a) -> (*... -> a)
	     * @param {Function} fn The function to memoize.
	     * @return {Function} Memoized version of `fn`.
	     * @example
	     *
	     *      var count = 0;
	     *      var factorial = R.memoize(n => {
	     *        count += 1;
	     *        return R.product(R.range(1, n + 1));
	     *      });
	     *      factorial(5); //=> 120
	     *      factorial(5); //=> 120
	     *      factorial(5); //=> 120
	     *      count; //=> 1
	     */var memoize=_curry1(function memoize(fn){var cache={};return _arity(fn.length,function(){var key=toString(arguments);if(!_has(key,cache)){cache[key]=fn.apply(this,arguments);}return cache[key];});});/**
	     * Splits a string into an array of strings based on the given
	     * separator.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category String
	     * @sig (String | RegExp) -> String -> [String]
	     * @param {String|RegExp} sep The pattern.
	     * @param {String} str The string to separate into an array.
	     * @return {Array} The array of strings from `str` separated by `str`.
	     * @see R.join
	     * @example
	     *
	     *      var pathComponents = R.split('/');
	     *      R.tail(pathComponents('/usr/local/bin/node')); //=> ['usr', 'local', 'bin', 'node']
	     *
	     *      R.split('.', 'a.b.c.xyz.d'); //=> ['a', 'b', 'c', 'xyz', 'd']
	     */var split=invoker(1,'split');/**
	     * Finds the set (i.e. no duplicates) of all elements contained in the first or
	     * second list, but not both.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category Relation
	     * @sig [*] -> [*] -> [*]
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @return {Array} The elements in `list1` or `list2`, but not both.
	     * @see R.symmetricDifferenceWith, R.difference, R.differenceWith
	     * @example
	     *
	     *      R.symmetricDifference([1,2,3,4], [7,6,5,4,3]); //=> [1,2,7,6,5]
	     *      R.symmetricDifference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5,1,2]
	     */var symmetricDifference=_curry2(function symmetricDifference(list1,list2){return concat(difference(list1,list2),difference(list2,list1));});/**
	     * Finds the set (i.e. no duplicates) of all elements contained in the first or
	     * second list, but not both. Duplication is determined according to the value
	     * returned by applying the supplied predicate to two list elements.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.19.0
	     * @category Relation
	     * @sig (a -> a -> Boolean) -> [a] -> [a] -> [a]
	     * @param {Function} pred A predicate used to test whether two items are equal.
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @return {Array} The elements in `list1` or `list2`, but not both.
	     * @see R.symmetricDifference, R.difference, R.differenceWith
	     * @example
	     *
	     *      var eqA = R.eqBy(R.prop('a'));
	     *      var l1 = [{a: 1}, {a: 2}, {a: 3}, {a: 4}];
	     *      var l2 = [{a: 3}, {a: 4}, {a: 5}, {a: 6}];
	     *      R.symmetricDifferenceWith(eqA, l1, l2); //=> [{a: 1}, {a: 2}, {a: 5}, {a: 6}]
	     */var symmetricDifferenceWith=_curry3(function symmetricDifferenceWith(pred,list1,list2){return concat(differenceWith(pred,list1,list2),differenceWith(pred,list2,list1));});/**
	     * Determines whether a given string matches a given regular expression.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.12.0
	     * @category String
	     * @sig RegExp -> String -> Boolean
	     * @param {RegExp} pattern
	     * @param {String} str
	     * @return {Boolean}
	     * @see R.match
	     * @example
	     *
	     *      R.test(/^x/, 'xyz'); //=> true
	     *      R.test(/^y/, 'xyz'); //=> false
	     */var test=_curry2(function test(pattern,str){if(!_isRegExp(pattern)){throw new TypeError('\u2018test\u2019 requires a value of type RegExp as its first argument; received '+toString(pattern));}return _cloneRegExp(pattern).test(str);});/**
	     * The lower case version of a string.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category String
	     * @sig String -> String
	     * @param {String} str The string to lower case.
	     * @return {String} The lower case version of `str`.
	     * @see R.toUpper
	     * @example
	     *
	     *      R.toLower('XYZ'); //=> 'xyz'
	     */var toLower=invoker(0,'toLowerCase');/**
	     * The upper case version of a string.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.9.0
	     * @category String
	     * @sig String -> String
	     * @param {String} str The string to upper case.
	     * @return {String} The upper case version of `str`.
	     * @see R.toLower
	     * @example
	     *
	     *      R.toUpper('abc'); //=> 'ABC'
	     */var toUpper=invoker(0,'toUpperCase');/**
	     * Returns a new list containing only one copy of each element in the original
	     * list, based upon the value returned by applying the supplied function to
	     * each list element. Prefers the first item if the supplied function produces
	     * the same value on two items. `R.equals` is used for comparison.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.16.0
	     * @category List
	     * @sig (a -> b) -> [a] -> [a]
	     * @param {Function} fn A function used to produce a value to use during comparisons.
	     * @param {Array} list The array to consider.
	     * @return {Array} The list of unique items.
	     * @example
	     *
	     *      R.uniqBy(Math.abs, [-1, -5, 2, 10, 1, 2]); //=> [-1, -5, 2, 10]
	     */var uniqBy=_curry2(function uniqBy(fn,list){var set=new _Set();var result=[];var idx=0;var appliedItem,item;while(idx<list.length){item=list[idx];appliedItem=fn(item);if(set.add(appliedItem)){result.push(item);}idx+=1;}return result;});/**
	     * Returns a new list containing only one copy of each element in the original
	     * list. `R.equals` is used to determine equality.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category List
	     * @sig [a] -> [a]
	     * @param {Array} list The array to consider.
	     * @return {Array} The list of unique items.
	     * @example
	     *
	     *      R.uniq([1, 1, 2, 1]); //=> [1, 2]
	     *      R.uniq([1, '1']);     //=> [1, '1']
	     *      R.uniq([[42], [42]]); //=> [[42]]
	     */var uniq=uniqBy(identity);/**
	     * Combines two lists into a set (i.e. no duplicates) composed of those
	     * elements common to both lists.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig [*] -> [*] -> [*]
	     * @param {Array} list1 The first list.
	     * @param {Array} list2 The second list.
	     * @return {Array} The list of elements found in both `list1` and `list2`.
	     * @see R.intersectionWith
	     * @example
	     *
	     *      R.intersection([1,2,3,4], [7,6,5,4,3]); //=> [4, 3]
	     */var intersection=_curry2(function intersection(list1,list2){var lookupList,filteredList;if(list1.length>list2.length){lookupList=list1;filteredList=list2;}else{lookupList=list2;filteredList=list1;}return uniq(_filter(flip(_contains)(lookupList),filteredList));});/**
	     * Combines two lists into a set (i.e. no duplicates) composed of the elements
	     * of each list.
	     *
	     * @func
	     * @memberOf R
	     * @since v0.1.0
	     * @category Relation
	     * @sig [*] -> [*] -> [*]
	     * @param {Array} as The first list.
	     * @param {Array} bs The second list.
	     * @return {Array} The first and second lists concatenated, with
	     *         duplicates removed.
	     * @example
	     *
	     *      R.union([1, 2, 3], [2, 3, 4]); //=> [1, 2, 3, 4]
	     */var union=_curry2(compose(uniq,_concat));var R={F:F,T:T,__:__,add:add,addIndex:addIndex,adjust:adjust,all:all,allPass:allPass,always:always,and:and,any:any,anyPass:anyPass,ap:ap,aperture:aperture,append:append,apply:apply,applySpec:applySpec,assoc:assoc,assocPath:assocPath,binary:binary,bind:bind,both:both,call:call,chain:chain,clamp:clamp,clone:clone,comparator:comparator,complement:complement,compose:compose,composeK:composeK,composeP:composeP,concat:concat,cond:cond,construct:construct,constructN:constructN,contains:contains,converge:converge,countBy:countBy,curry:curry,curryN:curryN,dec:dec,defaultTo:defaultTo,difference:difference,differenceWith:differenceWith,dissoc:dissoc,dissocPath:dissocPath,divide:divide,drop:drop,dropLast:dropLast,dropLastWhile:dropLastWhile,dropRepeats:dropRepeats,dropRepeatsWith:dropRepeatsWith,dropWhile:dropWhile,either:either,empty:empty,eqBy:eqBy,eqProps:eqProps,equals:equals,evolve:evolve,filter:filter,find:find,findIndex:findIndex,findLast:findLast,findLastIndex:findLastIndex,flatten:flatten,flip:flip,forEach:forEach,fromPairs:fromPairs,groupBy:groupBy,groupWith:groupWith,gt:gt,gte:gte,has:has,hasIn:hasIn,head:head,identical:identical,identity:identity,ifElse:ifElse,inc:inc,indexBy:indexBy,indexOf:indexOf,init:init,insert:insert,insertAll:insertAll,intersection:intersection,intersectionWith:intersectionWith,intersperse:intersperse,into:into,invert:invert,invertObj:invertObj,invoker:invoker,is:is,isArrayLike:isArrayLike,isEmpty:isEmpty,isNil:isNil,join:join,juxt:juxt,keys:keys,keysIn:keysIn,last:last,lastIndexOf:lastIndexOf,length:length,lens:lens,lensIndex:lensIndex,lensPath:lensPath,lensProp:lensProp,lift:lift,liftN:liftN,lt:lt,lte:lte,map:map,mapAccum:mapAccum,mapAccumRight:mapAccumRight,mapObjIndexed:mapObjIndexed,match:match,mathMod:mathMod,max:max,maxBy:maxBy,mean:mean,median:median,memoize:memoize,merge:merge,mergeAll:mergeAll,mergeWith:mergeWith,mergeWithKey:mergeWithKey,min:min,minBy:minBy,modulo:modulo,multiply:multiply,nAry:nAry,negate:negate,none:none,not:not,nth:nth,nthArg:nthArg,objOf:objOf,of:of,omit:omit,once:once,or:or,over:over,pair:pair,partial:partial,partialRight:partialRight,partition:partition,path:path,pathEq:pathEq,pathOr:pathOr,pathSatisfies:pathSatisfies,pick:pick,pickAll:pickAll,pickBy:pickBy,pipe:pipe,pipeK:pipeK,pipeP:pipeP,pluck:pluck,prepend:prepend,product:product,project:project,prop:prop,propEq:propEq,propIs:propIs,propOr:propOr,propSatisfies:propSatisfies,props:props,range:range,reduce:reduce,reduceBy:reduceBy,reduceRight:reduceRight,reduceWhile:reduceWhile,reduced:reduced,reject:reject,remove:remove,repeat:repeat,replace:replace,reverse:reverse,scan:scan,sequence:sequence,set:set,slice:slice,sort:sort,sortBy:sortBy,split:split,splitAt:splitAt,splitEvery:splitEvery,splitWhen:splitWhen,subtract:subtract,sum:sum,symmetricDifference:symmetricDifference,symmetricDifferenceWith:symmetricDifferenceWith,tail:tail,take:take,takeLast:takeLast,takeLastWhile:takeLastWhile,takeWhile:takeWhile,tap:tap,test:test,times:times,toLower:toLower,toPairs:toPairs,toPairsIn:toPairsIn,toString:toString,toUpper:toUpper,transduce:transduce,transpose:transpose,traverse:traverse,trim:trim,tryCatch:tryCatch,type:type,unapply:unapply,unary:unary,uncurryN:uncurryN,unfold:unfold,union:union,unionWith:unionWith,uniq:uniq,uniqBy:uniqBy,uniqWith:uniqWith,unless:unless,unnest:unnest,until:until,update:update,useWith:useWith,values:values,valuesIn:valuesIn,view:view,when:when,where:where,whereEq:whereEq,without:without,wrap:wrap,xprod:xprod,zip:zip,zipObj:zipObj,zipWith:zipWith};/* eslint-env amd *//* TEST_ENTRY_POINT */if(( false?'undefined':_typeof(exports))==='object'){module.exports=R;}else if(true){!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return R;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));}else{this.R=R;}}).call(undefined);

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";

	module.exports = ["FPS", "Multiplayer", "Shooter", "Action", "Team-Based", "Competitive", "Tactical", "First-Person", "e-sports", "PvP", "Online Co-Op", "Military", "Co-op", "Strategy", "War", "Trading", "Realistic", "Difficult", "Fast-Paced", "Moddable"];

/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";

	module.exports = [{
		"appid": 10,
		"name": "Counter-Strike",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 98,
		"owners": 13646161,
		"owners_variance": 95354,
		"players_forever": 9565074,
		"players_forever_variance": 80301,
		"players_2weeks": 382857,
		"players_2weeks_variance": 16274,
		"average_forever": 11012,
		"average_2weeks": 614,
		"median_forever": 446,
		"median_2weeks": 60,
		"ccu": 23413,
		"price": "999",
		"tags": ["Action", "FPS", "Multiplayer", "Shooter", "Classic", "Team-Based", "Competitive", "First-Person", "Tactical", "1990's", "e-sports", "PvP", "Strategy", "Military", "Score Attack", "Survival", "Assassin", "1980s", "Ninja", "Tower Defense"]
	}, {
		"appid": 80,
		"name": "Counter-Strike: Condition Zero",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 78,
		"owners": 10938791,
		"owners_variance": 85705,
		"players_forever": 4344482,
		"players_forever_variance": 54520,
		"players_2weeks": 50939,
		"players_2weeks_variance": 5939,
		"average_forever": 2047,
		"average_2weeks": 208,
		"median_forever": 85,
		"median_2weeks": 30,
		"ccu": 776,
		"price": "999",
		"tags": ["Action", "FPS", "Shooter", "Multiplayer", "Singleplayer", "Tactical", "Competitive", "First-Person", "Team-Based", "Classic", "Strategy", "Military", "Adventure", "Online Co-Op", "Open World"]
	}, {
		"appid": 220,
		"name": "Half-Life 2",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 96,
		"owners": 10452969,
		"owners_variance": 83839,
		"players_forever": 5984312,
		"players_forever_variance": 63840,
		"players_2weeks": 73236,
		"players_2weeks_variance": 7121,
		"average_forever": 714,
		"average_2weeks": 153,
		"median_forever": 298,
		"median_2weeks": 52,
		"ccu": 1083,
		"price": "999",
		"tags": ["FPS", "Action", "Sci-fi", "Classic", "Singleplayer", "Story Rich", "Shooter", "Adventure", "First-Person", "Dystopian", "Atmospheric", "Zombies", "Great Soundtrack", "Aliens", "Physics", "Silent Protagonist", "Multiplayer", "Horror", "Moddable", "Puzzle"]
	}, {
		"appid": 240,
		"name": "Counter-Strike: Source",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 93,
		"owners": 16113339,
		"owners_variance": 103246,
		"players_forever": 11953216,
		"players_forever_variance": 89461,
		"players_2weeks": 332643,
		"players_2weeks_variance": 15171,
		"average_forever": 8170,
		"average_2weeks": 346,
		"median_forever": 681,
		"median_2weeks": 53,
		"ccu": 10350,
		"price": "1999",
		"tags": ["Action", "FPS", "Multiplayer", "Shooter", "Team-Based", "Tactical", "First-Person", "Competitive", "PvP", "Military", "War", "Moddable", "e-sports", "Strategy", "Difficult", "Singleplayer", "Survival", "Atmospheric", "Simulation", "Sandbox"]
	}, {
		"appid": 300,
		"name": "Day of Defeat: Source",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 81,
		"owners": 6742412,
		"owners_variance": 67690,
		"players_forever": 3076812,
		"players_forever_variance": 45963,
		"players_2weeks": 39518,
		"players_2weeks_variance": 5231,
		"average_forever": 1905,
		"average_2weeks": 278,
		"median_forever": 103,
		"median_2weeks": 42,
		"ccu": 1257,
		"price": "999",
		"tags": ["FPS", "World War II", "Action", "Multiplayer", "Shooter", "Team-Based", "Military", "Class-Based", "War", "Historical", "First-Person", "Tactical", "Classic", "Realistic", "Massively Multiplayer", "Strategy", "Gore", "Comedy", "Simulation"]
	}, {
		"appid": 320,
		"name": "Half-Life 2: Deathmatch",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 75,
		"owners": 14810502,
		"owners_variance": 99171,
		"players_forever": 3808627,
		"players_forever_variance": 51085,
		"players_2weeks": 18853,
		"players_2weeks_variance": 3613,
		"average_forever": 580,
		"average_2weeks": 153,
		"median_forever": 39,
		"median_2weeks": 29,
		"ccu": 359,
		"price": "499",
		"tags": ["Action", "FPS", "Multiplayer", "Shooter", "Sci-fi", "First-Person", "Physics", "Competitive", "Funny", "Co-op"]
	}, {
		"appid": 340,
		"name": "Half-Life 2: Lost Coast",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 56,
		"owners": 15652352,
		"owners_variance": 101826,
		"players_forever": 3072643,
		"players_forever_variance": 45932,
		"players_2weeks": 9064,
		"players_2weeks_variance": 2505,
		"average_forever": 52,
		"average_2weeks": 20,
		"median_forever": 25,
		"median_2weeks": 19,
		"ccu": 28,
		"price": "0",
		"tags": ["FPS", "Action", "Sci-fi", "Singleplayer", "Short", "First-Person", "Shooter", "Aliens", "Dystopian", "Adventure", "Futuristic", "Benchmark", "Atmospheric", "Classic", "Free to Play", "Multiplayer", "Silent Protagonist"]
	}, {
		"appid": 380,
		"name": "Half-Life 2: Episode One",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 93,
		"owners": 6625126,
		"owners_variance": 67110,
		"players_forever": 2656069,
		"players_forever_variance": 42730,
		"players_2weeks": 17584,
		"players_2weeks_variance": 3489,
		"average_forever": 302,
		"average_2weeks": 111,
		"median_forever": 203,
		"median_2weeks": 84,
		"ccu": 0,
		"price": "799",
		"tags": ["FPS", "Action", "Sci-fi", "Singleplayer", "First-Person", "Story Rich", "Shooter", "Classic", "Dystopian", "Adventure", "Aliens", "Zombies", "Episodic", "Atmospheric", "Short", "Great Soundtrack", "Silent Protagonist", "Cinematic", "Puzzle", "Moddable"]
	}, {
		"appid": 400,
		"name": "Portal",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 99,
		"owners": 10171808,
		"owners_variance": 82737,
		"players_forever": 7188897,
		"players_forever_variance": 69851,
		"players_2weeks": 58190,
		"players_2weeks_variance": 6347,
		"average_forever": 316,
		"average_2weeks": 115,
		"median_forever": 178,
		"median_2weeks": 41,
		"ccu": 531,
		"price": "999",
		"tags": ["Puzzle", "First-Person", "Singleplayer", "Sci-fi", "Comedy", "Female Protagonist", "Action", "Funny", "Platformer", "FPS", "Short", "Story Rich", "Physics", "Classic", "Adventure", "Science", "Atmospheric", "Dark Humor", "Great Soundtrack", "Strategy"]
	}, {
		"appid": 440,
		"name": "Team Fortress 2",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 91,
		"owners": 38390636,
		"owners_variance": 154117,
		"players_forever": 38390636,
		"players_forever_variance": 154117,
		"players_2weeks": 1610826,
		"players_2weeks_variance": 33325,
		"average_forever": 4530,
		"average_2weeks": 524,
		"median_forever": 253,
		"median_2weeks": 153,
		"ccu": 62208,
		"price": "0",
		"tags": ["Free to Play", "Multiplayer", "FPS", "Action", "Shooter", "Class-Based", "Funny", "Team-Based", "Trading", "First-Person", "Cartoony", "Competitive", "Co-op", "Online Co-Op", "Robots", "Comedy", "Tactical", "Crafting", "Cartoon", "Moddable"]
	}, {
		"appid": 500,
		"name": "Left 4 Dead",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 91,
		"owners": 4599176,
		"owners_variance": 56075,
		"players_forever": 3212408,
		"players_forever_variance": 46956,
		"players_2weeks": 30455,
		"players_2weeks_variance": 4592,
		"average_forever": 2310,
		"average_2weeks": 244,
		"median_forever": 480,
		"median_2weeks": 52,
		"ccu": 584,
		"price": "1999",
		"tags": ["Zombies", "Co-op", "FPS", "Action", "Multiplayer", "Shooter", "Team-Based", "Online Co-Op", "First-Person", "Horror", "Post-apocalyptic", "Survival", "Singleplayer", "Competitive", "Tactical", "Atmospheric", "Adventure", "Moddable", "Female Protagonist", "Replay Value"]
	}, {
		"appid": 550,
		"name": "Left 4 Dead 2",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 96,
		"owners": 15898526,
		"owners_variance": 102587,
		"players_forever": 13880189,
		"players_forever_variance": 96135,
		"players_2weeks": 590781,
		"players_2weeks_variance": 20210,
		"average_forever": 2301,
		"average_2weeks": 214,
		"median_forever": 570,
		"median_2weeks": 69,
		"ccu": 12016,
		"price": "1999",
		"tags": ["Zombies", "Co-op", "FPS", "Multiplayer", "Action", "Online Co-Op", "Shooter", "First-Person", "Survival", "Horror", "Team-Based", "Moddable", "Gore", "Survival Horror", "Post-apocalyptic", "Singleplayer", "Local Co-Op", "Adventure", "Tactical", "Replay Value"]
	}, {
		"appid": 570,
		"name": "Dota 2",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 78,
		"owners": 88267881,
		"owners_variance": 214804,
		"players_forever": 88267881,
		"players_forever_variance": 214804,
		"players_2weeks": 10473272,
		"players_2weeks_variance": 83918,
		"average_forever": 12294,
		"average_2weeks": 1329,
		"median_forever": 310,
		"median_2weeks": 776,
		"ccu": 1141191,
		"price": "0",
		"tags": ["Free to Play", "MOBA", "Strategy", "Multiplayer", "Team-Based", "Action", "e-sports", "Online Co-Op", "Competitive", "PvP", "RTS", "RPG", "Difficult", "Tower Defense", "Fantasy", "Co-op", "Replay Value", "Character Customization", "Action RPG", "Simulation"]
	}, {
		"appid": 620,
		"name": "Portal 2",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 99,
		"owners": 8992783,
		"owners_variance": 77925,
		"players_forever": 7511570,
		"players_forever_variance": 71369,
		"players_2weeks": 220433,
		"players_2weeks_variance": 12351,
		"average_forever": 995,
		"average_2weeks": 185,
		"median_forever": 585,
		"median_2weeks": 76,
		"ccu": 2762,
		"price": "1999",
		"tags": ["Puzzle", "Co-op", "First-Person", "Comedy", "Sci-fi", "Singleplayer", "Adventure", "Online Co-Op", "Funny", "Science", "Female Protagonist", "Action", "Story Rich", "Multiplayer", "FPS", "Atmospheric", "Local Co-Op", "Strategy", "Space", "Platformer"]
	}, {
		"appid": 630,
		"name": "Alien Swarm",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 93,
		"owners": 5010130,
		"owners_variance": 58493,
		"players_forever": 5010130,
		"players_forever_variance": 58493,
		"players_2weeks": 29367,
		"players_2weeks_variance": 4509,
		"average_forever": 342,
		"average_2weeks": 232,
		"median_forever": 98,
		"median_2weeks": 45,
		"ccu": 255,
		"price": "0",
		"tags": ["Free to Play", "Co-op", "Action", "Multiplayer", "Aliens", "Online Co-Op", "Shooter", "Sci-fi", "Top-Down", "Top-Down Shooter", "Survival", "Class-Based", "PvE", "Third Person", "Team-Based", "Third-Person Shooter", "Moddable", "Strategy", "Adventure", "Singleplayer"]
	}, {
		"appid": 730,
		"name": "Counter-Strike: Global Offensive",
		"developer": "Valve",
		"publisher": "Valve",
		"score_rank": 84,
		"owners": 25734972,
		"owners_variance": 128641,
		"players_forever": 25030530,
		"players_forever_variance": 127002,
		"players_2weeks": 8419948,
		"players_2weeks_variance": 75464,
		"average_forever": 16805,
		"average_2weeks": 828,
		"median_forever": 5036,
		"median_2weeks": 408,
		"ccu": 646283,
		"price": "1499",
		"tags": ["FPS", "Multiplayer", "Shooter", "Action", "Team-Based", "Competitive", "Tactical", "First-Person", "e-sports", "PvP", "Online Co-Op", "Military", "Co-op", "Strategy", "War", "Trading", "Realistic", "Difficult", "Fast-Paced", "Moddable"]
	}, {
		"appid": 1250,
		"name": "Killing Floor",
		"developer": "Tripwire Interactive",
		"publisher": "Tripwire Interactive",
		"score_rank": 96,
		"owners": 3527829,
		"owners_variance": 49185,
		"players_forever": 3076994,
		"players_forever_variance": 45964,
		"players_2weeks": 46588,
		"players_2weeks_variance": 5679,
		"average_forever": 2372,
		"average_2weeks": 267,
		"median_forever": 573,
		"median_2weeks": 66,
		"ccu": 899,
		"price": "1999",
		"tags": ["FPS", "Zombies", "Co-op", "Survival", "Action", "Horror", "Multiplayer", "Online Co-Op", "Shooter", "Gore", "Team-Based", "First-Person", "Moddable", "Survival Horror", "Great Soundtrack", "Singleplayer", "Class-Based", "Difficult", "Comedy", "Adventure"]
	}, {
		"appid": 4000,
		"name": "Garry's Mod",
		"developer": "Facepunch Studios",
		"publisher": "Valve",
		"score_rank": 93,
		"owners": 13157257,
		"owners_variance": 93696,
		"players_forever": 12215886,
		"players_forever_variance": 90404,
		"players_2weeks": 1155459,
		"players_2weeks_variance": 28242,
		"average_forever": 5650,
		"average_2weeks": 459,
		"median_forever": 980,
		"median_2weeks": 109,
		"ccu": 48573,
		"price": "999",
		"tags": ["Sandbox", "Multiplayer", "Funny", "Moddable", "Building", "Co-op", "Comedy", "First-Person", "Mod", "Simulation", "FPS", "Singleplayer", "Online Co-Op", "Indie", "Physics", "Action", "Shooter", "Animation & Modeling", "Adventure", "Massively Multiplayer"]
	}, {
		"appid": 7670,
		"name": "BioShock",
		"developer": "2K Boston, 2K Australia",
		"publisher": "2K Games",
		"score_rank": 91,
		"owners": 3772916,
		"owners_variance": 50848,
		"players_forever": 2512498,
		"players_forever_variance": 41567,
		"players_2weeks": 28642,
		"players_2weeks_variance": 4453,
		"average_forever": 428,
		"average_2weeks": 125,
		"median_forever": 168,
		"median_2weeks": 42,
		"ccu": 273,
		"price": "0",
		"tags": ["FPS", "Action", "Atmospheric", "Story Rich", "Singleplayer", "Steampunk", "Horror", "First-Person", "Shooter", "RPG", "Sci-fi", "Classic", "Adventure", "Dystopian", "Political", "Underwater", "Dark", "Great Soundtrack", "Alternate History", "Action RPG"]
	}, {
		"appid": 8190,
		"name": "Just Cause 2",
		"developer": "Avalanche Studios",
		"publisher": "Square Enix",
		"score_rank": 84,
		"owners": 4399771,
		"owners_variance": 54861,
		"players_forever": 3474171,
		"players_forever_variance": 48814,
		"players_2weeks": 53295,
		"players_2weeks_variance": 6074,
		"average_forever": 1077,
		"average_2weeks": 187,
		"median_forever": 213,
		"median_2weeks": 46,
		"ccu": 861,
		"price": "1499",
		"tags": ["Open World", "Action", "Sandbox", "Third Person", "Adventure", "Multiplayer", "Third-Person Shooter", "Shooter", "Singleplayer", "Exploration", "Destruction", "Funny", "Moddable", "Co-op", "Atmospheric", "3D Vision", "Comedy", "Physics", "Massively Multiplayer", "FPS"]
	}, {
		"appid": 8870,
		"name": "BioShock Infinite",
		"developer": "Irrational Games, Aspyr (Mac), Virtual Programming (Linux)",
		"publisher": "2K Games, Aspyr (Mac)",
		"score_rank": 93,
		"owners": 4783897,
		"owners_variance": 57175,
		"players_forever": 3599434,
		"players_forever_variance": 49677,
		"players_2weeks": 81031,
		"players_2weeks_variance": 7490,
		"average_forever": 876,
		"average_2weeks": 243,
		"median_forever": 644,
		"median_2weeks": 82,
		"ccu": 1366,
		"price": "2999",
		"tags": []
	}, {
		"appid": 8930,
		"name": "Sid Meier's Civilization V",
		"developer": "Firaxis Games, Aspyr (Mac, Linux)",
		"publisher": "2K Games, Aspyr (Mac, Linux)",
		"score_rank": 96,
		"owners": 10096034,
		"owners_variance": 82437,
		"players_forever": 9501809,
		"players_forever_variance": 80042,
		"players_2weeks": 1091468,
		"players_2weeks_variance": 27451,
		"average_forever": 10156,
		"average_2weeks": 828,
		"median_forever": 2462,
		"median_2weeks": 353,
		"ccu": 70614,
		"price": "2999",
		"tags": ["Turn-Based Strategy", "Strategy", "Turn-Based", "Multiplayer", "Historical", "4X", "Singleplayer", "Hex Grid", "Grand Strategy", "Co-op", "Replay Value", "Tactical", "Moddable", "Economy", "Diplomacy", "Simulation", "Great Soundtrack", "Classic", "Touch-Friendly", "Education"]
	}, {
		"appid": 8980,
		"name": "Borderlands",
		"developer": "Gearbox Software",
		"publisher": "2K Games",
		"score_rank": 91,
		"owners": 3213676,
		"owners_variance": 46965,
		"players_forever": 2682535,
		"players_forever_variance": 42941,
		"players_2weeks": 44594,
		"players_2weeks_variance": 5556,
		"average_forever": 1793,
		"average_2weeks": 277,
		"median_forever": 789,
		"median_2weeks": 88,
		"ccu": 1374,
		"price": "1999",
		"tags": ["FPS", "RPG", "Co-op", "Action", "Loot", "Online Co-Op", "Shooter", "First-Person", "Sci-fi", "Comedy", "Open World", "Multiplayer", "Post-apocalyptic", "Singleplayer", "Action RPG", "Funny", "Dark Humor", "Adventure", "Gore", "Local Co-Op"]
	}, {
		"appid": 10180,
		"name": "Call of Duty: Modern Warfare 2",
		"developer": "Infinity Ward, Aspyr (Mac)",
		"publisher": "Activision, Aspyr (Mac)",
		"score_rank": 81,
		"owners": 5373228,
		"owners_variance": 60544,
		"players_forever": 4801481,
		"players_forever_variance": 57279,
		"players_2weeks": 84294,
		"players_2weeks_variance": 7639,
		"average_forever": 1403,
		"average_2weeks": 116,
		"median_forever": 591,
		"median_2weeks": 41,
		"ccu": 1115,
		"price": "1999",
		"tags": ["Action", "FPS", "Multiplayer", "Shooter", "First-Person", "Singleplayer", "Co-op", "War", "Military", "Online Co-Op", "PvP", "Great Soundtrack", "Adventure", "Atmospheric", "Story Rich", "Linear", "Tactical", "Strategy", "Moddable", "Zombies"]
	}, {
		"appid": 10190,
		"name": "Call of Duty: Modern Warfare 2 - Multiplayer",
		"developer": "Infinity Ward, Aspyr (Mac)",
		"publisher": "Activision, Aspyr (Mac)",
		"score_rank": 81,
		"owners": 5373228,
		"owners_variance": 60544,
		"players_forever": 4738940,
		"players_forever_variance": 56910,
		"players_2weeks": 153904,
		"players_2weeks_variance": 10321,
		"average_forever": 8956,
		"average_2weeks": 187,
		"median_forever": 2619,
		"median_2weeks": 40,
		"ccu": 3201,
		"price": "1999",
		"tags": ["Action", "FPS", "Multiplayer", "Shooter", "First-Person", "Singleplayer", "Co-op", "War", "Military", "Online Co-Op", "PvP", "Great Soundtrack", "Adventure", "Atmospheric", "Story Rich", "Linear", "Tactical", "Strategy", "Moddable", "Zombies"]
	}, {
		"appid": 10500,
		"name": "Empire: Total War",
		"developer": "The Creative Assembly, Feral Interactive (Mac), Feral Interactive (Linux)",
		"publisher": "SEGA, Feral Interactive (Mac), Feral Interactive (Linux)",
		"score_rank": 81,
		"owners": 3739742,
		"owners_variance": 50626,
		"players_forever": 3277123,
		"players_forever_variance": 47422,
		"players_2weeks": 117830,
		"players_2weeks_variance": 9031,
		"average_forever": 6018,
		"average_2weeks": 557,
		"median_forever": 1366,
		"median_2weeks": 168,
		"ccu": 5290,
		"price": "1999",
		"tags": ["Strategy", "Historical", "Military", "Grand Strategy", "Turn-Based Strategy", "War", "Tactical", "RTS", "Multiplayer", "Singleplayer", "Turn-Based", "America", "Great Soundtrack", "Naval", "Action", "Turn-Based Tactics", "Real Time Tactics", "Atmospheric", "Adventure", "Classic"]
	}, {
		"appid": 12210,
		"name": "Grand Theft Auto IV",
		"developer": "Rockstar North, Rockstar Toronto",
		"publisher": "Rockstar Games",
		"score_rank": 23,
		"owners": 4366235,
		"owners_variance": 54654,
		"players_forever": 3685721,
		"players_forever_variance": 50263,
		"players_2weeks": 78312,
		"players_2weeks_variance": 7363,
		"average_forever": 1381,
		"average_2weeks": 142,
		"median_forever": 419,
		"median_2weeks": 28,
		"ccu": 1286,
		"price": "1999",
		"tags": ["Open World", "Action", "Bowling", "Multiplayer", "Third Person", "Adventure", "Crime", "Moddable", "Sandbox", "Third-Person Shooter", "Singleplayer", "Shooter", "Physics", "Atmospheric", "Classic", "Funny", "Dark Humor", "Co-op", "Gore", "Satire"]
	}, {
		"appid": 20920,
		"name": "The Witcher 2: Assassins of Kings Enhanced Edition",
		"developer": "CD PROJEKT RED",
		"publisher": "CD PROJEKT RED, 1C-SoftClub",
		"score_rank": 72,
		"owners": 4496029,
		"owners_variance": 55451,
		"players_forever": 3168539,
		"players_forever_variance": 46637,
		"players_2weeks": 53477,
		"players_2weeks_variance": 6085,
		"average_forever": 920,
		"average_2weeks": 226,
		"median_forever": 287,
		"median_2weeks": 51,
		"ccu": 1441,
		"price": "1999",
		"tags": ["RPG", "Fantasy", "Mature", "Choices Matter", "Story Rich", "Third Person", "Singleplayer", "Dark Fantasy", "Adventure", "Nudity", "Multiple Endings", "Action", "Atmospheric", "Based On A Novel", "Open World", "Difficult", "Dark", "Medieval", "Magic", "Nonlinear"]
	}, {
		"appid": 22380,
		"name": "Fallout: New Vegas",
		"developer": "Obsidian Entertainment",
		"publisher": "Bethesda Softworks",
		"score_rank": 93,
		"owners": 4746372,
		"owners_variance": 56954,
		"players_forever": 4160123,
		"players_forever_variance": 53364,
		"players_2weeks": 115292,
		"players_2weeks_variance": 8934,
		"average_forever": 3592,
		"average_2weeks": 412,
		"median_forever": 1318,
		"median_2weeks": 48,
		"ccu": 3589,
		"price": "999",
		"tags": ["Open World", "RPG", "Post-apocalyptic", "Singleplayer", "Moddable", "Action", "First-Person", "Exploration", "Adventure", "Sci-fi", "FPS", "Story Rich", "Atmospheric", "Western", "Sandbox", "Action RPG", "Survival", "Character Customization", "Shooter", "Third Person"]
	}, {
		"appid": 24200,
		"name": "DC Universe Online",
		"developer": "Daybreak Game Company",
		"publisher": "Daybreak Game Company",
		"score_rank": 56,
		"owners": 2506878,
		"owners_variance": 41521,
		"players_forever": 2506878,
		"players_forever_variance": 41521,
		"players_2weeks": 25197,
		"players_2weeks_variance": 4177,
		"average_forever": 1420,
		"average_2weeks": 372,
		"median_forever": 340,
		"median_2weeks": 129,
		"ccu": 979,
		"price": "0",
		"tags": ["Free to Play", "Superhero", "Action", "Massively Multiplayer", "RPG", "Adventure", "MMORPG", "Open World", "Multiplayer", "Batman", "Character Customization", "Comic Book", "Third Person", "Fighting", "Co-op", "Online Co-Op", "PvP", "Beat 'em up", "Fantasy", "Indie"]
	}, {
		"appid": 24240,
		"name": "PAYDAY: The Heist",
		"developer": "OVERKILL Software",
		"publisher": "Daybreak Game Company",
		"score_rank": 88,
		"owners": 4549868,
		"owners_variance": 55778,
		"players_forever": 3522028,
		"players_forever_variance": 49145,
		"players_2weeks": 37343,
		"players_2weeks_variance": 5085,
		"average_forever": 505,
		"average_2weeks": 108,
		"median_forever": 169,
		"median_2weeks": 34,
		"ccu": 456,
		"price": "1499",
		"tags": ["FPS", "Action", "Co-op", "Heist", "Crime", "Online Co-Op", "Multiplayer", "Shooter", "First-Person", "Great Soundtrack", "Team-Based", "Difficult", "Stealth", "Tactical", "Strategy", "Singleplayer", "Simulation", "RPG", "Indie", "Adventure"]
	}, {
		"appid": 33910,
		"name": "Arma 2",
		"developer": "Bohemia Interactive",
		"publisher": "Bohemia Interactive",
		"score_rank": 58,
		"owners": 3315192,
		"owners_variance": 47694,
		"players_forever": 2710814,
		"players_forever_variance": 43165,
		"players_2weeks": 29911,
		"players_2weeks_variance": 4551,
		"average_forever": 230,
		"average_2weeks": 52,
		"median_forever": 29,
		"median_2weeks": 8,
		"ccu": 158,
		"price": "1299",
		"tags": ["Simulation", "Action", "Military", "Multiplayer", "Tactical", "Realistic", "FPS", "Open World", "Strategy", "Shooter", "First-Person", "Moddable", "Co-op", "War", "Singleplayer", "Third Person", "Sandbox", "Zombies", "Third-Person Shooter", "TrackIR"]
	}, {
		"appid": 33930,
		"name": "Arma 2: Operation Arrowhead",
		"developer": "Bohemia Interactive",
		"publisher": "Bohemia Interactive",
		"score_rank": 84,
		"owners": 4306414,
		"owners_variance": 54283,
		"players_forever": 3799382,
		"players_forever_variance": 51024,
		"players_2weeks": 94264,
		"players_2weeks_variance": 8078,
		"average_forever": 3081,
		"average_2weeks": 473,
		"median_forever": 218,
		"median_2weeks": 104,
		"ccu": 4658,
		"price": "1999",
		"tags": ["Simulation", "Action", "Military", "Multiplayer", "Strategy", "Tactical", "Realistic", "Shooter", "FPS", "Open World", "Moddable", "War", "First-Person", "Sandbox", "Team-Based", "Modern", "Co-op", "Singleplayer", "Difficult", "Third Person"]
	}, {
		"appid": 34330,
		"name": "Total War: SHOGUN 2",
		"developer": "The Creative Assembly, Feral Interactive (Mac)",
		"publisher": "SEGA, Feral Interactive (Mac)",
		"score_rank": 81,
		"owners": 3074637,
		"owners_variance": 45947,
		"players_forever": 2730211,
		"players_forever_variance": 43318,
		"players_2weeks": 111304,
		"players_2weeks_variance": 8778,
		"average_forever": 4553,
		"average_2weeks": 487,
		"median_forever": 1389,
		"median_2weeks": 133,
		"ccu": 4002,
		"price": "2499",
		"tags": ["Strategy", "Turn-Based Strategy", "RTS", "Historical", "Grand Strategy", "Tactical", "Singleplayer", "Real Time Tactics", "Multiplayer", "Diplomacy", "Ninja", "Military", "Turn-Based", "Co-op", "Stylized", "Great Soundtrack", "Medieval", "Turn-Based Tactics", "Moddable", "Action"]
	}, {
		"appid": 42680,
		"name": "Call of Duty: Modern Warfare 3",
		"developer": "Infinity Ward, Sledgehammer Games, Aspyr (Mac)",
		"publisher": "Activision, Aspyr (Mac)",
		"score_rank": "",
		"owners": 3533993,
		"owners_variance": 49228,
		"players_forever": 3191742,
		"players_forever_variance": 46806,
		"players_2weeks": 78312,
		"players_2weeks_variance": 7363,
		"average_forever": 1387,
		"average_2weeks": 164,
		"median_forever": 559,
		"median_2weeks": 42,
		"ccu": 1157,
		"price": "3999",
		"tags": ["Action", "FPS", "Multiplayer", "Shooter", "First-Person", "War", "Singleplayer", "Military", "Online Co-Op", "Co-op", "Casual", "Survival", "Point & Click", "Story Rich", "Linear", "Adventure", "Controller", "Family Friendly", "Free to Play", "Pixel Graphics"]
	}, {
		"appid": 42690,
		"name": "Call of Duty: Modern Warfare 3 - Multiplayer",
		"developer": "Infinity Ward, Sledgehammer Games, Aspyr (Mac)",
		"publisher": "Activision, Aspyr (Mac)",
		"score_rank": "",
		"owners": 3533993,
		"owners_variance": 49228,
		"players_forever": 3046539,
		"players_forever_variance": 45738,
		"players_2weeks": 115655,
		"players_2weeks_variance": 8948,
		"average_forever": 6797,
		"average_2weeks": 215,
		"median_forever": 1744,
		"median_2weeks": 41,
		"ccu": 3418,
		"price": "3999",
		"tags": ["Action", "FPS", "Multiplayer", "Shooter", "First-Person", "War", "Singleplayer", "Military", "Online Co-Op", "Co-op", "Casual", "Survival", "Point & Click", "Story Rich", "Linear", "Adventure", "Controller", "Family Friendly", "Free to Play", "Pixel Graphics"]
	}, {
		"appid": 42700,
		"name": "Call of Duty: Black Ops",
		"developer": "Treyarch",
		"publisher": "Activision",
		"score_rank": 72,
		"owners": 3774547,
		"owners_variance": 50859,
		"players_forever": 3587469,
		"players_forever_variance": 49595,
		"players_2weeks": 68160,
		"players_2weeks_variance": 6869,
		"average_forever": 1483,
		"average_2weeks": 140,
		"median_forever": 559,
		"median_2weeks": 41,
		"ccu": 914,
		"price": "3999",
		"tags": ["Action", "FPS", "Zombies", "Multiplayer", "Shooter", "Cold War", "Singleplayer", "First-Person", "War", "Military", "Online Co-Op", "Co-op", "Adventure", "Gore", "Story Rich", "Controller", "Linear", "Horror", "Massively Multiplayer", "Point & Click"]
	}, {
		"appid": 42710,
		"name": "Call of Duty: Black Ops - Multiplayer",
		"developer": "Treyarch",
		"publisher": "Activision",
		"score_rank": "",
		"owners": 3774547,
		"owners_variance": 50859,
		"players_forever": 3183403,
		"players_forever_variance": 46745,
		"players_2weeks": 58915,
		"players_2weeks_variance": 6387,
		"average_forever": 4574,
		"average_2weeks": 237,
		"median_forever": 1104,
		"median_2weeks": 37,
		"ccu": 1225,
		"price": "3999",
		"tags": ["Action", "FPS", "Zombies", "Multiplayer", "Shooter", "Cold War", "Singleplayer", "First-Person", "War", "Military", "Online Co-Op", "Co-op", "Adventure", "Gore", "Story Rich", "Controller", "Linear", "Horror", "Massively Multiplayer", "Point & Click"]
	}, {
		"appid": 42910,
		"name": "Magicka",
		"developer": "Arrowhead Game Studios",
		"publisher": "Paradox Interactive",
		"score_rank": 88,
		"owners": 3920112,
		"owners_variance": 51820,
		"players_forever": 3315192,
		"players_forever_variance": 47694,
		"players_2weeks": 29911,
		"players_2weeks_variance": 4551,
		"average_forever": 620,
		"average_2weeks": 163,
		"median_forever": 285,
		"median_2weeks": 71,
		"ccu": 296,
		"price": "999",
		"tags": ["Comedy", "Action", "Co-op", "Fantasy", "RPG", "Online Co-Op", "Multiplayer", "Adventure", "Funny", "Magic", "Local Co-Op", "Indie", "4 Player Local", "Local Multiplayer", "Difficult", "Singleplayer", "Team-Based", "Action RPG", "Strategy", "Arcade"]
	}, {
		"appid": 43110,
		"name": "Metro 2033",
		"developer": "4A Games",
		"publisher": "Deep Silver",
		"score_rank": 84,
		"owners": 4943058,
		"owners_variance": 58106,
		"players_forever": 3199537,
		"players_forever_variance": 46863,
		"players_2weeks": 16677,
		"players_2weeks_variance": 3398,
		"average_forever": 442,
		"average_2weeks": 157,
		"median_forever": 155,
		"median_2weeks": 21,
		"ccu": 265,
		"price": "374",
		"tags": ["FPS", "Post-apocalyptic", "Action", "Atmospheric", "Horror", "Singleplayer", "Based On A Novel", "Shooter", "Story Rich", "First-Person", "Sci-fi", "Linear", "Stealth", "Adventure", "Dark", "Survival Horror", "Great Soundtrack", "Survival", "3D Vision", "Benchmark"]
	}, {
		"appid": 48000,
		"name": "LIMBO",
		"developer": "Playdead",
		"publisher": "Playdead",
		"score_rank": 91,
		"owners": 4104834,
		"owners_variance": 53013,
		"players_forever": 2452857,
		"players_forever_variance": 41075,
		"players_2weeks": 39518,
		"players_2weeks_variance": 5231,
		"average_forever": 169,
		"average_2weeks": 76,
		"median_forever": 101,
		"median_2weeks": 17,
		"ccu": 214,
		"price": "999",
		"tags": ["Platformer", "Indie", "Puzzle", "Atmospheric", "Dark", "Adventure", "2D", "Singleplayer", "Horror", "Puzzle-Platformer", "Surreal", "Short", "Difficult", "Side Scroller", "Casual", "Physics", "Minimalist", "Cinematic", "Action", "Controller"]
	}, {
		"appid": 49520,
		"name": "Borderlands 2",
		"developer": "Gearbox Software, Aspyr (Mac & Linux)",
		"publisher": "2K Games, Aspyr (Mac & Linux)",
		"score_rank": 96,
		"owners": 7173489,
		"owners_variance": 69778,
		"players_forever": 6453457,
		"players_forever_variance": 66251,
		"players_2weeks": 304726,
		"players_2weeks_variance": 14521,
		"average_forever": 3511,
		"average_2weeks": 441,
		"median_forever": 1419,
		"median_2weeks": 121,
		"ccu": 10261,
		"price": "1999",
		"tags": []
	}, {
		"appid": 55230,
		"name": "Saints Row: The Third",
		"developer": "Volition",
		"publisher": "Deep Silver",
		"score_rank": 96,
		"owners": 4103383,
		"owners_variance": 53003,
		"players_forever": 3292532,
		"players_forever_variance": 47533,
		"players_2weeks": 76861,
		"players_2weeks_variance": 7295,
		"average_forever": 1578,
		"average_2weeks": 246,
		"median_forever": 939,
		"median_2weeks": 97,
		"ccu": 3627,
		"price": "249",
		"tags": []
	}, {
		"appid": 63380,
		"name": "Sniper Elite V2",
		"developer": "Rebellion",
		"publisher": "Rebellion",
		"score_rank": 72,
		"owners": 3771103,
		"owners_variance": 50836,
		"players_forever": 2784775,
		"players_forever_variance": 43745,
		"players_2weeks": 39156,
		"players_2weeks_variance": 5207,
		"average_forever": 511,
		"average_2weeks": 134,
		"median_forever": 195,
		"median_2weeks": 50,
		"ccu": 514,
		"price": "2999",
		"tags": ["Sniper", "Action", "Stealth", "World War II", "Co-op", "Shooter", "Third-Person Shooter", "Multiplayer", "Third Person", "Singleplayer", "Bullet Time", "FPS", "War", "Online Co-Op", "Tactical", "Strategy", "Historical", "Simulation", "Adventure", "Gore"]
	}, {
		"appid": 72850,
		"name": "The Elder Scrolls V: Skyrim",
		"developer": "Bethesda Game Studios",
		"publisher": "Bethesda Softworks",
		"score_rank": 88,
		"owners": 11770670,
		"owners_variance": 88798,
		"players_forever": 11247143,
		"players_forever_variance": 86866,
		"players_2weeks": 863784,
		"players_2weeks_variance": 24429,
		"average_forever": 7069,
		"average_2weeks": 509,
		"median_forever": 2885,
		"median_2weeks": 114,
		"ccu": 39914,
		"price": "1999",
		"tags": ["Open World", "RPG", "Fantasy", "Adventure", "Moddable", "Dragons", "First-Person", "Action", "Medieval", "Magic", "Singleplayer", "Story Rich", "Great Soundtrack", "Sandbox", "Lore-Rich", "Atmospheric", "Character Customization", "Action RPG", "Third Person", "Dark Fantasy"]
	}, {
		"appid": 91310,
		"name": "Dead Island",
		"developer": "Techland",
		"publisher": "Deep Silver",
		"score_rank": "",
		"owners": 3738473,
		"owners_variance": 50618,
		"players_forever": 3185579,
		"players_forever_variance": 46761,
		"players_2weeks": 34805,
		"players_2weeks_variance": 4909,
		"average_forever": 1087,
		"average_2weeks": 169,
		"median_forever": 457,
		"median_2weeks": 41,
		"ccu": 674,
		"price": "1999",
		"tags": []
	}, {
		"appid": 105600,
		"name": "Terraria",
		"developer": "Re-Logic",
		"publisher": "Re-Logic",
		"score_rank": 96,
		"owners": 8348344,
		"owners_variance": 75150,
		"players_forever": 7909473,
		"players_forever_variance": 73194,
		"players_2weeks": 560327,
		"players_2weeks_variance": 19683,
		"average_forever": 4649,
		"average_2weeks": 464,
		"median_forever": 1408,
		"median_2weeks": 88,
		"ccu": 22169,
		"price": "999",
		"tags": ["Sandbox", "Adventure", "2D", "Survival", "Crafting", "Multiplayer", "Building", "Exploration", "Pixel Graphics", "Indie", "Co-op", "Action", "Open World", "RPG", "Platformer", "Online Co-Op", "Singleplayer", "Replay Value", "Family Friendly", "Atmospheric"]
	}, {
		"appid": 107410,
		"name": "Arma 3",
		"developer": "Bohemia Interactive",
		"publisher": "Bohemia Interactive",
		"score_rank": 75,
		"owners": 2862543,
		"owners_variance": 44347,
		"players_forever": 2816318,
		"players_forever_variance": 43990,
		"players_2weeks": 450473,
		"players_2weeks_variance": 17651,
		"average_forever": 10544,
		"average_2weeks": 1021,
		"median_forever": 2280,
		"median_2weeks": 326,
		"ccu": 39311,
		"price": "3999",
		"tags": ["Simulation", "Military", "Multiplayer", "Tactical", "Action", "Realistic", "Open World", "FPS", "War", "Strategy", "Sandbox", "Shooter", "Co-op", "Moddable", "Team-Based", "Third-Person Shooter", "Online Co-Op", "Singleplayer", "First-Person", "TrackIR"]
	}, {
		"appid": 109600,
		"name": "Neverwinter",
		"developer": "Cryptic Studios",
		"publisher": "Perfect World Entertainment",
		"score_rank": 47,
		"owners": 4565821,
		"owners_variance": 55874,
		"players_forever": 2786588,
		"players_forever_variance": 43759,
		"players_2weeks": 55289,
		"players_2weeks_variance": 6187,
		"average_forever": 1544,
		"average_2weeks": 691,
		"median_forever": 289,
		"median_2weeks": 144,
		"ccu": 3028,
		"price": "0",
		"tags": ["Free to Play", "MMORPG", "RPG", "Massively Multiplayer", "Adventure", "Action", "Fantasy", "Multiplayer", "Open World", "Character Customization", "Dragons", "Co-op", "PvP", "Action RPG", "Third Person", "PvE", "Atmospheric", "Hack and Slash", "Zombies", "Comedy"]
	}, {
		"appid": 113200,
		"name": "The Binding of Isaac",
		"developer": "Edmund McMillen and Florian Himsl",
		"publisher": "Edmund McMillen",
		"score_rank": 96,
		"owners": 3103460,
		"owners_variance": 46160,
		"players_forever": 2772630,
		"players_forever_variance": 43650,
		"players_2weeks": 54564,
		"players_2weeks_variance": 6146,
		"average_forever": 1834,
		"average_2weeks": 152,
		"median_forever": 378,
		"median_2weeks": 34,
		"ccu": 723,
		"price": "499",
		"tags": ["Rogue-like", "Indie", "Replay Value", "Difficult", "Procedural Generation", "Action", "Dark", "Top-Down", "Great Soundtrack", "Adventure", "Singleplayer", "RPG", "Rogue-lite", "Survival", "Perma Death", "2D", "Dungeon Crawler", "Bullet Hell", "Atmospheric", "Arena Shooter"]
	}, {
		"appid": 113400,
		"name": "APB Reloaded",
		"developer": "Reloaded Productions",
		"publisher": "Reloaded Games",
		"score_rank": 23,
		"owners": 4633437,
		"owners_variance": 56281,
		"players_forever": 2786407,
		"players_forever_variance": 43758,
		"players_2weeks": 49126,
		"players_2weeks_variance": 5832,
		"average_forever": 1564,
		"average_2weeks": 402,
		"median_forever": 145,
		"median_2weeks": 102,
		"ccu": 2013,
		"price": "0",
		"tags": []
	}, {
		"appid": 200510,
		"name": "XCOM: Enemy Unknown",
		"developer": "Firaxis Games, Feral Interactive (Mac), Feral Interactive (Linux)",
		"publisher": "2K Games, Feral Interactive (Mac), Feral Interactive (Linux)",
		"score_rank": 93,
		"owners": 3657442,
		"owners_variance": 50072,
		"players_forever": 3110349,
		"players_forever_variance": 46211,
		"players_2weeks": 66166,
		"players_2weeks_variance": 6768,
		"average_forever": 3099,
		"average_2weeks": 527,
		"median_forever": 1422,
		"median_2weeks": 142,
		"ccu": 2677,
		"price": "2999",
		"tags": []
	}, {
		"appid": 200710,
		"name": "Torchlight II",
		"developer": "Runic Games",
		"publisher": "Runic Games",
		"score_rank": 93,
		"owners": 3472177,
		"owners_variance": 48800,
		"players_forever": 3153311,
		"players_forever_variance": 46526,
		"players_2weeks": 52389,
		"players_2weeks_variance": 6023,
		"average_forever": 1470,
		"average_2weeks": 321,
		"median_forever": 678,
		"median_2weeks": 92,
		"ccu": 1147,
		"price": "1999",
		"tags": ["RPG", "Action RPG", "Hack and Slash", "Co-op", "Dungeon Crawler", "Loot", "Fantasy", "Action", "Online Co-Op", "Adventure", "Multiplayer", "Indie", "Singleplayer", "Moddable", "Character Customization", "Replay Value", "Isometric", "Steampunk", "Atmospheric", "Cartoon"]
	}, {
		"appid": 202970,
		"name": "Call of Duty: Black Ops II",
		"developer": "Treyarch",
		"publisher": "Activision",
		"score_rank": 60,
		"owners": 3113249,
		"owners_variance": 46232,
		"players_forever": 2560355,
		"players_forever_variance": 41959,
		"players_2weeks": 59096,
		"players_2weeks_variance": 6396,
		"average_forever": 557,
		"average_2weeks": 133,
		"median_forever": 208,
		"median_2weeks": 21,
		"ccu": 719,
		"price": "5999",
		"tags": []
	}, {
		"appid": 202990,
		"name": "Call of Duty: Black Ops II - Multiplayer",
		"developer": "Treyarch",
		"publisher": "Activision",
		"score_rank": "",
		"owners": 3113249,
		"owners_variance": 46232,
		"players_forever": 2741632,
		"players_forever_variance": 43408,
		"players_2weeks": 175839,
		"players_2weeks_variance": 11032,
		"average_forever": 5280,
		"average_2weeks": 168,
		"median_forever": 1199,
		"median_2weeks": 26,
		"ccu": 3551,
		"price": "5999",
		"tags": []
	}, {
		"appid": 203160,
		"name": "Tomb Raider",
		"developer": "Crystal Dynamics, Feral Interactive (Mac), Feral Interactive (Linux)",
		"publisher": "Square Enix, Feral Interactive (Mac), Feral Interactive (Linux)",
		"score_rank": 93,
		"owners": 4511256,
		"owners_variance": 55543,
		"players_forever": 3735029,
		"players_forever_variance": 50595,
		"players_2weeks": 74142,
		"players_2weeks_variance": 7164,
		"average_forever": 953,
		"average_2weeks": 204,
		"median_forever": 647,
		"median_2weeks": 61,
		"ccu": 1616,
		"price": "1999",
		"tags": []
	}, {
		"appid": 204360,
		"name": "Castle Crashers",
		"developer": "The Behemoth",
		"publisher": "The Behemoth",
		"score_rank": 96,
		"owners": 3299239,
		"owners_variance": 47581,
		"players_forever": 2892273,
		"players_forever_variance": 44575,
		"players_2weeks": 52389,
		"players_2weeks_variance": 6023,
		"average_forever": 537,
		"average_2weeks": 93,
		"median_forever": 247,
		"median_2weeks": 27,
		"ccu": 641,
		"price": "1499",
		"tags": ["Action", "Co-op", "Adventure", "Beat 'em up", "Local Co-Op", "Indie", "Multiplayer", "Funny", "Comedy", "Online Co-Op", "RPG", "Hack and Slash", "2D", "Casual", "Local Multiplayer", "Controller", "Fantasy", "Great Soundtrack", "Side Scroller", "Action RPG"]
	}, {
		"appid": 205100,
		"name": "Dishonored",
		"developer": "Arkane Studios",
		"publisher": "Bethesda Softworks",
		"score_rank": 98,
		"owners": 2817224,
		"owners_variance": 43997,
		"players_forever": 2421678,
		"players_forever_variance": 40814,
		"players_2weeks": 85925,
		"players_2weeks_variance": 7713,
		"average_forever": 1056,
		"average_2weeks": 242,
		"median_forever": 636,
		"median_2weeks": 91,
		"ccu": 2264,
		"price": "999",
		"tags": ["Stealth", "Steampunk", "First-Person", "Action", "Assassin", "Singleplayer", "Atmospheric", "Adventure", "Story Rich", "Multiple Endings", "Dark", "Dystopian", "Magic", "FPS", "RPG", "Replay Value", "Fantasy", "Open World", "Shooter", "Sci-fi"]
	}, {
		"appid": 206420,
		"name": "Saints Row IV",
		"developer": "Deep Silver Volition",
		"publisher": "Deep Silver",
		"score_rank": 84,
		"owners": 3144429,
		"owners_variance": 46461,
		"players_forever": 2676734,
		"players_forever_variance": 42895,
		"players_2weeks": 89551,
		"players_2weeks_variance": 7874,
		"average_forever": 1232,
		"average_2weeks": 198,
		"median_forever": 841,
		"median_2weeks": 77,
		"ccu": 4977,
		"price": "374",
		"tags": ["Open World", "Action", "Comedy", "Co-op", "Third-Person Shooter", "Superhero", "Sandbox", "Third Person", "Funny", "Character Customization", "Adventure", "Online Co-Op", "Aliens", "Parody", "Great Soundtrack", "Multiplayer", "Sci-fi", "Female Protagonist", "Singleplayer", "Dark Humor"]
	}, {
		"appid": 208090,
		"name": "Loadout",
		"developer": "Edge of Reality",
		"publisher": "Edge of Reality",
		"score_rank": 66,
		"owners": 5639161,
		"owners_variance": 62001,
		"players_forever": 3369756,
		"players_forever_variance": 48082,
		"players_2weeks": 28460,
		"players_2weeks_variance": 4439,
		"average_forever": 399,
		"average_2weeks": 63,
		"median_forever": 120,
		"median_2weeks": 20,
		"ccu": 342,
		"price": "0",
		"tags": []
	}, {
		"appid": 211420,
		"name": "Dark Souls: Prepare to Die Edition",
		"developer": "FromSoftware",
		"publisher": "BANDAI NAMCO Entertainment",
		"score_rank": 75,
		"owners": 2949919,
		"owners_variance": 45013,
		"players_forever": 2614013,
		"players_forever_variance": 42393,
		"players_2weeks": 142121,
		"players_2weeks_variance": 9919,
		"average_forever": 2583,
		"average_2weeks": 365,
		"median_forever": 532,
		"median_2weeks": 91,
		"ccu": 4387,
		"price": "1999",
		"tags": ["RPG", "Dark Fantasy", "Difficult", "Action", "Exploration", "Fantasy", "Lore-Rich", "Adventure", "Atmospheric", "Action RPG", "Third Person", "Open World", "Replay Value", "Multiplayer", "Dark", "Great Soundtrack", "Story Rich", "Singleplayer", "Character Customization", "Medieval"]
	}, {
		"appid": 211820,
		"name": "Starbound",
		"developer": "",
		"publisher": "Chucklefish",
		"score_rank": 75,
		"owners": 2627608,
		"owners_variance": 42502,
		"players_forever": 2563255,
		"players_forever_variance": 41982,
		"players_2weeks": 163149,
		"players_2weeks_variance": 10627,
		"average_forever": 3258,
		"average_2weeks": 456,
		"median_forever": 1530,
		"median_2weeks": 94,
		"ccu": 5382,
		"price": "1499",
		"tags": ["Sandbox", "Indie", "Adventure", "Survival", "Crafting", "Space", "Multiplayer", "Building", "2D", "Pixel Graphics", "RPG", "Action", "Platformer", "Exploration", "Open World", "Sci-fi", "Co-op", "Singleplayer", "Atmospheric", "Great Soundtrack"]
	}, {
		"appid": 218230,
		"name": "PlanetSide 2",
		"developer": "Daybreak Game Company",
		"publisher": "Daybreak Game Company",
		"score_rank": 60,
		"owners": 6994387,
		"owners_variance": 68919,
		"players_forever": 4362609,
		"players_forever_variance": 54632,
		"players_2weeks": 125806,
		"players_2weeks_variance": 9332,
		"average_forever": 1759,
		"average_2weeks": 412,
		"median_forever": 189,
		"median_2weeks": 69,
		"ccu": 3478,
		"price": "0",
		"tags": ["Free to Play", "Massively Multiplayer", "FPS", "Action", "Shooter", "Team-Based", "Open World", "Multiplayer", "Tactical", "Sci-fi", "War", "First-Person", "Futuristic", "PvP", "Co-op", "Strategy", "Online Co-Op", "Space", "Adventure", "RPG"]
	}, {
		"appid": 218620,
		"name": "PAYDAY 2",
		"developer": "OVERKILL - a Starbreeze Studio.",
		"publisher": "505 Games",
		"score_rank": 49,
		"owners": 7559608,
		"owners_variance": 71592,
		"players_forever": 6945805,
		"players_forever_variance": 68684,
		"players_2weeks": 636463,
		"players_2weeks_variance": 20976,
		"average_forever": 3188,
		"average_2weeks": 458,
		"median_forever": 1018,
		"median_2weeks": 148,
		"ccu": 41370,
		"price": "1999",
		"tags": []
	}, {
		"appid": 219640,
		"name": "Chivalry: Medieval Warfare",
		"developer": "Torn Banner Studios",
		"publisher": "Torn Banner Studios",
		"score_rank": 60,
		"owners": 4282485,
		"owners_variance": 54134,
		"players_forever": 3779260,
		"players_forever_variance": 50890,
		"players_2weeks": 242005,
		"players_2weeks_variance": 12941,
		"average_forever": 1176,
		"average_2weeks": 152,
		"median_forever": 291,
		"median_2weeks": 56,
		"ccu": 11797,
		"price": "2499",
		"tags": ["Medieval", "Multiplayer", "Action", "First-Person", "Gore", "Violent", "Swordplay", "Indie", "PvP", "Third Person", "Competitive", "Team-Based", "Hack and Slash", "Historical", "Atmospheric", "Class-Based", "FPS", "Co-op", "Simulation", "Difficult"]
	}, {
		"appid": 219740,
		"name": "Don't Starve",
		"developer": "Klei Entertainment",
		"publisher": "Klei Entertainment",
		"score_rank": 98,
		"owners": 3776541,
		"owners_variance": 50872,
		"players_forever": 3285825,
		"players_forever_variance": 47485,
		"players_2weeks": 117830,
		"players_2weeks_variance": 9031,
		"average_forever": 1337,
		"average_2weeks": 318,
		"median_forever": 380,
		"median_2weeks": 71,
		"ccu": 3102,
		"price": "1499",
		"tags": ["Survival", "Indie", "Crafting", "Adventure", "Sandbox", "Singleplayer", "Perma Death", "Rogue-like", "Exploration", "Open World", "Replay Value", "Moddable", "Multiplayer", "Simulation", "Difficult", "Top-Down", "2D", "Horror", "Survival Horror", "Action"]
	}, {
		"appid": 220240,
		"name": "Far Cry 3",
		"developer": "Ubisoft Montreal, Massive Entertainment, and Ubisoft Shanghai",
		"publisher": "Ubisoft",
		"score_rank": 75,
		"owners": 3136815,
		"owners_variance": 46405,
		"players_forever": 2780243,
		"players_forever_variance": 43710,
		"players_2weeks": 66891,
		"players_2weeks_variance": 6805,
		"average_forever": 1687,
		"average_2weeks": 266,
		"median_forever": 1019,
		"median_2weeks": 65,
		"ccu": 1394,
		"price": "1999",
		"tags": ["Open World", "FPS", "Action", "Adventure", "Shooter", "Stealth", "Hunting", "First-Person", "Co-op", "Singleplayer", "Multiplayer", "Sandbox", "Survival", "Story Rich", "Colorful", "Atmospheric", "Online Co-Op", "Crafting", "RPG", "Nudity"]
	}, {
		"appid": 221100,
		"name": "DayZ",
		"developer": "Bohemia Interactive",
		"publisher": "Bohemia Interactive",
		"score_rank": 32,
		"owners": 3835275,
		"owners_variance": 51262,
		"players_forever": 3799745,
		"players_forever_variance": 51026,
		"players_2weeks": 220251,
		"players_2weeks_variance": 12346,
		"average_forever": 4562,
		"average_2weeks": 398,
		"median_forever": 1273,
		"median_2weeks": 71,
		"ccu": 8846,
		"price": "3499",
		"tags": []
	}, {
		"appid": 221380,
		"name": "Age of Empires II: HD Edition",
		"developer": "Skybox Labs, Hidden Path Entertainment, Ensemble Studios",
		"publisher": "Microsoft Studios",
		"score_rank": 84,
		"owners": 3868086,
		"owners_variance": 51478,
		"players_forever": 3471271,
		"players_forever_variance": 48793,
		"players_2weeks": 246174,
		"players_2weeks_variance": 13052,
		"average_forever": 2139,
		"average_2weeks": 418,
		"median_forever": 511,
		"median_2weeks": 154,
		"ccu": 9363,
		"price": "1999",
		"tags": ["Strategy", "RTS", "Classic", "Medieval", "Multiplayer", "Historical", "Singleplayer", "Co-op", "Competitive", "Base-Building", "Resource Management", "Tactical", "City Builder", "Real-Time", "Remake", "Replay Value", "2D", "Isometric", "Action", "Adventure"]
	}, {
		"appid": 222880,
		"name": "Insurgency",
		"developer": "New World Interactive",
		"publisher": "New World Interactive",
		"score_rank": 81,
		"owners": 3155487,
		"owners_variance": 46542,
		"players_forever": 2590447,
		"players_forever_variance": 42203,
		"players_2weeks": 196867,
		"players_2weeks_variance": 11673,
		"average_forever": 1137,
		"average_2weeks": 188,
		"median_forever": 290,
		"median_2weeks": 48,
		"ccu": 2892,
		"price": "999",
		"tags": ["FPS", "Realistic", "Tactical", "Multiplayer", "Action", "Shooter", "Military", "Team-Based", "Co-op", "Strategy", "First-Person", "Indie", "Online Co-Op", "Competitive", "War", "Simulation", "PvP", "Atmospheric", "Singleplayer", "Adventure"]
	}, {
		"appid": 224260,
		"name": "No More Room in Hell",
		"developer": "No More Room in Hell Team",
		"publisher": "Lever Games",
		"score_rank": 78,
		"owners": 7232404,
		"owners_variance": 70058,
		"players_forever": 4512888,
		"players_forever_variance": 55553,
		"players_2weeks": 108041,
		"players_2weeks_variance": 8648,
		"average_forever": 428,
		"average_2weeks": 162,
		"median_forever": 90,
		"median_2weeks": 42,
		"ccu": 1270,
		"price": "0",
		"tags": ["Free to Play", "Zombies", "Survival", "Multiplayer", "Horror", "Action", "Co-op", "Online Co-Op", "FPS", "First-Person", "Shooter", "Survival Horror", "Post-apocalyptic", "Indie", "Realistic", "Open World", "Atmospheric", "Mod", "Adventure", "Massively Multiplayer"]
	}, {
		"appid": 227300,
		"name": "Euro Truck Simulator 2",
		"developer": "SCS Software",
		"publisher": "SCS Software",
		"score_rank": 98,
		"owners": 3271504,
		"owners_variance": 47382,
		"players_forever": 3026599,
		"players_forever_variance": 45590,
		"players_2weeks": 457180,
		"players_2weeks_variance": 17782,
		"average_forever": 3994,
		"average_2weeks": 416,
		"median_forever": 1163,
		"median_2weeks": 148,
		"ccu": 20584,
		"price": "1149",
		"tags": ["Simulation", "Driving", "Open World", "Realistic", "Relaxing", "Singleplayer", "Exploration", "Moddable", "First-Person", "Economy", "Indie", "Adventure", "Atmospheric", "TrackIR", "Management", "Casual", "Sandbox", "RPG", "Action", "Racing"]
	}, {
		"appid": 227940,
		"name": "Heroes & Generals",
		"developer": "Reto-Moto",
		"publisher": "Reto-Moto",
		"score_rank": 27,
		"owners": 12236371,
		"owners_variance": 90477,
		"players_forever": 8104889,
		"players_forever_variance": 74072,
		"players_2weeks": 502137,
		"players_2weeks_variance": 18635,
		"average_forever": 724,
		"average_2weeks": 300,
		"median_forever": 55,
		"median_2weeks": 53,
		"ccu": 12412,
		"price": "0",
		"tags": ["Free to Play", "World War II", "Multiplayer", "FPS", "War", "Action", "Shooter", "Massively Multiplayer", "First-Person", "Strategy", "Tactical", "Co-op", "Historical", "Open World", "Simulation", "Atmospheric", "Singleplayer", "Adventure", "Indie", "RTS"]
	}, {
		"appid": 230410,
		"name": "Warframe",
		"developer": "Digital Extremes",
		"publisher": "Digital Extremes",
		"score_rank": 81,
		"owners": 14396103,
		"owners_variance": 97833,
		"players_forever": 8832172,
		"players_forever_variance": 77244,
		"players_2weeks": 545281,
		"players_2weeks_variance": 19418,
		"average_forever": 4176,
		"average_2weeks": 804,
		"median_forever": 293,
		"median_2weeks": 143,
		"ccu": 28877,
		"price": "0",
		"tags": []
	}, {
		"appid": 236390,
		"name": "War Thunder",
		"developer": "Gaijin Entertainment",
		"publisher": "Gaijin Entertainment",
		"score_rank": 58,
		"owners": 10508258,
		"owners_variance": 84053,
		"players_forever": 6249883,
		"players_forever_variance": 65216,
		"players_2weeks": 457905,
		"players_2weeks_variance": 17796,
		"average_forever": 2652,
		"average_2weeks": 512,
		"median_forever": 299,
		"median_2weeks": 173,
		"ccu": 17870,
		"price": "0",
		"tags": ["Free to Play", "Simulation", "World War II", "Multiplayer", "Flight", "War", "Military", "Tanks", "Massively Multiplayer", "Action", "Historical", "Realistic", "Team-Based", "Shooter", "Arcade", "Co-op", "Strategy", "Open World", "FPS", "TrackIR"]
	}, {
		"appid": 238960,
		"name": "Path of Exile",
		"developer": "Grinding Gear Games",
		"publisher": "Grinding Gear Games",
		"score_rank": 88,
		"owners": 6064074,
		"owners_variance": 64256,
		"players_forever": 4001325,
		"players_forever_variance": 52348,
		"players_2weeks": 226777,
		"players_2weeks_variance": 12528,
		"average_forever": 3191,
		"average_2weeks": 1239,
		"median_forever": 234,
		"median_2weeks": 334,
		"ccu": 19883,
		"price": "0",
		"tags": ["Free to Play", "Action RPG", "RPG", "Hack and Slash", "Multiplayer", "Massively Multiplayer", "Indie", "Action", "Fantasy", "Adventure", "Loot", "Dungeon Crawler", "Fishing", "Co-op", "Online Co-Op", "MMORPG", "Character Customization", "Dark Fantasy", "PvE", "Inventory Management"]
	}, {
		"appid": 252490,
		"name": "Rust",
		"developer": "Facepunch Studios",
		"publisher": "Facepunch Studios",
		"score_rank": 53,
		"owners": 4867284,
		"owners_variance": 57665,
		"players_forever": 4657547,
		"players_forever_variance": 56425,
		"players_2weeks": 522077,
		"players_2weeks_variance": 19001,
		"average_forever": 5644,
		"average_2weeks": 966,
		"median_forever": 1411,
		"median_2weeks": 279,
		"ccu": 43127,
		"price": "1999",
		"tags": []
	}, {
		"appid": 252950,
		"name": "Rocket League",
		"developer": "Psyonix, Inc.",
		"publisher": "Psyonix, Inc.",
		"score_rank": 88,
		"owners": 4528478,
		"owners_variance": 55648,
		"players_forever": 4338681,
		"players_forever_variance": 54484,
		"players_2weeks": 1347975,
		"players_2weeks_variance": 30496,
		"average_forever": 3888,
		"average_2weeks": 495,
		"median_forever": 1137,
		"median_2weeks": 194,
		"ccu": 59596,
		"price": "1999",
		"tags": ["Multiplayer", "Racing", "Soccer", "Sports", "Competitive", "Team-Based", "Football", "Online Co-Op", "Action", "Co-op", "Funny", "Fast-Paced", "Local Multiplayer", "Local Co-Op", "Great Soundtrack", "Split Screen", "4 Player Local", "Singleplayer", "Indie", "Casual"]
	}, {
		"appid": 253710,
		"name": "theHunter",
		"developer": "Expansive Worlds, Avalanche Studios",
		"publisher": "Expansive Worlds, Avalanche Studios",
		"score_rank": 5,
		"owners": 4274690,
		"owners_variance": 54085,
		"players_forever": 2634497,
		"players_forever_variance": 42557,
		"players_2weeks": 45138,
		"players_2weeks_variance": 5590,
		"average_forever": 314,
		"average_2weeks": 282,
		"median_forever": 38,
		"median_2weeks": 38,
		"ccu": 1327,
		"price": "0",
		"tags": ["Free to Play", "Hunting", "Multiplayer", "Simulation", "Open World", "Shooter", "Co-op", "First-Person", "Realistic", "Survival", "Sports", "Online Co-Op", "FPS", "Adventure", "Action", "Singleplayer", "Stealth", "Strategy", "Massively Multiplayer", "Casual"]
	}, {
		"appid": 255710,
		"name": "Cities: Skylines",
		"developer": "Colossal Order Ltd.",
		"publisher": "Paradox Interactive",
		"score_rank": 88,
		"owners": 2851485,
		"owners_variance": 44262,
		"players_forever": 2732386,
		"players_forever_variance": 43335,
		"players_2weeks": 295844,
		"players_2weeks_variance": 14307,
		"average_forever": 2157,
		"average_2weeks": 437,
		"median_forever": 774,
		"median_2weeks": 131,
		"ccu": 10202,
		"price": "2999",
		"tags": ["City Builder", "Simulation", "Building", "Strategy", "Moddable", "Singleplayer", "Management", "Sandbox", "Economy", "Resource Management", "Realistic", "Replay Value", "Casual", "Family Friendly", "Mod", "Great Soundtrack", "Real-Time with Pause", "Modern", "Funny", "Action"]
	}, {
		"appid": 265930,
		"name": "Goat Simulator",
		"developer": "Coffee Stain Studios",
		"publisher": "Coffee Stain Studios",
		"score_rank": 72,
		"owners": 2636310,
		"owners_variance": 42572,
		"players_forever": 2452495,
		"players_forever_variance": 41071,
		"players_2weeks": 52933,
		"players_2weeks_variance": 6054,
		"average_forever": 414,
		"average_2weeks": 84,
		"median_forever": 143,
		"median_2weeks": 19,
		"ccu": 480,
		"price": "999",
		"tags": ["Simulation", "Funny", "Comedy", "Open World", "Sandbox", "Physics", "Indie", "Action", "Singleplayer", "Casual", "Destruction", "Third Person", "Co-op", "Exploration", "Moddable", "Local Multiplayer", "Local Co-Op", "MMORPG", "Family Friendly", "Memes"]
	}, {
		"appid": 271590,
		"name": "Grand Theft Auto V",
		"developer": "Rockstar North",
		"publisher": "Rockstar Games",
		"score_rank": 56,
		"owners": 5608707,
		"owners_variance": 61836,
		"players_forever": 5524413,
		"players_forever_variance": 61377,
		"players_2weeks": 1455109,
		"players_2weeks_variance": 31680,
		"average_forever": 6626,
		"average_2weeks": 594,
		"median_forever": 3929,
		"median_2weeks": 218,
		"ccu": 68420,
		"price": "5999",
		"tags": ["Open World", "Action", "Multiplayer", "Third Person", "First-Person", "Crime", "Adventure", "Shooter", "Third-Person Shooter", "Singleplayer", "Atmospheric", "Mature", "Racing", "Sandbox", "Co-op", "Great Soundtrack", "Funny", "Comedy", "Moddable", "RPG"]
	}, {
		"appid": 272350,
		"name": "Tom Clancy's Ghost Recon Phantoms - EU",
		"developer": "Ubisoft Singapore",
		"publisher": "Ubisoft",
		"score_rank": "",
		"owners": 4256019,
		"owners_variance": 53969,
		"players_forever": 2509597,
		"players_forever_variance": 41544,
		"players_2weeks": 35349,
		"players_2weeks_variance": 4947,
		"average_forever": 1363,
		"average_2weeks": 371,
		"median_forever": 210,
		"median_2weeks": 81,
		"ccu": 1137,
		"price": "0",
		"tags": []
	}, {
		"appid": 273110,
		"name": "Counter-Strike Nexon: Zombies",
		"developer": "Nexon",
		"publisher": "Nexon Europe GmbH",
		"score_rank": 23,
		"owners": 7071067,
		"owners_variance": 69288,
		"players_forever": 4356083,
		"players_forever_variance": 54592,
		"players_2weeks": 116742,
		"players_2weeks_variance": 8990,
		"average_forever": 865,
		"average_2weeks": 478,
		"median_forever": 40,
		"median_2weeks": 75,
		"ccu": 4506,
		"price": "0",
		"tags": ["Free to Play", "Zombies", "Multiplayer", "FPS", "Shooter", "Action", "Gore", "First-Person", "Co-op", "Horror", "PvP", "Online Co-Op", "PvE", "Singleplayer", "Classic", "Massively Multiplayer", "Mod", "Funny", "Walking Simulator", "Indie"]
	}, {
		"appid": 273350,
		"name": "Evolve",
		"developer": "Turtle Rock Studios",
		"publisher": "2K",
		"score_rank": 24,
		"owners": 4889944,
		"owners_variance": 57797,
		"players_forever": 3425045,
		"players_forever_variance": 48471,
		"players_2weeks": 211731,
		"players_2weeks_variance": 12105,
		"average_forever": 581,
		"average_2weeks": 185,
		"median_forever": 120,
		"median_2weeks": 38,
		"ccu": 2325,
		"price": "0",
		"tags": []
	}, {
		"appid": 291480,
		"name": "Warface",
		"developer": "Crytek",
		"publisher": "Crytek ",
		"score_rank": 35,
		"owners": 6246801,
		"owners_variance": 65200,
		"players_forever": 3955280,
		"players_forever_variance": 52049,
		"players_2weeks": 162062,
		"players_2weeks_variance": 10591,
		"average_forever": 775,
		"average_2weeks": 446,
		"median_forever": 100,
		"median_2weeks": 67,
		"ccu": 5749,
		"price": "0",
		"tags": []
	}, {
		"appid": 291550,
		"name": "Brawlhalla",
		"developer": "Blue Mammoth Games",
		"publisher": "Blue Mammoth Games",
		"score_rank": 75,
		"owners": 4579416,
		"owners_variance": 55956,
		"players_forever": 4180064,
		"players_forever_variance": 53491,
		"players_2weeks": 476396,
		"players_2weeks_variance": 18151,
		"average_forever": 660,
		"average_2weeks": 230,
		"median_forever": 150,
		"median_2weeks": 56,
		"ccu": 9541,
		"price": "0",
		"tags": ["Early Access", "Free to Play", "Multiplayer", "Fighting", "2D", "Action", "2D Fighter", "Local Multiplayer", "Indie", "Beat 'em up", "Platformer", "Co-op", "Controller", "Local Co-Op", "4 Player Local", "Online Co-Op", "Massively Multiplayer", "Singleplayer", "Survival", "Adventure"]
	}, {
		"appid": 295110,
		"name": "H1Z1",
		"developer": "Daybreak Game Company",
		"publisher": "Daybreak Game Company",
		"score_rank": 23,
		"owners": 2708458,
		"owners_variance": 43146,
		"players_forever": 2657338,
		"players_forever_variance": 42740,
		"players_2weeks": 116924,
		"players_2weeks_variance": 8997,
		"average_forever": 3668,
		"average_2weeks": 371,
		"median_forever": 1009,
		"median_2weeks": 38,
		"ccu": 2934,
		"price": "1999",
		"tags": ["Early Access", "Zombies", "Survival", "Open World", "Multiplayer", "Massively Multiplayer", "Crafting", "Post-apocalyptic", "Action", "Survival Horror", "Co-op", "Shooter", "Adventure", "Sandbox", "Exploration", "Walking Simulator", "FPS", "Horror", "Simulation", "RPG"]
	}, {
		"appid": 301520,
		"name": "Robocraft",
		"developer": "Freejam",
		"publisher": "Freejam",
		"score_rank": 37,
		"owners": 11575979,
		"owners_variance": 88086,
		"players_forever": 8173049,
		"players_forever_variance": 74375,
		"players_2weeks": 248712,
		"players_2weeks_variance": 13119,
		"average_forever": 1116,
		"average_2weeks": 305,
		"median_forever": 144,
		"median_2weeks": 60,
		"ccu": 7326,
		"price": "0",
		"tags": ["Early Access", "Free to Play", "Robots", "Building", "Multiplayer", "Action", "Shooter", "Massively Multiplayer", "PvP", "Sandbox", "Crafting", "Third-Person Shooter", "Sci-fi", "Strategy", "Simulation", "Indie", "Open World", "Funny", "RPG", "Adventure"]
	}, {
		"appid": 302830,
		"name": "BLOCKADE 3D",
		"developer": "Shumkov Dmitriy",
		"publisher": "Shumkov Dmitriy",
		"score_rank": 17,
		"owners": 3551033,
		"owners_variance": 49345,
		"players_forever": 2589178,
		"players_forever_variance": 42192,
		"players_2weeks": 77224,
		"players_2weeks_variance": 7312,
		"average_forever": 381,
		"average_2weeks": 131,
		"median_forever": 48,
		"median_2weeks": 32,
		"ccu": 1266,
		"price": "0",
		"tags": ["Early Access", "Free to Play", "Shooter", "Multiplayer", "FPS", "Action", "Building", "Zombies", "Pixel Graphics", "Online Co-Op", "Sandbox", "Survival", "Co-op", "3D Vision", "Massively Multiplayer", "Adventure", "Open World", "Funny", "Casual", "Controller"]
	}, {
		"appid": 304050,
		"name": "Trove",
		"developer": "Trion Worlds",
		"publisher": "Trion Worlds",
		"score_rank": 47,
		"owners": 7118018,
		"owners_variance": 69513,
		"players_forever": 5799591,
		"players_forever_variance": 62863,
		"players_2weeks": 228590,
		"players_2weeks_variance": 12578,
		"average_forever": 1205,
		"average_2weeks": 395,
		"median_forever": 127,
		"median_2weeks": 68,
		"ccu": 7002,
		"price": "0",
		"tags": ["Free to Play", "Open World", "Multiplayer", "Adventure", "Massively Multiplayer", "Building", "MMORPG", "Sandbox", "Action", "Pixel Graphics", "Crafting", "RPG", "Third Person", "Exploration", "Co-op", "Dungeon Crawler", "Voxel", "Funny", "Casual", "FPS"]
	}, {
		"appid": 304930,
		"name": "Unturned",
		"developer": "Smartly Dressed Games",
		"publisher": "Smartly Dressed Games",
		"score_rank": 84,
		"owners": 26920704,
		"owners_variance": 131338,
		"players_forever": 21240393,
		"players_forever_variance": 117652,
		"players_2weeks": 1146032,
		"players_2weeks_variance": 28127,
		"average_forever": 1057,
		"average_2weeks": 384,
		"median_forever": 176,
		"median_2weeks": 74,
		"ccu": 38871,
		"price": "0",
		"tags": ["Early Access", "Free to Play", "Survival", "Zombies", "Multiplayer", "Open World", "Adventure", "Crafting", "Action", "First-Person", "Co-op", "Sandbox", "Post-apocalyptic", "Shooter", "FPS", "Singleplayer", "Indie", "Massively Multiplayer", "Atmospheric", "Casual"]
	}, {
		"appid": 322330,
		"name": "Don't Starve Together Beta",
		"developer": "Klei Entertainment",
		"publisher": "Klei Entertainment",
		"score_rank": 96,
		"owners": 5138837,
		"owners_variance": 59229,
		"players_forever": 3802645,
		"players_forever_variance": 51046,
		"players_2weeks": 276629,
		"players_2weeks_variance": 13835,
		"average_forever": 1254,
		"average_2weeks": 312,
		"median_forever": 471,
		"median_2weeks": 112,
		"ccu": 9179,
		"price": "1499",
		"tags": ["Survival", "Multiplayer", "Co-op", "Adventure", "Open World", "Crafting", "Sandbox", "Indie", "Difficult", "Atmospheric", "2D", "Survival Horror", "Simulation", "Strategy", "Funny", "Action", "Horror", "Singleplayer", "Online Co-Op", "Rogue-like"]
	}, {
		"appid": 333930,
		"name": "Dirty Bomb",
		"developer": "Splash Damage®",
		"publisher": "Nexon America Inc",
		"score_rank": 43,
		"owners": 5821526,
		"owners_variance": 62980,
		"players_forever": 3906154,
		"players_forever_variance": 51728,
		"players_2weeks": 137770,
		"players_2weeks_variance": 9766,
		"average_forever": 645,
		"average_2weeks": 208,
		"median_forever": 67,
		"median_2weeks": 45,
		"ccu": 2815,
		"price": "0",
		"tags": ["Free to Play", "FPS", "Multiplayer", "Shooter", "Action", "Team-Based", "First-Person", "Fast-Paced", "Class-Based", "Co-op", "PvP", "Competitive", "Massively Multiplayer", "Parkour", "Post-apocalyptic", "Controller", "Singleplayer", "Gore", "Open World", "Female Protagonist"]
	}, {
		"appid": 346110,
		"name": "ARK: Survival Evolved",
		"developer": "Studio Wildcard, Instinct Games, Efecto Studios, Virtual Basement LLC",
		"publisher": "Studio Wildcard",
		"score_rank": 29,
		"owners": 4016008,
		"owners_variance": 52442,
		"players_forever": 3836725,
		"players_forever_variance": 51271,
		"players_2weeks": 470413,
		"players_2weeks_variance": 18037,
		"average_forever": 6648,
		"average_2weeks": 1223,
		"median_forever": 982,
		"median_2weeks": 316,
		"ccu": 53119,
		"price": "2999",
		"tags": ["Early Access", "Survival", "Dinosaurs", "Open World", "Multiplayer", "Crafting", "Building", "Adventure", "Base-Building", "Co-op", "Action", "First-Person", "Sandbox", "Massively Multiplayer", "Singleplayer", "RPG", "Dragons", "Sci-fi", "MMORPG", "Indie"]
	}, {
		"appid": 346900,
		"name": "AdVenture Capitalist",
		"developer": "Hyper Hippo Games",
		"publisher": "Hyper Hippo Games",
		"score_rank": 78,
		"owners": 4020359,
		"owners_variance": 52471,
		"players_forever": 3073549,
		"players_forever_variance": 45939,
		"players_2weeks": 207018,
		"players_2weeks_variance": 11970,
		"average_forever": 2421,
		"average_2weeks": 367,
		"median_forever": 210,
		"median_2weeks": 27,
		"ccu": 6478,
		"price": "0",
		"tags": ["Free to Play", "Clicker", "Casual", "Capitalism", "Singleplayer", "Indie", "Simulation", "Management", "Point & Click", "2D", "Funny", "Adventure", "Touch-Friendly", "Strategy", "Comedy", "Real-Time", "Memes", "Sandbox", "Family Friendly", "Great Soundtrack"]
	}, {
		"appid": 363970,
		"name": "Clicker Heroes",
		"developer": "Playsaurus",
		"publisher": "Playsaurus",
		"score_rank": 78,
		"owners": 4567633,
		"owners_variance": 55885,
		"players_forever": 3418519,
		"players_forever_variance": 48425,
		"players_2weeks": 239285,
		"players_2weeks_variance": 12868,
		"average_forever": 5571,
		"average_2weeks": 1278,
		"median_forever": 433,
		"median_2weeks": 53,
		"ccu": 15862,
		"price": "0",
		"tags": ["Clicker", "Free to Play", "Casual", "Singleplayer", "Indie", "RPG", "2D", "Adventure", "Funny", "Simulation", "Fantasy", "Strategy", "Multiplayer", "Family Friendly", "Action", "Touch-Friendly", "Illuminati", "Management", "Survival", "Open World"]
	}, {
		"appid": 377160,
		"name": "Fallout 4",
		"developer": "Bethesda Game Studios",
		"publisher": "Bethesda Softworks",
		"score_rank": 47,
		"owners": 3762402,
		"owners_variance": 50778,
		"players_forever": 3686265,
		"players_forever_variance": 50267,
		"players_2weeks": 546550,
		"players_2weeks_variance": 19440,
		"average_forever": 6291,
		"average_2weeks": 710,
		"median_forever": 3654,
		"median_2weeks": 203,
		"ccu": 34055,
		"price": "5999",
		"tags": []
	}, {
		"appid": 386360,
		"name": "SMITE",
		"developer": "Hi-Rez Studios",
		"publisher": "Hi-Rez Studios",
		"score_rank": 60,
		"owners": 4393064,
		"owners_variance": 54820,
		"players_forever": 3264615,
		"players_forever_variance": 47332,
		"players_2weeks": 362010,
		"players_2weeks_variance": 15825,
		"average_forever": 1904,
		"average_2weeks": 618,
		"median_forever": 167,
		"median_2weeks": 147,
		"ccu": 19872,
		"price": "0",
		"tags": ["Free to Play", "MOBA", "Action", "Multiplayer", "Third Person", "Mythology", "Team-Based", "Competitive", "Strategy", "Co-op", "Massively Multiplayer", "PvP", "RPG", "e-sports", "Adventure", "Funny", "MMORPG", "Survival", "Casual", "Nudity"]
	}, {
		"appid": 444090,
		"name": "Paladins",
		"developer": "Hi-Rez Studios",
		"publisher": "Hi-Rez Studios",
		"score_rank": 69,
		"owners": 3179415,
		"owners_variance": 46716,
		"players_forever": 2693774,
		"players_forever_variance": 43030,
		"players_2weeks": 1812406,
		"players_2weeks_variance": 35339,
		"average_forever": 433,
		"average_2weeks": 325,
		"median_forever": 182,
		"median_2weeks": 134,
		"ccu": 53701,
		"price": "0",
		"tags": ["Early Access", "Free to Play", "FPS", "Multiplayer", "Shooter", "Action", "MOBA", "First-Person", "Team-Based", "Online Co-Op", "PvP", "Co-op", "Strategy", "Fantasy", "Anime", "Massively Multiplayer", "Funny", "Adventure", "Memes", "Survival"]
	}];

/***/ }
/******/ ]);