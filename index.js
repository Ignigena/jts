'use strict';
const LRU = require('lru-cache');

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

    this.read = this.read.bind(this);
    this.checkLayout = this.checkLayout.bind(this);
    this.compile = this.compile.bind(this);
    this.compileLayout = this.compileLayout.bind(this);
    this.render = this.render.bind(this);
  }

  templateScope() {
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
        return array.map(callback).join('');
      },
      layout: function(template) {
        this.customLayout = template;
        return '';
      }
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

    this.compiled = eval(`((_jts,${props.join(',')}) => ` + '`' + template + '`)');
    var scope = this.templateScope();
    scope.customLayout = variables.layout;
    params.unshift(scope);
    var final = this.compiled.apply(scope, params);

    if (scope.customLayout === 'none' || (!scope.customLayout && !this.defaultLayout)) {
      return final;
    }

    var layout = scope.customLayout ? scope.customLayout : this.defaultLayout;
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
