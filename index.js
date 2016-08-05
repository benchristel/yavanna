function Yavanna() {
  var registeredFactories = {}

  var self = function(arg1, arg2) {
    if (typeof arg2 === 'function') {
      return self.provide(arg1, arg2)
    }
    return self.get(arg1, arg2)
  }

  self.provide = function(name, factory) {
    validateProvideArgs(name, factory)

    registeredFactories[name] = factory

    return factory
  }

  self.get = function(name, overrides) {
    validateGetArgs(name)

    var provender = {}
    var cache = {}
    var dependencyStack = []

    forEachPropertyIn(registeredFactories, function(key) {
      Object.defineProperty(provender, key, {
        get: function() { return getWithCycleDetection(key) },
        configurable: true
      })
    })

    if (overrides) {
      forEachPropertyIn(overrides, function(key) {
        Object.defineProperty(provender, key, {
          get: function() { return overrides[key] },
          configurable: true
        })
      })
    }

    return provender[name]

    function getWithCycleDetection(name) {
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

function forEachPropertyIn(obj, fn) {
  for (var key in obj) {
    fn(key)
  }
}

module.exports = Yavanna
