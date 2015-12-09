var read = require('fs').readFileSync;

function testCompletion() {
  var fastest = this.filter('fastest');
  var slowest = this.filter('slowest');
  console.log('Fastest is ' + fastest.pluck('name') + ` (mean time: ${Number(fastest['0'].stats.mean * 1000).toFixed(3)}ms)`);
  console.log('Slowest is ' + slowest.pluck('name') + ` (mean time: ${Number(slowest['0'].stats.mean * 1000).toFixed(3)}ms)`);
  console.log();
}

var longString = read('templates/long.html', 'utf-8');
var shortString = read('templates/short.html', 'utf-8');

var templateVars = {
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

var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var suiteFile = new Benchmark.Suite;

var DOT = require('dot');
var EJS = require('ejs');
var Handlebars = require('handlebars');
var jtsEngine = require('../index.js');
var JTS = new jtsEngine();

console.log('\nTesting raw compilation performance with strings...');
suite.add('doT', function() {
  var dotJs = DOT.template("<div><h1 class='header'>{{= it.header }}</h1><h2 class='header2'>{{= it.header2 }}</h2><h3 class='header3'>{{= it.header3 }}</h3><h4 class='header4'>{{= it.header4 }}</h4><h5 class='header5'>{{= it.header5 }}</h5><h6 class='header6'>{{= it.header6 }}</h6><ul class='list'>{{ for (var i = 0, l = it.list.length; i < l; i++) { }}<li class='item'>{{= it.list[i] }}</li>{{ } }}</ul></div>");
  dotJs(templateVars);
})
.add('handlebars', function() {
  var template = Handlebars.compile("<div><h1 class='header'>{{ it.header }}</h1><h2 class='header2'>{{ it.header2 }}</h2><h3 class='header3'>{{ it.header3 }}</h3><h4 class='header4'>{{ it.header4 }}</h4><h5 class='header5'>{{ it.header5 }}</h5><h6 class='header6'>{{ it.header6 }}</h6><ul class='list'>{{#each it.list}}<li class='item'>{{ this }}</li>{{/each}}</ul></div>");
  template(templateVars);
})
.add('ejs', function() {
  var ejsJs = EJS.compile("<div><h1 class='header'><%= header %></h1><h2 class='header2'><%= header2 %></h2><h3 class='header3'><%= header3 %></h3><h4 class='header4'><%= header4 %></h4><h5 class='header5'><%= header5 %></h5><h6 class='header6'><%= header6 %></h6><ul class='list'><% for (item in list) { %><li class='item'><%= item %></li><% } %></ul></div>");
  ejsJs(templateVars);
})
.add('jts', function() {
  JTS.compile("<div><h1 class='header'>${header}</h1><h2 class='header2'>${header2}</h2><h3 class='header3'>${header3}</h3><h4 class='header4'>${header4}</h4><h5 class='header5'>${header5}</h5><h6 class='header6'>${header6}</h6><ul class='list'>${list.map(item => `<li class='item'>${item}</li>`)}</ul></div>", templateVars);
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', testCompletion)
.run({ 'async': false });

console.log('Testing performance with file I/O...');
suiteFile.add('doT:file', function() {
  var dotJs = DOT.template(read('templates/test.dot', 'utf-8'));
  dotJs(templateVars);
})
.add('ejs:file', function() {
  var ejsJs = EJS.compile(read('templates/test.ejs', 'utf-8'));
  ejsJs(templateVars);
})
.add('jts:file', function() {
  var file = JTS.read('templates/test.jts', true);
  JTS.compile(file, templateVars);
})
.add('jts:cached', function() {
  var file = JTS.read('templates/test.jts');
  JTS.compile(file, templateVars);
})
.add('jts:express', function() {
  JTS.render('templates/test.jts', templateVars);
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', testCompletion)
.run({ 'async': false });
