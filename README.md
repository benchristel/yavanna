# Yavanna

A JavaScript dependency injection framework

![CircleCI Build Status](https://circleci.com/gh/benchristel/yavanna.svg?style=shield&circle-token=058bb5224f0693d2f5891954ce85ce8879c88791)

## What?

https://en.wikipedia.org/wiki/Yavanna

## How?

### Require Yavanna and create an instance

```javascript
const yavanna = require('@benchristel/yavanna')()
```

### Register a factory function

Here, our factory is named `peaches` and requires `water` and `sunlight` as dependencies

```javascript
yavanna.provide('peaches', ({water, sunlight}) => {
  if (water && sunlight) {
    return 'PEACHES!'
  } else {
    return 'no peaches :('
  }
})

yavanna.provide('water', () => 'delicious water')
yavanna.provide('sunlight', () => 'glorious sunlight')
```

### Get your stuff, with dependencies injected

```javascript
yavanna.get('peaches') // returns 'PEACHES!'
```

### Override the dependencies with test doubles

```javascript
yavanna.get('peaches', {water: false, sunlight: false}) // returns 'no peaches :('
```

### Terse syntax

Instead of using `.get()` and `.provide()`, you can simply call the function returned from the yavanna constructor.

```javascript
const inject = require('yavanna')()

yavanna('random', () => () => Math.random())

yavanna('egg', ({random}) => {
  return {
    hatch() {
      if (random() > 0.5) return 'it is an seagull'
      return 'nought but a soggy chicken'
    }
  }
})

// and then, in your tests

expect(yavanna('egg', {random: () => 0.51}).hatch()).toEqual('it is an seagull')
```

## Why?

Don't use Yavanna unless you actually feel the need for dependency injection in your project. The use cases for DI in JavaScript are limited, but they do exist.

For example, consider the problem of testing a React component that renders a video player component within itself. If you simply render the component as-is, the actual video player will load, potentially causing unwanted side-effects that could break your test. Stubbing won't work here because your test has no control over the lifecycle of the component instances and therefore no way to stub methods on them. Instead, you need to inject a test double for the video player component class.
