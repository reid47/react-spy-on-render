const { spyOnRender, customMatchers } = require('./src/spy_on_render');
const helpers = require('./src/helpers');

const { jasmine } = global;

Object.assign(global, {
  spyOnRender,
  ...helpers
});

beforeEach(() => {
  jasmine.addMatchers(customMatchers);
});
