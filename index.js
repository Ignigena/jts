'use strict';
const LRU = require('lru-cache');
const path = require('path');

class JTS {

  constructor(config) {
    this.config = config || {};

    if (this.config.cache !== false) {
      this.config.cache = this.config.cache || {};
      this.config.cache.max = this.config.cache.max || 500,
      this.config.cache.maxAge = this.config.cache.maxAge || 1000 * 60 * 5
      this.cache = LRU(this.config.cache);
    }

    this.defaultLayout = this.config.defaultLayout || false;
    this.layouts = this.config.layouts || './';
    this.templatePath = './';
    this.partialsUsed = [];

    this.apply = this.apply.bind(this);
    this.read = this.read.bind(this);
    this.checkLayout = this.checkLayout.bind(this);
    this.compile = this.compile.bind(this);
    this.compileLayout = this.compileLayout.bind(this);
    this.render = this.render.bind(this);
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
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      this.config.cache = false;

      // Determine the location of the template and add to webpack watch.
      var source = path.resolve(this.config.from);
      if (compilation.fileDependencies.indexOf(source) < 0) {
        compilation.fileDependencies.push(source);
      }

      // Render the template.
      this.render(source, this.config.vars || {}, (err, source) => {
        if (err) return console.error(err);
        compilation.assets[this.config.to] = {
          source: () => source,
          size: () => source.length
        };

        // Add each partial that was used in the template to webpack watch.
        this.partialsUsed.forEach(partial => {
          if (compilation.fileDependencies.indexOf(partial) < 0) {
            compilation.fileDependencies.push(partial);
          }
        });
        callback();
      });
    });
  }

  templateScope() {
    var engine = this;
    return {
      customLayout: false,
      s: function(text) {
        return String(text)
          .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/'/g, '&#39;')
          .replace(/"/g, '&quot;');
      },
      each: function(array, callback) {
        if (!array || !Array.isArray(array)) return '';
        return array.map(callback).join('');
      },
      layout: function(template) {
        this.customLayout = template;
        return '';
      },
      partial: function(template, variables) {
        var partialEngine = new JTS();
        template = path.resolve(engine.templatePath, template);
        if (engine.partialsUsed.indexOf(template) < 0) {
          engine.partialsUsed.push(template);
        }
        variables = variables || this.variables;
        return partialEngine.compile(partialEngine.read(template), variables);
      },
      variables: {}
    };
  }

  read(filePath) {
    var cachedFile;
    this.templatePath = require('path').dirname(filePath);
    if (this.config.cache !== false) {
      cachedFile = this.cache.get(filePath);
      if (cachedFile) return cachedFile;
    }
    var template = require('fs').readFileSync(filePath, 'utf8');
    if (this.config.cache !== false && !cachedFile) {
      this.cache.set(filePath, template);
    }
    return template;
  }

  render(filePath, options, cb) {
    var template = this.read(filePath);
    var compiled = this.compile(template, options);

    if (!cb) return compiled;
    return cb(null, compiled);
  }

  compile(template, variables) {
    var params = [], props = [];
    for (var variable in variables) {
      props.push(variable);
      params.push(variables[variable]);
    }

    var scope = this.templateScope();
    scope.variables = variables;
    scope.customLayout = variables && variables.layout;
    params.unshift(scope);

    this.compiled = eval(`((_jts${props.length > 0 ? `,${props.join(',')}` : ''}) => ` + '`' + template + '`)');
    var final = this.compiled.apply(scope, params);

    if (scope.customLayout === 'none' || (!scope.customLayout && !this.config.defaultLayout)) {
      return final;
    }

    var layout = scope.customLayout ? scope.customLayout : this.config.defaultLayout;
    return this.compileLayout(layout, final, template, variables);
  }

  compileLayout(layout, body, template, variables) {
    layout = this.checkLayout(layout);
    if (layout === false) return body;
    layout = this.read(layout);

    variables.body = body;
    variables.layout = 'none';
    return this.compile(layout, variables);
  }

  checkLayout(layout) {
    if (!layout) return false;
    if (layout.indexOf('.jts') === -1) layout += '.jts';
    var path = require('path'), fs = require('fs');
    var templatePath = path.resolve(this.templatePath, layout);
    try {
      fs.accessSync(templatePath);
      return templatePath;
    } catch(e) {
      try {
        templatePath = path.resolve(this.layouts, layout);
        fs.accessSync(templatePath);
        return templatePath;
      } catch(e) {
        return false;
      }
    }
  }

  layout(template) {
    this.layout = template;
    return;
  }

}
module.exports = JTS;
