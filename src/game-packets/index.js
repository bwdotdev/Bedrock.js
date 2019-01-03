const fs = require('fs')
const path = require('path')

const files = fs.readdirSync(__dirname)

let exp = {}

files.forEach(file => {
  if(file === 'index.js') return

  exp[file.replace('.js', '')] = require(`./${file}`)
})

console.log(exp)

module.exports = exp