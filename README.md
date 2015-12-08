# JTS Server-side Templating [![Build Status](https://travis-ci.org/Ignigena/jts.svg?branch=master)](https://travis-ci.org/Ignigena/jts)

JTS (Javascript Template String) is a very basic server side template engine.
Actually, to call it a template engine is rather generous--rather this was
designed mainly to be a drop-in replacement for EJS on Express or Sails servers.

JTS merely uses the built-in template strings in ES6 which is available by
default in Node versions 4 and up. It is built primarily for speed and will not
have many convenience features added in the future.

More documentation and features to come.

## Configuration

```
var JTS = require('jts');
var engine = new JTS({
  defaultLayout: 'layout.jts',
  layouts: 'path/to/layouts'
})
```

* `defaultLayout`: (optional) will attempt to render all templates in this
  layout. When a default layout is set, use `_jts.layout('none')` to prevent a
  template from being rendered in any layout.
* `layouts`: (optional) the relative path to all layouts. When a layout is
  requested JTS will attempt to load the file both from the path specified here
  as well as relative to the child layout if applicable.

### Using in Sails.js

The JTS engine can be used in Sails by modifying `config/views.js`:

```
var JTS = require('jts');
var engine = new JTS({
  defaultLayout: 'layout',
  layouts: 'views'
});

module.exports.views = {
  engine: {
    ext: 'jts',
    fn: engine.render,
  },
};
```

### Using in Express.js

(Documentation coming...)

## Layout support

Templates can request to be rendered in a layout by calling `_jts.layout` with
the name of the template file. Only one parent layout is supported. The parent
layout should include `${ body }` to render the child.

## String filtering

Basic string filtering is provided to sanitize potentially unsafe input. This
can be called via `_jts.s` with the variable to sanitize.
