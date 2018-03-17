require('babel-polyfill');
const React = require('react');
const ReactDOM = require('react-dom');

beforeEach(() => {
  const root = document.getElementById('root');
  if (root) {
    document.body.removeChild(root);
  }
  const newRoot = document.createElement('div');
  newRoot.setAttribute('id', 'root');
  document.body.appendChild(newRoot);
});
