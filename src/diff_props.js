const React = require('react');
const toJSXString = require('react-element-to-jsx-string').default;
const NOT_GIVEN = '(prop not given)';

const isAsymmetricMatcher = obj => obj
  && typeof obj.asymmetricMatch === 'function'
  && typeof obj.jasmineToString === 'function';

const isObjectContaining = obj => obj
  && typeof obj.asymmetricMatch === 'function'
  && obj.constructor.name === 'ObjectContaining';

const indentAllButFirstLine = str =>
  str
    .split('\n')
    .map((s, i) => (i === 0 ? s : `              ${s}`))
    .join('\n');

const formatValue = value => {
  if (isAsymmetricMatcher(value)) {
    return value.jasmineToString();
  }

  if (typeof value === 'string') {
    return `'${value}'`;
  }

  if (typeof value !== 'object' || value == null) {
    return indentAllButFirstLine(`${value}`);
  }

  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`;
  }

  if (React.isValidElement(value)) {
    return indentAllButFirstLine(
      toJSXString(value, {
        functionValue: fn => '<Function>'
      })
    );
  }

  try {
    return JSON.stringify(value);
  } catch (err) {
    if (/circular structure/.test(err.message)) {
      return '<circular object>';
    }

    throw err;
  }
};

const formatMissingProp = (prop, expectedValue) =>
  formatActualExpected(prop, NOT_GIVEN, formatValue(expectedValue), '');

const formatUnexpectedProp = (prop, actualValue, actualOnly) =>
  formatActualExpected(
    prop,
    formatValue(actualValue),
    NOT_GIVEN,
    '',
    actualOnly
  );

const formatMismatchedProp = (prop, actualValue, expectedValue, diff) =>
  formatActualExpected(
    prop,
    formatValue(actualValue),
    formatValue(expectedValue),
    diff
  );

const formatActualExpected = (prop, actual, expected, diff, actualOnly) => {
  return [
    `  ${prop}:`,
    `      actual: ${actual}`,
    !actualOnly && `    expected: ${expected}`,
    diff && `        diff: ${indentAllButFirstLine(diff)}`
  ]
    .filter(i => i)
    .join('\n');
};

const compare = (equals, index, isMostRecent, actualOnly, expected, actual) => {
  const objectContaining = isObjectContaining(expected);

  if (objectContaining) {
    expected = expected.sample;
  }

  const relevantProps = objectContaining
    ? expected
    : { ...expected, ...actual };

  const details = Object.keys(relevantProps)
    .sort()
    .map(prop => {
      if (actualOnly) {
        return formatUnexpectedProp(prop, actual[prop], true);
      }

      const inActual = actual.hasOwnProperty(prop);
      const inExpected = expected.hasOwnProperty(prop);

      if (inExpected && !inActual) {
        return formatMissingProp(prop, expected[prop]);
      }

      if (inActual && !inExpected) {
        return formatUnexpectedProp(prop, actual[prop]);
      }

      const { equal, diffBuilder } = equals(actual[prop], expected[prop]);

      if (!equal) {
        return formatMismatchedProp(
          prop,
          actual[prop],
          expected[prop],
          diffBuilder.getMessage() || ''
        );
      }
    })
    .filter(i => i)
    .join('\n\n');

  return details
    ? `on render ${index}${isMostRecent ? ' (most recent)' : ''}:\n\n${details}`
    : '';
};

export const diffProps = (equals, expected, propsByRender, actualOnly) => {
  return propsByRender
    .reverse()
    .map((actual, i) =>
      compare(
        equals,
        propsByRender.length - i,
        i === 0,
        actualOnly,
        expected,
        actual
      )
    )
    .join('\n\n========\n\n');
};
