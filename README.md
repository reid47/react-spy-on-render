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

was the component rendered?

```js
expect(Component).toHaveBeenRendered();
```

with specific properties?

```js
expect(Component).toHaveBeenRenderedWithProps({
  className: 'whatever',
  otherProp: 'whocares'
});
```

### Helpers

what props were rendered last?

```js
propsOnLastRender(Component);
```

what props were rendered at some other point in time?

```js
propsOnRenderAt(Component, i);
```

### Acknowledgements

This project is based on code from [this project](https://github.com/atomanyih/spy-on-render).
