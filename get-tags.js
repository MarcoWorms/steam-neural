const { pick, map, uniq } = require('ramda')
const top100 = require('./dataset')
const dataset = map(pick(['score_rank', 'tags']), top100)

var tags = []

dataset.forEach(game =>
  game.tags.forEach(tag =>
    tags.push(tag)))

module.exports = tags
