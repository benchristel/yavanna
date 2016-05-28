# Yavanna

A JavaScript dependency injection framework

## What?

https://en.wikipedia.org/wiki/Yavanna

## How?

### Require the Yavanna API

```javascript
const {provide, get} = require('yavanna')
```

### Register a factory function

Here, our factory is named `peaches` and requires `water` and `sunlight` as dependencies

```javascript
provide('peaches', ({water, sunlight}) => {
  if (water && sunlight) return 'PEACHES!'
})

provide('water', () => 'delicious water')
provide('sunlight', () => 'glorious sunlight')
```

### Get your stuff, with dependencies injected

```javascript
get('peaches') // returns 'PEACHES!'
```

## Why?

Don't use Yavanna unless you actually feel the need for dependency injection in your project. The use cases for DI in JavaScript are limited, but they do exist.

For example, consider the problem of testing a React component that renders a video player component within itself. If you simply render the component as-is, the actual video player will load, potentially causing unwanted side-effects that could break your test. Stubbing won't work here because your test has no control over the lifecycle of the component instances and therefore no way to stub methods on them. Instead, you need to inject a test double for the video player component class.
