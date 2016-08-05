function Yavanna() {
  return CachingInjector({}, {})
}

function CachingInjector(factories, cache) {
  var dependencyStack = []
  var injectables = {}

  forEachPropertyIn(factories, function(name) {
    makeInjectable(name)
  })

  var self = {
    get: function(name) {
      validateGetArgs(name)

      if (dependencyStack.indexOf(name) > -1) {
        throw Error('Yavanna: cannot get `' + name + '` because there is a dependency cycle: ' + dependencyStack.join(' -> ') + ' -> ' + name)
      }

      if (notIn(cache, name)) {
        dependencyStack.push(name)
        cache[name] = factories[name](injectables)
        dependencyStack.pop()
      }

      return cache[name]
    },

    provide: function(name, factory) {
      validateProvideArgs(name, factory)

      factories[name] = factory

      makeInjectable(name)

      return factory
    },

    withOverrides: function(overrides) {
      return CachingInjector(factories, overrides)
    }
  }

  return self

  /* private methods below */

  function validateProvideArgs(name, factory) {
    if (typeof name !== 'string') {
      throw new Error('Yavanna.provide expects a name as the first argument.')
    }

    if (typeof factory !== 'function') {
      throw Error('Yavanna.provide expects a factory function as the second argument. Check the declaration of `' + name + '`.')
    }

    if (factories[name]) {
      throw Error('Yavanna: cannot override the previously registered factory for `' + name + '`.')
    }
  }

  function validateGetArgs(name) {
    if (!factories[name]) {
      throw Error('Yavanna: no factory registered for `' + name + '`.')
    }
  }

  function makeInjectable(name) {
    Object.defineProperty(injectables, name, {
      get: function() {
        return self.get(name)
      },
      configurable: true
    })
  }
}

function forEachPropertyIn(obj, fn) {
  for (var key in obj) {
    fn(key)
  }
}

function notIn(cache, name) {
  return !Object.prototype.hasOwnProperty.call(cache, name)
}

module.exports = Yavanna
