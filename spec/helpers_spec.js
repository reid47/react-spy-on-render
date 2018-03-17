require('./spec_helper');
require('../src/index');
const React = require('react');
const ReactDOM = require('react-dom');

describe('Helpers', () => {
  let Component;

  beforeEach(() => {
    Component = class Component extends React.Component {
      componentDidMount() {
        if (!this.theThing) {
          throw new Error('should not call lifecycle methods');
        }
      }

      render() {
        return <h1 ref={el => (this.theThing = el)}>HOO BOY</h1>;
      }
    };

    spyOnRender(Component);
  });

  describe('propsOnLastRender', () => {
    const propsOnFirstRender = { foo: 'bar' };
    const propsOnSecondRender = { foo: 'baz' };

    beforeEach(() => {
      ReactDOM.render(<Component {...propsOnFirstRender} />, root);
    });

    it('returns props from last call to render', () => {
      expect(propsOnLastRender(Component)).toEqual(propsOnFirstRender);

      ReactDOM.render(<Component {...propsOnSecondRender} />, root);

      expect(propsOnLastRender(Component)).toEqual(propsOnSecondRender);
    });
  });

  describe('propsOnRenderAt', () => {
    const propsOnFirstRender = { foo: 'bar' };
    const propsOnSecondRender = { foo: 'baz' };

    beforeEach(() => {
      ReactDOM.render(
        <div>
          <Component {...propsOnFirstRender} />
          <Component {...propsOnSecondRender} />
        </div>,
        root
      );
    });

    it('returns props from last call to render', () => {
      expect(propsOnRenderAt(Component, 0)).toEqual(propsOnFirstRender);
      expect(propsOnRenderAt(Component, 1)).toEqual(propsOnSecondRender);
    });
  });

  describe('resetRenders', () => {
    const propsOnFirstRender = { foo: 'bar' };
    const propsOnSecondRender = { foo: 'baz' };

    beforeEach(() => {
      ReactDOM.render(
        <div>
          <Component {...propsOnFirstRender} />
          <Component {...propsOnSecondRender} />
        </div>,
        root
      );
      resetRenders(Component);
    });

    it('resets all tracked renders', () => {
      expect(Component.prototype.render.calls.all()).toEqual([]);
    });
  });
});
