module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:flowtype/recommended'],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
            jsx: true,
        },
        sourceType: 'module',
    },
    plugins: ['react', 'flowtype'],
    // "rules": {
    //     "no-console": "off",
    //     "no-restricted-syntax": [
    //         "error",
    //         {
    //             "selector": "CallExpression[callee.object.name='console'][callee.property.name!=/^(log|warn|error|info|trace)$/]",
    //             "message": "Unexpected property on console object was called"
    //         }
    //     ]
    // },
    // rules: require('@ifeng/tool_eslint'),
};
