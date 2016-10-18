const synaptic = require('synaptic')

var Perceptron = synaptic.Architect.Perceptron
var LSTM = synaptic.Architect.LSTM
var Layer = synaptic.Layer
var Network = synaptic.Network
var Trainer = synaptic.Trainer

var inputLayer = new Layer(2),
  outputLayer = new Layer(1)

inputLayer.project(outputLayer)

var network = new Network({
  input: inputLayer,
  output: outputLayer
})

var trainer = new Trainer(network)

var trainingSet = [{
  input: [0, 0],
  output: [0]
}, {
  input: [0, 1],
  output: [0]
}, {
  input: [1, 0],
  output: [0]
}, {
  input: [1, 1],
  output: [1]
}]

trainer.train(trainingSet, {
  iterations: 1000,
  error: .001
})

var test00 = Math.round(network.activate([0, 0]))
console.log(test00 == 0)

var test01 = Math.round(network.activate([0, 1]))
console.log(test01 == 0)

var test10 = Math.round(network.activate([1, 0]))
console.log(test10 == 0)

var test11 = Math.round(network.activate([1, 1]))
console.log(test11 == 1)

