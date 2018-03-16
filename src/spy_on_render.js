const { diffProps } = require('./diff_props');

const REACT_LIFECYCLE_METHODS = [
  'componentWillMount',
  'componentDidMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillUnmount'
];

function getDisplayName(componentClass) {
  return componentClass.displayName || componentClass.name;
}

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
    toHaveBeenRenderedWithProps(util, customEqualityTesters) {
      const equals = (a, b) => {
        const diffBuilder = new jasmine.DiffBuilder();
        const equal = util.equals(a, b, customEqualityTesters, diffBuilder);
        return { equal, diffBuilder };
      };

      return {
        compare(actual, expected) {
          let result = {};

          const propsByRender = actual.prototype.render.calls
            .all()
            .map(({ object: { props } }) => props);

          const matchingProps = propsByRender.find(props => {
            return util.equals(props, expected, customEqualityTesters);
          });

          const displayClass = getDisplayName(actual);
          const displayExpected = jasmine.pp(expected);

          if (matchingProps) {
            result.pass = true;
            result.message = `Expected ${displayClass} not to have been rendered with props ${displayExpected}`;
          } else {
            result.pass = false;
            console.log({ propsByRender });
            result.message = diffProps(equals, expected, propsByRender);
          }

          return result;
        }
      };
    },
    toHaveBeenRendered() {
      return {
        compare(actual) {
          let result = {};

          const mostRecentCall = actual.prototype.render.calls.mostRecent();

          const displayClass = getDisplayName(actual);

          if (mostRecentCall) {
            result.pass = true;
            result.message = `Expected ${displayClass} not to have been rendered`;
          } else {
            result.pass = false;
            result.message = `Expected ${displayClass} to have been rendered`;
          }

          return result;
        }
      };
    }
  }
};
