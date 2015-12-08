var JTS = require('../index.js');
var engine = new JTS();
var fs = require('fs');

var filePath = 'test/templates/helloWorld.jts';

describe('JTS: files', function() {

  it('reads templates from the filesystem', function() {
    var file = fs.readFileSync(filePath, 'utf8');
    expect(engine.read(filePath, true)).toBe(file);
  });

  it('throws an exception when a template cannot be found', function() {
    expect(function() { engine.read('file/not/exit.jts') }).toThrow();
  });

  it('provides caching of the template file', function() {
    var file = engine.read(filePath);
    expect(engine.cache[filePath]).toBe(file);

    spyOn(fs, 'readFileSync').and.callThrough();
    engine.read(filePath);
    expect(fs.readFileSync).not.toHaveBeenCalled();
  })

});
