function Yavanna() {
  var cache = {}
  var registeredFactories = {}
  var provender = {}
  var dependencyStack = []

  var self = function(arg1, arg2) {
    if (typeof arg2 === 'function') {
      return self.provide(arg1, arg2)
    }
    return self.get(arg1, arg2)
  }

  self.provide = function(name, factory) {
    validateProvideArgs(name, factory)

    registeredFactories[name] = factory

    Object.defineProperty(provender, name, {
      get: function() { return self.get(name) }
    })

    return factory
  }

  self.get = function(name, overrides) {
    validateGetArgs(name)

    if (overrides) {
      return registeredFactories[name](overrides)
    }

    if (dependencyStack.indexOf(name) > -1) {
      throw Error('Yavanna: cannot get `' + name + '` because there is a dependency cycle: ' + dependencyStack.join(' -> ') + ' -> ' + name)
    }

    if (!cache[name]) {
      dependencyStack.push(name)
      try {
        cache[name] = registeredFactories[name](provender)
      } finally {
        dependencyStack.pop()
      }
    }

    return cache[name]
  }

  function validateProvideArgs(name, factory) {
    if (typeof name !== 'string') {
      throw new Error('Yavanna.provide expects a name as the first argument.')
    }

    if (typeof factory !== 'function') {
      throw Error('Yavanna.provide expects a factory function as the second argument. Check the declaration of `' + name + '`.')
    }

    if (registeredFactories[name]) {
      throw Error('Yavanna: cannot override the previously registered factory for `' + name + '`.')
    }
  }

  function validateGetArgs(name) {
    if (!registeredFactories[name]) {
      throw Error('Yavanna: no factory registered for `' + name + '`.')
    }
  }

  return self
}

module.exports = Yavanna
