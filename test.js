var Yavanna = require('./index')
var provide = Yavanna.provide
var get = Yavanna.get

// Example modules
var Melian = provide('Melian', function(provided) {
  return {
    reportOnPeachSituation: function() {
      if (provided.Peaches) return 'PEACHES'
      return 'not enough peaches :('
    }
  }
})

var Peaches = provide('Peaches', function(provided) {
  return provided.Water && provided.Sunlight
})

var Water = provide('Water', function() { return true })
var Sunlight = provide('Sunlight', function() { return true })
 
describe('Yavanna', function() {
  it('provides peaches', function() {
    var melian = get('Melian')
    expect(melian.reportOnPeachSituation()).toEqual('PEACHES')
  })

  it('errors if you try to get something that doesn\'t exist', function() {
    expect(function() { 
      get('nemo')
    }).toThrowError(
      'Yavanna: no factory registered for `nemo`.'
    )
  })

  it('errors if you try to provide something that\'s not a function', function() {
    expect(function() { 
      provide('foo', 'waz') 
    }).toThrowError(
      'Yavanna.provide expects a factory function as the second argument. Check the declaration of `foo`.'
    )
  })

  it('errors if you don\'t pass a name to `provide`', function() {
    expect(function() { 
      provide(function() {}) 
    }).toThrowError(
      'Yavanna.provide expects a name as the first argument.'
    )
  })

  it('warns if you override a previously provided value', function() {
    var consoleWarnSpy = spyOn(console, 'warn')

    Yavanna.provide('Galadriel', function() {})

    expect(function() {
      Yavanna.provide('Galadriel', function() {})
    }).toThrowError(
      'Yavanna: cannot override the previously registered factory for `Galadriel`.'
    )
  })
})

describe('Injecting test doubles', function() {
  it('works just by calling the factory passed to Yavanna', function() {
    var melian = Melian({Peaches: false})
    expect(melian.reportOnPeachSituation()).toEqual('not enough peaches :(')
  })
})
