var Yavanna = require('./index')

describe('Yavanna', function() {
  var yv, Melian
  beforeEach(function() {
    yv = Yavanna()

    // Example modules
    Melian = yv.provide('Melian', function(provided) {
      return {
        reportOnPeachSituation: function() {
          if (provided.Peaches) return 'PEACHES'
          return 'not enough peaches :('
        }
      }
    })

    var Peaches = yv.provide('Peaches', function(provided) {
      return provided.Water && provided.Sunlight
    })

    var Water = yv.provide('Water', function() { return true })
    var Sunlight = yv.provide('Sunlight', function() { return true })
  })

  it('provides peaches', function() {
    var melian = yv.get('Melian')
    expect(melian.reportOnPeachSituation()).toEqual('PEACHES')
  })

  it('errors if you try to get something that doesn\'t exist', function() {
    expect(function() {
      yv.get('nemo')
    }).toThrowError(
      'Yavanna: no factory registered for `nemo`.'
    )
  })

  it('errors if you try to provide something that\'s not a function', function() {
    expect(function() {
      yv.provide('foo', 'waz')
    }).toThrowError(
      'Yavanna.provide expects a factory function as the second argument. Check the declaration of `foo`.'
    )
  })

  it('errors if you don\'t pass a name to `provide`', function() {
    expect(function() {
      yv.provide(function() {})
    }).toThrowError(
      'Yavanna.provide expects a name as the first argument.'
    )
  })

  it('warns if you override a previously provided value', function() {
    var consoleWarnSpy = spyOn(console, 'warn')

    yv.provide('Galadriel', function() {})

    expect(function() {
      yv.provide('Galadriel', function() {})
    }).toThrowError(
      'Yavanna: cannot override the previously registered factory for `Galadriel`.'
    )
  })

  it('works when two things require the same dependency', function() {
    var yv = Yavanna()
    yv.provide('A', function (inj) { return inj.CommonDependency })
    yv.provide('B', function (inj) { return inj.CommonDependency })
    yv.provide('CommonDependency', function () { return 'it works' })
    expect(yv.get('A')).toEqual('it works')
    expect(yv.get('B')).toEqual('it works')
  })

  describe('Injecting test doubles', function() {
    it('works just by calling the factory passed to Yavanna', function() {
      var melian = Melian({Peaches: false})
      expect(melian.reportOnPeachSituation()).toEqual('not enough peaches :(')
    })
  })

  describe('In the presence of a dependency cycle', function() {
    it('throws a descriptive error', function() {
      var yv = Yavanna()
      yv.provide('A', function(inj) { return inj.B })
      yv.provide('B', function(inj) { return inj.A })

      expect(function() { yv.get('A') }).toThrowError('Yavanna: cannot get `A` because there is a dependency cycle: A -> B -> A')
    })
  })
})


