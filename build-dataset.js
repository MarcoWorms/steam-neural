const Promise = require('bluebird')
const steamspy = require('steamspy')
const Crawler = require('crawler')
const { __, merge, values } = require('ramda')
const path = require('path')
const fs = require('fs')

const writeFile = Promise.promisify(fs.writeFile)
const client = new steamspy()

function attachTags (games) {
  return Promise.map(games, game =>
    new Promise(resolve => {
      const tags = []
      const crawler = new Crawler({
        callback: (error, result, $) =>
          $('.popular_tags a').each((index, tag) =>
            tags.push($(tag).text().trim())),
        onDrain: () => resolve(merge(game, { tags }))
      })
      crawler.queue(`http://store.steampowered.com/app/${game.appid}`)
    })
  )
}

function fetch () {
  return new Promise((resolve, reject) =>
    client.top100forever((err, response, data) => {
      resolve(data)
    })
  ).then(values)
}

function build () {
  const filename = path.join(__dirname, 'dataset.json')
  return fetch()
    .then(attachTags)
    .then(JSON.stringify)
    .then(writeFile.bind(null, filename))
}

build()
