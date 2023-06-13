'use strict'
const fs = require('node:fs')
const path = require('node:path')

const LRU = require('quick-lru')

class JTS {
  constructor (config) {
    this.config = config || {}

    if (this.config.cache !== false) {
      this.config.cache = this.config.cache || {}
      this.config.cache.maxSize = this.config.cache.maxSize || 500
      this.cache = new LRU(this.config.cache)
    }

    this.defaultLayout = this.config.defaultLayout || false
    this.layouts = this.config.layouts || './'
    this.templatePath = './'
    this.partialsUsed = []

    this.apply = this.apply.bind(this)
    this.read = this.read.bind(this)
    this.checkLayout = this.checkLayout.bind(this)
    this.compile = this.compile.bind(this)
    this.compileLayout = this.compileLayout.bind(this)
    this.render = this.render.bind(this)
  }

  // Webpack plugin
  // --
  // Allows for JTS to be used in your build process with Webpack. Simply
  // configure the plugin with a `from` and a `to` value representing the
  // template source and final HTML output:
  // ```
  // plugins: [
  //   new JTS({ from: 'src/template.jts', to: 'index.html' })
  // ]
  // ```
  apply (compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      this.config.cache = false

      // Determine the location of the template and add to webpack watch.
      const source = path.resolve(this.config.from)
      if (compilation.fileDependencies.indexOf(source) < 0) {
        compilation.fileDependencies.push(source)
      }

      // Render the template.
      this.render(source, this.config.vars || {}, (err, source) => {
        if (err) return console.error(err)
        compilation.assets[this.config.to] = {
          source: () => source,
          size: () => source.length
        }

        // Add each partial that was used in the template to webpack watch.
        this.partialsUsed.forEach(partial => {
          if (compilation.fileDependencies.indexOf(partial) < 0) {
            compilation.fileDependencies.push(partial)
          }
        })
        callback()
      })
    })
  }

  templateScope () {
    const engine = this
    return {
      customLayout: false,
      s: function (text) {
        return String(text)
          .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/'/g, '&#39;')
          .replace(/"/g, '&quot;')
      },
      each: function (array, callback) {
        if (!array || !Array.isArray(array)) return ''
        return array.map(callback).join('')
      },
      layout: function (template) {
        this.customLayout = template
        return ''
      },
      partial: function (template, variables) {
        const partialEngine = new JTS()
        template = path.resolve(engine.templatePath, template)
        if (engine.partialsUsed.indexOf(template) < 0) {
          engine.partialsUsed.push(template)
        }
        variables = variables || this.variables
        return partialEngine.compile(partialEngine.read(template), variables)
      },
      variables: {}
    }
  }

  read (filePath) {
    let cachedFile
    this.templatePath = path.dirname(filePath)
    if (this.config.cache !== false) {
      cachedFile = this.cache.get(filePath)
      if (cachedFile) return cachedFile
    }
    const template = fs.readFileSync(filePath, 'utf8')
    if (this.config.cache !== false && !cachedFile) {
      this.cache.set(filePath, template)
    }
    return template
  }

  render (filePath, options, cb) {
    const template = this.read(filePath)
    const compiled = this.compile(template, options)

    if (!cb) return compiled
    return cb(null, compiled)
  }

  compile (template, variables) {
    const params = [this.templateScope()]
    const props = ['_jts']

    for (const variable in variables) {
      props.push(variable)
      params.push(variables[variable])
    }

    params[0].variables = variables
    params[0].customLayout = variables?.layout

    const final = new Function(...props, `return \`${template}\``)(...params)

    const layout = params[0].customLayout ?? this.config.defaultLayout
    if (layout === 'none') return final

    return this.compileLayout(layout, final, template, variables)
  }

  compileLayout (layout, body, template, variables) {
    layout = this.checkLayout(layout)
    if (layout === false) return body
    layout = this.read(layout)

    variables.body = body
    variables.layout = 'none'
    return this.compile(layout, variables)
  }

  checkLayout (layout) {
    if (!layout) return false
    if (layout.indexOf('.jts') === -1) layout += '.jts'
    let templatePath = path.resolve(this.templatePath, layout)
    if (fs.existsSync(templatePath)) return templatePath

    templatePath = path.resolve(this.layouts, layout)
    if (fs.existsSync(templatePath)) return templatePath

    return false
  }

  layout (template) {
    this.layout = template
  }
}
module.exports = JTS
