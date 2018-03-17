# react-spy-on-render

Spy on React components in Jasmine tests.

**DOES NOT WORK WITH FUNCTIONAL COMPONENTS**. They're functions!

## Installation

```sh
yarn add -D react-spy-on-render
# or
npm install react-spy-on-render --save-dev
```

Put this in your `spec_helper.js`:

```js
import 'react-spy-on-render';
// or
require('react-spy-on-render');
```

## Usage

### spyOnRender

Just call it:

```js
spyOnRender(Component);
```

By default, it won't render anything. If you want to render normally:

```js
spyOnRender(Component).and.callThrough();
```

`spyOnRender` returns a spy, so you can do whatever you want with it.

### Matchers

Was the component rendered?

```js
expect(Component).toHaveBeenRendered();
```

Was the component rendered _at any point_ with specific props?

```js
expect(Component).toHaveBeenRenderedWithProps({
  className: 'some-class',
  otherProp: 47
});
```

Was the component _last_ rendered with specific props?

```js
expect(Component).toHaveBeenRenderedLastWithProps({
  className: 'some-class',
  otherProp: 47
});
```

Was the component rendered a specific number of times?

```js
expect(Component).toHaveBeenRenderedTimes(4);
```

### Helpers

Reset all tracked renders on a component:

```js
resetRenders(Component);
```

What props were rendered last?

```js
propsOnLastRender(Component);
```

What props were rendered at some other point in time?

```js
propsOnRenderAt(Component, i);
```

## Acknowledgements

This project drew a lot of inspiration and much of its code from [this great project](https://github.com/atomanyih/spy-on-render).
