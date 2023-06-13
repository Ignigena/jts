const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')

function testCompletion () {
  const fastest = this.filter('fastest')
  const slowest = this.filter('slowest')
  console.log('Fastest is ' + fastest.map('name') + ` (mean time: ${Number(fastest['0'].stats.mean * 1000).toFixed(3)}ms)`)
  console.log('Slowest is ' + slowest.map('name') + ` (mean time: ${Number(slowest['0'].stats.mean * 1000).toFixed(3)}ms)`)
  console.log()
}

const longString = readFileSync(resolve(__dirname, './templates/long.html'), 'utf-8')
const shortString = readFileSync(resolve(__dirname, './templates/short.html'), 'utf-8')

const templateVars = {
  header: longString,
  header2: longString,
  header3: longString,
  header4: longString,
  header5: longString,
  header6: shortString,
  list: [
    shortString,
    shortString + shortString,
    shortString + shortString + shortString,
    shortString + shortString + shortString + shortString,
    shortString + shortString + shortString + shortString + shortString,
    shortString + shortString + shortString + shortString + shortString + shortString,
    shortString + shortString + shortString + shortString + shortString,
    shortString + shortString + shortString + shortString,
    shortString + shortString + shortString,
    shortString + shortString,
    shortString
  ]
}

const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()
const suiteFile = new Benchmark.Suite()

const DOT = require('dot')
const EJS = require('ejs')
const Handlebars = require('handlebars')
const JTSEngine = require('../index.js')
const JTS = new JTSEngine()

console.log('\nTesting raw compilation performance with strings...')
suite.add('doT', function () {
  const dotJs = DOT.template("<div><h1 class='header'>{{= it.header }}</h1><h2 class='header2'>{{= it.header2 }}</h2><h3 class='header3'>{{= it.header3 }}</h3><h4 class='header4'>{{= it.header4 }}</h4><h5 class='header5'>{{= it.header5 }}</h5><h6 class='header6'>{{= it.header6 }}</h6><ul class='list'>{{ for (var i = 0, l = it.list.length; i < l; i++) { }}<li class='item'>{{= it.list[i] }}</li>{{ } }}</ul></div>")
  dotJs(templateVars)
})
  .add('handlebars', function () {
    const template = Handlebars.compile("<div><h1 class='header'>{{ it.header }}</h1><h2 class='header2'>{{ it.header2 }}</h2><h3 class='header3'>{{ it.header3 }}</h3><h4 class='header4'>{{ it.header4 }}</h4><h5 class='header5'>{{ it.header5 }}</h5><h6 class='header6'>{{ it.header6 }}</h6><ul class='list'>{{#each it.list}}<li class='item'>{{ this }}</li>{{/each}}</ul></div>")
    template(templateVars)
  })
  .add('ejs', function () {
    const ejsJs = EJS.compile("<div><h1 class='header'><%= header %></h1><h2 class='header2'><%= header2 %></h2><h3 class='header3'><%= header3 %></h3><h4 class='header4'><%= header4 %></h4><h5 class='header5'><%= header5 %></h5><h6 class='header6'><%= header6 %></h6><ul class='list'><% for (item in list) { %><li class='item'><%= item %></li><% } %></ul></div>")
    ejsJs(templateVars)
  })
  .add('jts', function () {
    JTS.compile("<div><h1 class='header'>${header}</h1><h2 class='header2'>${header2}</h2><h3 class='header3'>${header3}</h3><h4 class='header4'>${header4}</h4><h5 class='header5'>${header5}</h5><h6 class='header6'>${header6}</h6><ul class='list'>${list.map(item => `<li class='item'>${item}</li>`)}</ul></div>", templateVars)
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', testCompletion)
  .run({ async: false })

console.log('Testing performance with file I/O...')
suiteFile.add('doT:file', function () {
  const dotJs = DOT.template(readFileSync(resolve(__dirname, './templates/test.dot'), 'utf-8'))
  dotJs(templateVars)
})
  .add('ejs:file', function () {
    const ejsJs = EJS.compile(readFileSync(resolve(__dirname, './templates/test.ejs'), 'utf-8'))
    ejsJs(templateVars)
  })
  .add('jts:file(no-cache)', function () {
    const JTSnocache = new JTSEngine({ cache: false })
    const file = JTSnocache.read(resolve(__dirname, './templates/test.jts'))
    JTSnocache.compile(file, templateVars)
  })
  .add('jts:file(cache)', function () {
    const file = JTS.read(resolve(__dirname, './templates/test.jts'))
    JTS.compile(file, templateVars)
  })
  .add('jts:file(express-style)', function () {
    JTS.render(resolve(__dirname, './templates/test.jts'), templateVars)
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', testCompletion)
  .run({ async: false })
