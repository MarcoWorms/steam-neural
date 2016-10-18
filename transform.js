const { contains } = require('ramda')

const tags = require('./tags')
const games = require('./dataset.json')

const dataset = games.map(game => {
  const output = [ game.score_rank / 100 ]
  const input = tags.map(tag =>
    game.tags.indexOf(tag) >= 0 ? 1 : 0)

  return { input, output }
})

module.exports = dataset
