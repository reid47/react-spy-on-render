const { diffProps } = require('./diff_props');

const REACT_LIFECYCLE_METHODS = [
  'componentWillMount',
  'componentDidMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillUnmount',
  'componentDidCatch'
];

function getDisplayName(componentClass) {
  return componentClass.displayName || componentClass.name;
}

const createMatcher = getPropsByRender => {
  return (util, customEqualityTesters) => {
    const equals = (a, b) => {
      const diffBuilder = new jasmine.DiffBuilder();
      const equal = util.equals(a, b, customEqualityTesters, diffBuilder);
      return { equal, diffBuilder };
    };

    return {
      compare(actual, expected) {
        let pass, message;

        const displayClass = getDisplayName(actual);
        const propsByRender = getPropsByRender(actual);
        const matchingProps = propsByRender.filter(props => {
          return util.equals(props, expected, customEqualityTesters);
        });

        if (matchingProps.length) {
          pass = true;
          message =
            `Expected ${displayClass} NOT to have been rendered with props:\n\n` +
            diffProps(equals, {}, matchingProps, true);
        } else if (propsByRender.length === 0) {
          pass = false;
          message =
            `Expected ${displayClass} to have been rendered with props, ` +
            `but it was never rendered.`;
        } else {
          pass = false;
          message =
            `Expected ${displayClass} to have been rendered with props:\n\n` +
            diffProps(equals, expected, propsByRender);
        }

        return { pass, message };
      }
    };
  };
};

module.exports = {
  spyOnRender(componentClass) {
    REACT_LIFECYCLE_METHODS.forEach(methodName => {
      if (componentClass.prototype[methodName]) {
        spyOn(componentClass.prototype, methodName);
      }
    });

    return spyOn(componentClass.prototype, 'render').and.returnValue(null);
  },
  customMatchers: {
    toHaveBeenRenderedWithProps: createMatcher(actual =>
      actual.prototype.render.calls.all().map(({ object: { props } }) => props)
    ),
    toHaveBeenRenderedLastWithProps: createMatcher(actual => [
      actual.prototype.render.calls.mostRecent().object.props
    ]),
    toHaveBeenRenderedTimes() {
      return {
        compare(actual, expectedTimes) {
          const displayClass = getDisplayName(actual);

          const actualTimes = actual.prototype.render.calls.count();
          if (actualTimes === expectedTimes) {
            return {
              pass: true,
              message: `Expected ${displayClass} NOT to have been rendered ${actualTimes} times.`
            };
          }

          return {
            pass: false,
            message:
              `Expected ${displayClass} to have been rendered ${expectedTimes} times, ` +
              `but it was rendered ${actualTimes} times.`
          };
        }
      };
    },
    toHaveBeenRendered(util, customEqualityTesters) {
      const equals = (a, b) => {
        const diffBuilder = new jasmine.DiffBuilder();
        const equal = util.equals(a, b, customEqualityTesters, diffBuilder);
        return { equal, diffBuilder };
      };

      return {
        compare(actual) {
          const displayClass = getDisplayName(actual);

          const propsByRender = actual.prototype.render.calls
            .all()
            .map(({ object: { props } }) => props);

          if (propsByRender.length) {
            return {
              pass: true,
              message:
                `Expected ${displayClass} NOT to have been rendered, but it was rendered with props:\n\n` +
                diffProps(equals, {}, propsByRender, true)
            };
          }

          return {
            pass: false,
            message: `Expected ${displayClass} to have been rendered`
          };
        }
      };
    }
  }
};
