const { JTS } = require('../')
const engine = new JTS()
const fs = require('fs')

const filePath = 'test/templates/helloWorld.jts'

describe('JTS: files', function () {
  it('reads templates from the filesystem', function () {
    const file = fs.readFileSync(filePath, 'utf8')
    expect(engine.read(filePath, true)).toBe(file)
  })

  it('throws an exception when a template cannot be found', function () {
    expect(function () { engine.read('file/not/exit.jts') }).toThrow()
  })

  it('provides caching of the template file', function () {
    const file = engine.read(filePath)
    expect(engine.cache.get(filePath)).toBe(file)

    jest.spyOn(fs, 'readFileSync')
    engine.read(filePath)
    expect(fs.readFileSync).not.toHaveBeenCalled()
  })

  it('processes partials in a template file', function () {
    const file = engine.read('test/templates/helloWorldPartial.jts')
    const result = engine.compile(file)
    expect(result).toBe('Hello World!')
  })
})
