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
        const displayClass = getDisplayName(actual);

        const propsByRender = getPropsByRender(actual);

        const matchingProps = propsByRender.filter(props => {
          return util.equals(props, expected, customEqualityTesters);
        });

        if (matchingProps.length) {
          return {
            pass: true,
            message:
              `Expected ${displayClass} NOT to have been rendered with props:\n\n` +
              diffProps(equals, {}, matchingProps, true)
          };
        }

        return {
          pass: false,
          message:
            `Expected ${displayClass} to have been rendered with props:\n\n` +
            diffProps(equals, expected, propsByRender)
        };
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
