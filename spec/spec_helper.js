require('phantomjs-polyfill');
require('phantomjs-polyfill-find');
require('babel-polyfill');
const React = require('react');
const ReactDOM = require('react-dom');

require('jasmine_dom_matchers');
const $ = require('jquery');

Object.assign(global, {
  $,
  React,
  ReactDOM
});

beforeEach(() => {
  $('body')
    .find('#root')
    .remove()
    .end()
    .append('<div id="root"/>');
});
