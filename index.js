function Yavanna() {
  var cache = {}
  var registeredFactories = {}
  var provender = {}

  var self = {}

  self.provide = function(name, factory) {
    validateProvideArgs(name, factory)

    registeredFactories[name] = factory

    Object.defineProperty(provender, name, {
      get: function() { return self.get(name) }
    })

    return factory
  }

  self.get = function(name) {
    validateGetArgs(name)

    if (!cache[name]) {
      cache[name] = registeredFactories[name](provender)
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
