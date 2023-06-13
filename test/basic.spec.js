const JTS = require('../index.js')
const engine = new JTS()

describe('JTS: basic', function () {
  it('handles basic template compilation', function () {
    expect(engine.compile('${say}', { say: 'hello world' })).toBe('hello world')
  })

  it('provides basic string sanitization', function () {
    expect(engine.compile('<b>${ _jts.s(unsafe) }</b>', { unsafe: '<danger>' })).toBe('<b>&lt;danger&gt;</b>')
  })

  it('provides an array map helper', function () {
    expect(engine.compile('${ _jts.each(array, item => `<i>${item}</i> `) }', { array: [1, 2] })).toBe('<i>1</i> <i>2</i> ')
  })
})
