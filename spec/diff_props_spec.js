require('./spec_helper');
const React = require('react');
const ReactDOM = require('react-dom');
const { diffProps } = require('../src/diff_props');

const equals = (a, b) => {
  const diffBuilder = new jasmine.DiffBuilder();
  const equal = jasmine.matchersUtil.equals(a, b, null, diffBuilder);
  return { equal, diffBuilder };
};

describe('diffProps', () => {
  let expected, actual, result;

  describe('when props are equal', () => {
    beforeEach(() => {
      expected = {
        name: 'test'
      };

      actual = [
        {
          name: 'test'
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('returns an empty string', () => {
      expect(result).toBe('');
    });
  });

  describe('when some props are not provided', () => {
    beforeEach(() => {
      expected = {
        notGivenProp: 'test',
        otherNotGivenProp: 47,
        someOtherProp: 'test2'
      };

      actual = [
        {
          someOtherProp: 'test2'
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('returns a message listing the unprovided props', () => {
      expect(result).toEqual(
        [
          'on render 1 (most recent):',
          '',
          '  notGivenProp:',
          '      actual: (prop not given)',
          "    expected: 'test'",
          '',
          '  otherNotGivenProp:',
          '      actual: (prop not given)',
          '    expected: 47'
        ].join('\n')
      );
    });
  });

  describe('when some extra props are provided', () => {
    beforeEach(() => {
      expected = {
        someOtherProp: 'test2'
      };

      actual = [
        {
          extraProp: 'test',
          otherExtraProp: 47,
          someOtherProp: 'test2'
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('returns a message listing the unprovided props', () => {
      expect(result).toEqual(
        [
          'on render 1 (most recent):',
          '',
          '  extraProp:',
          "      actual: 'test'",
          '    expected: (prop not given)',
          '',
          '  otherExtraProp:',
          '      actual: 47',
          '    expected: (prop not given)'
        ].join('\n')
      );
    });
  });

  describe('when value-type props are different', () => {
    beforeEach(() => {
      expected = {
        stringPropSame: 'test',
        stringPropDiff: 'hello',
        boolPropSame: true,
        boolPropDiff: false,
        numPropSame: 47,
        numPropDiff: 48,
        nullPropSame: null,
        nullPropDiff: null,
        undefPropSame: undefined,
        undefPropDiff: undefined
      };

      actual = [
        {
          stringPropSame: 'test',
          stringPropDiff: 'world',
          boolPropSame: true,
          boolPropDiff: true,
          numPropSame: 47,
          numPropDiff: 47,
          nullPropSame: null,
          nullPropDiff: undefined,
          undefPropSame: undefined,
          undefPropDiff: null
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('returns a helpful message', () => {
      expect(result).toBe(
        [
          'on render 1 (most recent):',
          '',
          '  boolPropDiff:',
          '      actual: true',
          '    expected: false',
          '        diff: Expected true to equal false.',
          '',
          '  nullPropDiff:',
          '      actual: undefined',
          '    expected: null',
          '        diff: Expected undefined to equal null.',
          '',
          '  numPropDiff:',
          '      actual: 47',
          '    expected: 48',
          '        diff: Expected 47 to equal 48.',
          '',
          '  stringPropDiff:',
          "      actual: 'world'",
          "    expected: 'hello'",
          "        diff: Expected 'world' to equal 'hello'.",
          '',
          '  undefPropDiff:',
          '      actual: null',
          '    expected: undefined',
          '        diff: Expected null to equal undefined.'
        ].join('\n')
      );
    });
  });

  describe('when array props are different', () => {
    beforeEach(() => {
      expected = {
        arrayProp: [1, 2, 'test']
      };

      actual = [
        {
          arrayProp: [1, 2, 'test', 4]
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('returns a helpful message', () => {
      expect(result).toBe(
        [
          'on render 1 (most recent):',
          '',
          '  arrayProp:',
          "      actual: [1, 2, 'test', 4]",
          "    expected: [1, 2, 'test']",
          '        diff: Expected $.length = 4 to equal 3.',
          '              Expected $[3] = 4 to equal undefined.'
        ].join('\n')
      );
    });
  });

  describe('when object props are different', () => {
    beforeEach(() => {
      expected = {
        objProp: { a: 1, b: 'test', c: { d: true, e: 8 } }
      };

      actual = [
        {
          objProp: { a: 1, b: 'test', c: { d: false, e: 9 } }
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('returns a helpful message', () => {
      expect(result).toBe(
        [
          'on render 1 (most recent):',
          '',
          '  objProp:',
          '      actual: {"a":1,"b":"test","c":{"d":false,"e":9}}',
          '    expected: {"a":1,"b":"test","c":{"d":true,"e":8}}',
          '        diff: Expected $.c.d = false to equal true.',
          '              Expected $.c.e = 9 to equal 8.'
        ].join('\n')
      );
    });
  });

  describe('when circular object props are different', () => {
    beforeEach(() => {
      const circularA = {};
      circularA.self = circularA;

      const circularB = { 1: 2 };
      circularB.self = circularB;

      expected = {
        circularProp: circularA
      };

      actual = [
        {
          circularProp: circularB
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('returns a helpful message', () => {
      expect(result).toBe(
        [
          'on render 1 (most recent):',
          '',
          '  circularProp:',
          '      actual: <circular object>',
          '    expected: <circular object>',
          '        diff: Expected object not to have properties',
          '                  1: 2'
        ].join('\n')
      );
    });
  });

  describe('when function props are different', () => {
    let func1, func2, func3;

    beforeEach(() => {
      func1 = () => 47;
      func2 = () => null;
      func3 = () => console.log('nice');

      expected = {
        funcProp: func1,
        funcProp2: func2
      };

      actual = [
        {
          funcProp: func1,
          funcProp2: func3
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('returns a helpful message', () => {
      expect(result).toBe(
        [
          'on render 1 (most recent):',
          '',
          '  funcProp2:',
          '      actual: function func3() {',
          "                      return console.log('nice');",
          '                    }',
          '    expected: function func2() {',
          '                      return null;',
          '                    }',
          '        diff: Expected Function to equal Function.'
        ].join('\n')
      );
    });
  });

  describe('when JSX props are different', () => {
    beforeEach(() => {
      expected = {
        jsxPropSame: <div className="one">test</div>,
        jsxPropDiff1: <span className="two A">test</span>,
        jsxPropDiff2: <button onClick={() => null} />
      };

      actual = [
        {
          jsxPropSame: <div className="one">test</div>,
          jsxPropDiff1: <span className="two B">test</span>,
          jsxPropDiff2: <button onClick={() => null} />
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('returns a helpful message', () => {
      expect(result).toBe(
        [
          'on render 1 (most recent):',
          '',
          '  jsxPropDiff1:',
          '      actual: <span className="two B">',
          '                test',
          '              </span>',
          '    expected: <span className="two A">',
          '                test',
          '              </span>',
          "        diff: Expected $.props.className = 'two B' to equal 'two A'.",
          '',
          '  jsxPropDiff2:',
          '      actual: <button onClick={<Function>} />',
          '    expected: <button onClick={<Function>} />',
          '        diff: Expected $.props.onClick = Function to equal Function.'
        ].join('\n')
      );
    });
  });

  describe('multiple renders', () => {
    beforeEach(() => {
      expected = {
        someProp: 'test'
      };

      actual = [
        {
          someProp: 'test1'
        },
        {
          someProp: 'test2'
        },
        {
          someProp: 'test3'
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('shows results for all renders', () => {
      expect(result).toEqual(
        [
          'on render 3 (most recent):',
          '',
          '  someProp:',
          "      actual: 'test3'",
          "    expected: 'test'",
          "        diff: Expected 'test3' to equal 'test'.",
          '',
          '========',
          '',
          'on render 2:',
          '',
          '  someProp:',
          "      actual: 'test2'",
          "    expected: 'test'",
          "        diff: Expected 'test2' to equal 'test'.",
          '',
          '========',
          '',
          'on render 1:',
          '',
          '  someProp:',
          "      actual: 'test1'",
          "    expected: 'test'",
          "        diff: Expected 'test1' to equal 'test'."
        ].join('\n')
      );
    });
  });

  describe('when actualOnly is true', () => {
    beforeEach(() => {
      expected = {
        someProp: 'test'
      };

      actual = [
        {
          someProp: 'test'
        }
      ];

      result = diffProps(equals, expected, actual, true);
    });

    it('only shows actual, not expected', () => {
      expect(result).toEqual(
        [
          'on render 1 (most recent):',
          '',
          '  someProp:',
          "      actual: 'test'"
        ].join('\n')
      );
    });
  });

  describe('when expecting jasmine.objectContaining', () => {
    beforeEach(() => {
      expected = jasmine.objectContaining({
        not: 'here'
      });

      actual = [
        {
          hello: 'world',
          other: 'thing'
        }
      ];

      result = diffProps(equals, expected, actual);
    });

    it('diffs only the props in the sample object', () => {
      expect(result).toBe(
        [
          'on render 1 (most recent):',
          '',
          '  not:',
          '      actual: (prop not given)',
          "    expected: 'here'"
        ].join('\n')
      );
    });

    describe('when one prop is a jasmine.objectContaining', () => {
      beforeEach(() => {
        expected = {
          fancyProp: jasmine.objectContaining({
            some: 'thing'
          })
        };

        actual = [
          {
            fancyProp: {
              not: 'this'
            }
          }
        ];

        result = diffProps(equals, expected, actual);
      });

      it('diffs only the props in the sample object', () => {
        expect(result).toBe(
          [
            'on render 1 (most recent):',
            '',
            '  fancyProp:',
            '      actual: {"not":"this"}',
            "    expected: <jasmine.objectContaining(Object({ some: 'thing' }))>",
            "        diff: Expected Object({ not: 'this' }) to equal <jasmine.objectContaining(Object({ some: 'thing' }))>."
          ].join('\n')
        );
      });
    });
  });
});
