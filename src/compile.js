module.exports = (template, variables) => {
  const params = []
  const props = []

  for (const variable in variables) {
    props.push(variable)
    params.push(variables[variable])
  }

  return new Function(...props, `return \`${template}\``)(...params)
}
