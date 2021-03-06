require('./spec_helper');
require('../src/index');
const React = require('react');
const ReactDOM = require('react-dom');

describe('spyOnRender', () => {
  let Component;

  function getExpectationResult(block) {
    let expectationPassed, expectationMessage;

    function magicExpect(actual) {
      const expectation = expect(actual);

      const addExpectationResultFake = (pass, result) => {
        expectationPassed = pass;
        expectationMessage = result.message;
      };

      expectation.addExpectationResult = addExpectationResultFake;
      expectation.not.addExpectationResult = addExpectationResultFake;

      return expectation;
    }

    block(magicExpect);

    return { passed: expectationPassed, message: expectationMessage };
  }

  beforeEach(() => {
    Component = class Component extends React.Component {
      state = {};

      componentDidMount() {
        if (!this.theThing) {
          throw new Error('should not call lifecycle methods');
        }
        this.setState({componentDidMount: true});
      }

      render() {
        return <h1 ref={el => (this.theThing = el)}>HOO BOY</h1>;
      }
    };
  });

  describe('spying and then rendering', () => {
    beforeEach(() => {
      spyOnRender(Component);
      ReactDOM.render(<Component />, root);
    });

    it('renders nothing by default', () => {
      const el = document.getElementById('root');
      expect(el.innerText).toBe('');
    });
  });

  describe('spying with callThrough and then rendering', () => {
    let subject;

    beforeEach(() => {
      spyOnRender(Component).and.callThrough();
      subject = ReactDOM.render(<Component />, root);
    });

    it('renders the component children', () => {
      const el = document.getElementById('root');
      expect(el.innerText).toBe('HOO BOY');
    });

    it('calls componentDidMount', () => {
      expect(subject.state.componentDidMount).toBe(true);
    });
  });

  describe('toHaveBeenRenderedWithProps', () => {
    beforeEach(() => {
      spyOnRender(Component);
      ReactDOM.render(
        <div>
          <Component className="smokey-dokey" />
          <Component className="hokey-pokey" />
        </div>,
        root
      );
    });

    describe('positive matcher', () => {
      it('matches props', () => {
        expect(Component).toHaveBeenRenderedWithProps({
          className: 'smokey-dokey'
        });
      });

      it('matches props with special matchers', () => {
        expect(Component).toHaveBeenRenderedWithProps({
          className: jasmine.any(String)
        });
      });

      it('errors helpfully when props do not match', () => {
        const { passed, message } = getExpectationResult(expect => {
          expect(Component).toHaveBeenRenderedWithProps({
            className: 'smokey-tokey'
          });
        });

        expect(passed).toEqual(false);
        expect(message).toMatch(
          /Expected Component to have been rendered with props:/
        );
        expect(message).toMatch(/className:/);
        expect(message).toMatch(/actual: 'smokey-dokey'/);
      });
    });

    describe('negative matcher', () => {
      it('can match negative', () => {
        expect(Component).not.toHaveBeenRenderedWithProps({
          className: 'stay-wokey'
        });
      });

      it('errors helpfully when props match', () => {
        const { passed, message } = getExpectationResult(expect => {
          expect(Component).not.toHaveBeenRenderedWithProps({
            className: 'smokey-dokey'
          });
        });

        expect(passed).toEqual(false);
        expect(message).toMatch(
          /Expected Component NOT to have been rendered with props:/
        );
        expect(message).toMatch(/className:/);
        expect(message).toMatch(/actual: 'smokey-dokey'/);
      });
    });

    describe('when never rendered', () => {
      beforeEach(() => {
        Component.prototype.render.calls.reset();
      });

      it('is helpful when matching positively', () => {
        const { passed, message } = getExpectationResult(expect => {
          expect(Component).toHaveBeenRenderedWithProps({
            hello: 'world'
          });
        });

        expect(passed).toEqual(false);
        expect(message).toMatch(
          /Expected Component to have been rendered with props, but it was never rendered./
        );
      });

      it('passes when matching negatively', () => {
        const { passed, message } = getExpectationResult(expect => {
          expect(Component).not.toHaveBeenRenderedWithProps({
            hello: 'world'
          });
        });

        expect(passed).toEqual(true);
      });
    });
  });

  describe('toHaveBeenRenderedLastWithProps', () => {
    beforeEach(() => {
      spyOnRender(Component);
      ReactDOM.render(
        <div>
          <Component className="smokey-dokey" />
          <Component className="hokey-pokey" />
        </div>,
        root
      );
    });

    it('matches the last rendered props', () => {
      expect(Component).toHaveBeenRenderedLastWithProps({
        className: 'hokey-pokey'
      });
    });

    it('does not match previous props', () => {
      expect(Component).not.toHaveBeenRenderedLastWithProps({
        className: 'smokey-dokey'
      });
    });
  });

  describe('toHaveBeenRendered', () => {
    beforeEach(() => {
      spyOnRender(Component);
    });

    describe('positive matcher', () => {
      it('passes if component was rendered', () => {
        ReactDOM.render(<Component />, root);

        expect(Component).toHaveBeenRendered();
      });

      it('errors helpfully if component was not rendered', () => {
        const { passed, message } = getExpectationResult(expect => {
          expect(Component).toHaveBeenRendered();
        });

        expect(passed).toEqual(false);
        expect(message).toMatch(/Expected Component to have been rendered/);
      });
    });

    describe('negative matcher', () => {
      it('passes if component was not rendered', () => {
        expect(Component).not.toHaveBeenRendered();
      });

      it('errors helpfully if component was rendered', () => {
        ReactDOM.render(<Component foo="bar" />, root);

        const { passed, message } = getExpectationResult(expect => {
          expect(Component).not.toHaveBeenRendered();
        });

        expect(passed).toEqual(false);
        expect(message).toMatch(
          /Expected Component NOT to have been rendered, but it was rendered with props:/
        );
        expect(message).toMatch(/foo:/);
        expect(message).toMatch(/actual: 'bar'/);
      });
    });
  });

  describe('toHaveBeenRenderedTimes', () => {
    beforeEach(() => {
      spyOnRender(Component);
      ReactDOM.render(
        <div>
          <Component />
          <Component />
        </div>,
        root
      );
      ReactDOM.render(<Component />, root);
    });

    describe('positive matcher', () => {
      it('passes if component was rendered 3 times', () => {
        expect(Component).toHaveBeenRenderedTimes(3);
      });

      it('errors helpfully if component was not rendered', () => {
        const { passed, message } = getExpectationResult(expect => {
          expect(Component).toHaveBeenRenderedTimes(2);
        });

        expect(passed).toEqual(false);
        expect(message).toMatch(
          /Expected Component to have been rendered 2 times, but it was rendered 3 times./
        );
      });
    });

    describe('negative matcher', () => {
      it('passes if component was not rendered 3 times', () => {
        expect(Component).not.toHaveBeenRenderedTimes(2);
      });

      it('errors helpfully if component was rendered', () => {
        const { passed, message } = getExpectationResult(expect => {
          expect(Component).not.toHaveBeenRenderedTimes(3);
        });

        expect(passed).toEqual(false);
        expect(message).toMatch(
          /Expected Component NOT to have been rendered 3 times./
        );
      });
    });
  });
});
