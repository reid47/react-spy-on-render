const { spyOnRender, customMatchers } = require('./spy_on_render');
const helpers = require('./helpers');

const { jasmine } = global;

Object.assign(global, {
  spyOnRender,
  ...helpers
});

beforeEach(() => {
  jasmine.addMatchers(customMatchers);
});
