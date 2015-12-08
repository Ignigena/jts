var Jasmine = require('jasmine');
var SpecReporter = require('jasmine-spec-reporter');

var jasmine = new Jasmine();
jasmine.configureDefaultReporter({print:function(){}});
jasmine.addReporter(new SpecReporter());
jasmine.loadConfigFile('test/conf.json');
jasmine.execute();
