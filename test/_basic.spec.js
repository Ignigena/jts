var JTS = require('../index.js');
var engine = new JTS();

describe('JTS: basic', function() {

  it('handles basic template compilation', function() {
    expect(engine.compile('${say}', { say: 'hello world'})).toBe('hello world');
  });

  it('provides basic string sanitization', function() {
    expect(engine.compile('<b>${ _jts.s(unsafe) }</b>', { unsafe: '<danger>'})).toBe('<b>&lt;danger&gt;</b>');
  });

});
