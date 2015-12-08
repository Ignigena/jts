'use strict';
class JTS {

  constructor() {
    this.cache = {};
    this.layouts = './';

    this.read = this.read.bind(this);
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
    this.layouts = require('path').dirname(filePath);
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
      props.push(variable);
      params.push(variables[variable]);
    }

    this.compiled = eval(`(function(${props.join(',')}){return` + '`' + template + '`});');
    var scope = this.templateScope();
    var final = this.compiled.apply(scope, params);

    if (scope.customLayout !== false) {
      return this.compileLayout(scope.customLayout, final, template, variables);
    }

    return final;
  }

  compileLayout(layout, body, template, variables) {
    if (layout.indexOf('.jts') === -1) layout += '.jts';
    var layout = this.read(require('path').resolve(this.layouts, layout));

    variables.body = body;
    return this.compile(layout, variables);
  }

  layout(template) {
    this.layout = template;
    return;
  }

}
module.exports = JTS;
