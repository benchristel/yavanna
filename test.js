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

  it('provides peaches with terse syntax', function () {
    var melian = yv('Melian')
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

  it('builds each dependency at most once per call to `get`', function() {
    // TODO
    var yv = Yavanna()
    var calls = 0
    yv.provide('A', function (inj) { return inj.B + inj.C })
    yv.provide('B', function (inj) { return inj.CommonDependency })
    yv.provide('C', function (inj) { return inj.CommonDependency })
    yv.provide('CommonDependency', function () {
      calls++
      return 'it works'
    })
    expect(yv.get('A')).toEqual('it worksit works')
    expect(calls).toEqual(1)
  })

  describe('Injecting test doubles', function() {
    it('applies only to the injector returned from withOverrides', function() {
      var yv2 = yv.withOverrides({Peaches: false})
      var melian2 = yv2.get('Melian')
      var melian = yv.get('Melian')
      expect(melian2.reportOnPeachSituation()).toEqual('not enough peaches :(')
      expect(melian.reportOnPeachSituation()).toEqual('PEACHES')
    })

    it('reads from a separate cache for modules with overridden dependencies', function() {
      var yv = Yavanna()
      yv.provide('Sum', function(inj) { return inj.A + inj.B  })
      yv.provide('A', function() { return 5 })
      yv.provide('B', function() { return 7 })

      expect(yv.get('Sum')).toEqual(12)

      var yv2 = yv.withOverrides({A: 3, B: 4})

      expect(yv2.get('Sum')).toEqual(7)
    })

    it('writes to a separate cache when overriding dependencies', function() {
      var yv = Yavanna()
      yv.provide('Sum', function(inj) { return inj.A + inj.B  })
      yv.provide('A', function() { return 5 })
      yv.provide('B', function() { return 7 })

      var yv2 = yv.withOverrides({A: 3, B: 4})
      expect(yv2.get('Sum')).toEqual(7)
      expect(yv.get('Sum')).toEqual(12)
    })

    it('does not affect non-overridden dependencies', function() {
      var yv = Yavanna()
      yv.provide('Sum', function(inj) { return inj.A + inj.B })
      yv.provide('A', function() { return 5 })
      yv.provide('B', function() { return 7 })

      var yv2 = yv.withOverrides({B: 3})
      expect(yv2.get('Sum')).toEqual(8)
      expect(yv.get('Sum')).toEqual(12)
    })

    it('can override dependences deep in the require chain', function() {
      var yv = Yavanna()
      yv.provide('Sum', function(inj) { return inj.A + inj.B })
      yv.provide('A', function(inj) { return inj.B + inj.C })
      yv.provide('B', function() { return 2 })
      yv.provide('C', function() { return 7 })

      var yv2 = yv.withOverrides({C: 3})

      expect(yv2.get('Sum')).toEqual(7)
      expect(yv.get('Sum')).toEqual(11)
    })
  })

  describe('Registering dependencies', function() {
    it('has a terse syntax', function() {
      var yv = Yavanna()
      yv('Foo', function () { return 'this is foo' })
      expect(yv('Foo')).toEqual('this is foo')
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

