require('./spec_helper');
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
          'render 0:',
          '',
          '  notGivenProp:',
          "        expected: 'test'",
          '          actual: (prop not given)',
          '',
          '  otherNotGivenProp:',
          '        expected: 47',
          '          actual: (prop not given)'
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
          'render 0:',
          '',
          '  extraProp:',
          '        expected: (prop not given)',
          "          actual: 'test'",
          '',
          '  otherExtraProp:',
          '        expected: (prop not given)',
          '          actual: 47'
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
          'render 0:',
          '',
          '  boolPropDiff:',
          '        expected: false',
          '          actual: true',
          '            diff: Expected true to equal false.',
          '',
          '  nullPropDiff:',
          '        expected: null',
          '          actual: undefined',
          '            diff: Expected undefined to equal null.',
          '',
          '  numPropDiff:',
          '        expected: 48',
          '          actual: 47',
          '            diff: Expected 47 to equal 48.',
          '',
          '  stringPropDiff:',
          "        expected: 'hello'",
          "          actual: 'world'",
          "            diff: Expected 'world' to equal 'hello'.",
          '',
          '  undefPropDiff:',
          '        expected: undefined',
          '          actual: null',
          '            diff: Expected null to equal undefined.'
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
          'render 0:',
          '',
          '  arrayProp:',
          "        expected: [1, 2, 'test']",
          "          actual: [1, 2, 'test', 4]",
          '            diff: Expected $.length = 4 to equal 3.',
          '                  Expected $[3] = 4 to equal undefined.'
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
          'render 0:',
          '',
          '  objProp:',
          '        expected: {"a":1,"b":"test","c":{"d":true,"e":8}}',
          '          actual: {"a":1,"b":"test","c":{"d":false,"e":9}}',
          '            diff: Expected $.c.d = false to equal true.',
          '                  Expected $.c.e = 9 to equal 8.'
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
          'render 0:',
          '',
          '  funcProp2:',
          '        expected: function func2() {',
          '                          return null;',
          '                        }',
          '          actual: function func3() {',
          "                          return console.log('nice');",
          '                        }',
          '            diff: Expected Function to equal Function.'
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
          'render 0:',
          '',
          '  jsxPropDiff1:',
          '        expected: <span className="two A">',
          '                    test',
          '                  </span>',
          '          actual: <span className="two B">',
          '                    test',
          '                  </span>',
          "            diff: Expected $.props.className = 'two B' to equal 'two A'.",
          '',
          '  jsxPropDiff2:',
          '        expected: <button onClick={<Function>} />',
          '          actual: <button onClick={<Function>} />',
          '            diff: Expected $.props.onClick = Function to equal Function.'
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
          'render 0:',
          '',
          '  someProp:',
          "        expected: 'test'",
          "          actual: 'test1'",
          "            diff: Expected 'test1' to equal 'test'.",
          '',
          '========',
          '',
          'render 1:',
          '',
          '  someProp:',
          "        expected: 'test'",
          "          actual: 'test2'",
          "            diff: Expected 'test2' to equal 'test'.",
          '',
          '========',
          '',
          'render 2:',
          '',
          '  someProp:',
          "        expected: 'test'",
          "          actual: 'test3'",
          "            diff: Expected 'test3' to equal 'test'."
        ].join('\n')
      );
    });
  });
});
