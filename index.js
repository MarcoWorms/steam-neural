const { Layer, Network, Trainer } = require('synaptic')
const trainingSet = require('./transform')

const inputLayer = new Layer(trainingSet[0].input.length)
const outputLayer = new Layer(trainingSet[0].output.length)

inputLayer.project(outputLayer)

const network = new Network({
  input: inputLayer,
  output: outputLayer
})

const trainer = new Trainer(network)

trainer.train(trainingSet, {
  iterations: 10000,
  error: .0001
})

const test = trainingSet[11]
const test00 = network.activate(test.input)

console.log(test.output)
console.log(test00)
console.log(test00 == test.output)

