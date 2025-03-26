import jsLint from '@eslint/js';
import importLint from 'eslint-plugin-import';
import jestLint from 'eslint-plugin-jest';
import jsdocLint from 'eslint-plugin-jsdoc';
import reactLint from 'eslint-plugin-react';
import hooksLint from 'eslint-plugin-react-hooks';
import {globalIgnores} from 'eslint/config';
import globals from 'globals';
import tsLint from 'typescript-eslint';

export default tsLint.config(
  globalIgnores([
    'eslint.config.js',
    'docs/**/*',
    'dist/**/*',
    'tmp/**/*',
    'site/extras/*',
    '**/node_modules/**/*',
  ]),

  jsLint.configs.recommended,
  importLint.flatConfigs.recommended,
  jestLint.configs['flat/recommended'],
  jsdocLint.configs['flat/recommended'],
  reactLint.configs.flat.recommended,
  reactLint.configs.flat['jsx-runtime'],
  hooksLint.configs['recommended-latest'],
  tsLint.configs.recommended,

  {
    settings: {
      react: {version: 'detect'},
      'import/resolver': {node: {extensions: ['.js', '.jsx', '.ts', '.tsx']}},
      'import/core-modules': ['expo-sqlite'],
    },

    languageOptions: {globals: {...globals.node, ...globals.browser}},

    rules: {
      'no-var': 2,
      'no-console': 2,
      'object-curly-spacing': [2, 'never'],
      indent: 0,
      'no-empty': [2, {allowEmptyCatch: true}],
      'linebreak-style': [2, 'unix'],
      'space-infix-ops': 2,
      quotes: [2, 'single', {allowTemplateLiterals: true}],
      semi: [2, 'always'],
      'sort-keys': 0,
      'no-multiple-empty-lines': [2, {max: 1}],
      'sort-imports': 0,
      'max-len': [
        2,
        {
          code: 80,
          ignorePattern:
            '^(\\s+\\* )?(imports?|exports?|\\} from|(.+ as .+))\\W.*',
          ignoreUrls: true,
        },
      ],
      'comma-dangle': [
        2,
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
        },
      ],
      'import/no-unresolved': [
        2,
        {
          ignore: [
            '^\\./generated/client$',
            '^custom-remote-handlers$',
            '^electric-sql/(client/model|notifiers|wa-sqlite)$',
            '^cloudflare:workers$',
            'eslint/config',
            'typescript-eslint',
          ],
        },
      ],

      // --

      '@typescript-eslint/unified-signatures': 0,
      '@typescript-eslint/no-invalid-void-type': 0,
      '@typescript-eslint/no-dynamic-delete': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unused-vars': [
        2,
        {argsIgnorePattern: '^_.*', varsIgnorePattern: '^(_.*|React)'},
      ],

      // --

      'jsx-quotes': [2, 'prefer-double'],

      'react/button-has-type': 0,
      'react/destructuring-assignment': 0,
      'react/display-name': 0,
      'react/forbid-component-props': 0,
      'react/jsx-boolean-value': 0,
      'react/jsx-filename-extension': 0,
      'react/jsx-first-prop-new-line': [2, 'multiline'],
      'react/jsx-indent-props': [2, 2],
      'react/jsx-indent': 0,
      'react/jsx-max-depth': [2, {max: 5}],
      'react/jsx-max-props-per-line': [2, {maximum: 1, when: 'multiline'}],
      'react/jsx-newline': 0,
      'react/jsx-no-literals': 0,
      'react/jsx-one-expression-per-line': 0,
      'react/jsx-props-no-spreading': 0,
      'react/jsx-sort-props': 0,
      'react/no-arrow-function-lifecycle': 2,
      'react/no-find-dom-node': 0,
      'react/no-multi-comp': [2, {ignoreStateless: true}],
      'react/no-set-state': 0,
      'react/no-unsafe': 2,
      'react/prop-types': 2,
      'react/require-default-props': 0,
      'react/sort-comp': 0,
      'react/jsx-handler-names': [
        2,
        {eventHandlerPrefix: '_handle', eventHandlerPropPrefix: 'on'},
      ],
      'react/function-component-definition': [
        2,
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-no-useless-fragment': 2,

      // --

      'react-hooks/exhaustive-deps': 2,
      'react-hooks/rules-of-hooks': 2,

      // --

      'jest/expect-expect': [2, {assertFunctionNames: ['expect*']}],
      'jest/no-conditional-expect': 2,
    },
  },

  {
    files: ['src/@types/**/*.js'],
    settings: {jsdoc: {mode: 'typescript', contexts: ['any']}},
    rules: {
      'jsdoc/check-tag-names': [
        2,
        {definedTags: ['category', 'packageDocumentation']},
      ],
      'jsdoc/no-restricted-syntax': [
        2,
        {
          contexts: [
            {
              comment:
                // eslint-disable-next-line max-len
                'JsdocBlock:not(:has(JsdocTag[tag=/category|packageDocumentation/]))',
              message: 'Every non-module block requires a @category tag',
            },
            {
              comment: 'JsdocBlock:not(:has(JsdocTag[tag=since]))',
              message: 'Every block requires a @since tag',
            },
            {
              comment:
                'JsdocBlock:has(JsdocTag[tag=since] ~ JsdocTag[tag=since])',
              message: 'Every block must have only one @since tag',
            },
          ],
        },
      ],
      'jsdoc/require-jsdoc': 2,
      'jsdoc/require-description': 2,
      'jsdoc/require-description-complete-sentence': 2,
      'jsdoc/require-returns-description': 2,
      'jsdoc/no-blank-blocks': 2,
      'jsdoc/require-param-type': 0,
      'jsdoc/require-returns-type': 0,
      'jsdoc/check-param-names': 0,
    },
  },

  {
    files: ['eslint.config.js'],
    extends: [tsLint.configs.disableTypeChecked],
  },
);
