'use strict';
class JTS {

  constructor(config) {
    config = config || {};
    this.cache = {};
    this.defaultLayout = config.defaultLayout || false;
    this.layouts = config.layouts || './';
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
      layout: function(template) {
        this.customLayout = template;
        return '';
      }
    };
  }

  read(filePath, noCache) {
    this.templatePath = require('path').dirname(filePath);
    if (noCache !== true && this.cache && this.cache[filePath]) {
      return this.cache[filePath];
    }
    try {
      var template = require('fs').readFileSync(filePath, 'utf8');
      if (noCache !== true) {
        this.cache[filePath] = template;
      }
      return template;
    } catch (e) {
      throw new Error(`Failed to load template ${filePath}`);
    }
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
      if (variable === 'layout') continue;
      props.push(variable);
      params.push(variables[variable]);
    }

    this.compiled = eval(`(function(layout,s,${props.join(',')}){return` + '`' + template + '`})');
    var scope = this.templateScope();
    scope.customLayout = variables.layout;
    params.unshift(scope.layout, scope.s);
    var final = this.compiled.apply(scope, params);

    if (scope.customLayout !== 'none' && (scope.customLayout !== false || this.defaultLayout !== false)) {
      var layout = scope.customLayout ? scope.customLayout : this.defaultLayout;
      return this.compileLayout(layout, final, template, variables);
    }

    return final;
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
        return templatePath
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
