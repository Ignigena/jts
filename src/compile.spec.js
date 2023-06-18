const compile = require('./compile')

describe('compile', () => {
  it('handles basic template compilation', function () {
    expect(compile('${say}', { say: 'hello world' })).toBe('hello world')
  })
})
