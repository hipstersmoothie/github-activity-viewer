module.exports = {
  env: { browser: true },

  parser: "@typescript-eslint/parser",

  extends: ["airbnb", "xo", "xo-react/space", "prettier"],

  plugins: ["react-hooks", "eslint-plugin-jsdoc"],

  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    // stylistic

    // Bugs in parser typescript prevent use from using this rule
    // 'padding-line-between-statements': [
    //   'warn',
    //   {
    //     blankLine: 'always',
    //     prev: '*',
    //     next: ['return', 'block', 'block-like']
    //   }
    // ]
    /* xo config */
    "import/no-unassigned-import": [2, { allow: ["**/*.css"] }],
    "react/function-component-definition": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "react/prefer-read-only-props": 0,
    "arrow-body-style": 0,
    "no-restricted-imports": 0,
    "react/hook-use-state": 0,
    "import/no-named-as-default": 0,
    // makes commenting out lines quickly a hassle
    "capitalized-comments": 0,
    "import/extensions": [
      2,
      "always",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],

    /* airbnb */
    // Need to name function for some stringification
    "func-names": 0,
    "import/no-unresolved": [2, { ignore: [".css$"] }],
    "import/no-duplicates": 0,
    "consistent-return": 0,
    // We have some complicated functions
    complexity: ["error", { max: 30 }],
    // JSDoc comments are used for react docgen so they don't have to be valid
    "valid-jsdoc": 0,
    // DEPRECATED
    "jsx-a11y/label-has-for": 0,
    // use this instead
    "jsx-a11y/label-has-associated-control": 2,
    // Some of our components have a role prop
    "jsx-a11y/aria-role": [
      2,
      {
        ignoreNonDOM: true,
      },
    ],
    // Sometimes it makes sense not to
    "import/prefer-default-export": 0,
    // plugins generally do not use this
    "class-methods-use-this": 0,
    // Very common and we like to use it
    "no-plusplus": 0,

    // This is a pattern devs should use! gimme html attributes or give me death
    "react/jsx-props-no-spreading": 0,
    "react/state-in-constructor": 0,
    "react/static-property-placement": 0,
    "react/jsx-tag-spacing": 0, // from xo
    "react/jsx-indent": 0, // from xo
    "react/sort-comp": 0, // from airbnb
    // Adds a lot of extra code
    "react/destructuring-assignment": 0, // from airbnb
    // Only allow JSX in tsx + js files
    "react/jsx-filename-extension": [
      2,
      { extensions: [".js", ".jsx", ".tsx"] },
    ],
    "react/default-props-match-prop-types": 2,

    /* jsdoc plugin */

    "jsdoc/check-alignment": 1,
    "jsdoc/check-param-names": 1,
    "jsdoc/check-tag-names": 1,
    "jsdoc/implements-on-classes": 1,
    "jsdoc/no-types": 1,
    "jsdoc/require-param-description": 1,
    "jsdoc/require-returns-check": 1,
    "jsdoc/require-returns-description": 1,
    "jsdoc/require-hyphen-before-param-description": [1, "always"],
    camelcase: 0,
    "jsdoc/require-jsdoc": 0,
    // off until typescript support it for the new flag in 4.2
    "dot-notation": "off",
    // not needed react 17
    "react/react-in-jsx-scope": "off",
  },
  overrides: [
    {
      files: ["*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
      extends: ["plugin:@typescript-eslint/recommended"],
      plugins: ["@typescript-eslint", "eslint-plugin-no-explicit-type-exports"],
      rules: {
        "no-use-before-define": 0,
        "react/prop-types": 0,
        "react/default-props-match-prop-types": 0,
        "no-explicit-type-exports/no-explicit-type-exports": 2,
        "no-unused-expressions": 0,
        //  !!! Add this back once TS plugins supports `as const`
        "@typescript-eslint/no-object-literal-type-assertion": 0,
        "@typescript-eslint/no-this-alias": 2,
        "@typescript-eslint/no-unnecessary-type-assertion": 2,
        "@typescript-eslint/no-useless-constructor": 2,
        // if we turn this on babel adds regeneratorRuntime which makes builds harder and larger
        "@typescript-eslint/promise-function-async": 0,
        // just rely on typescript inference
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/explicit-member-accessibility": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
      },
    },
    {
      files: ["*.{js,jsx}"],
      rules: {
        "jsdoc/no-types": 0,
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      files: [
        "*.proof.*",
        "*.test.*",
        "*.stories.*",
        "theme.*",
        "*.config.*",
        "*.d.ts",
        "*.snippet.*",
      ],
      rules: {
        "jsdoc/require-jsdoc": 0,
        "react/prefer-stateless-function": 0,
        "react/button-has-type": 0,
        "jsx-a11y/control-has-associated-label": 0,
        "jsx-a11y/no-static-element-interactions": 0,
        "jsx-a11y/jsx-a11y/anchor-has-content": 0,
        // devDependencies are all in the root
        "import/no-extraneous-dependencies": 0,
        "@typescript-eslint/ban-ts-comment": 0,
      },
    },
    {
      files: ["*.test.{ts,tsx}", "*.stories.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/ban-ts-ignore": 0,
      },
    },
    {
      files: ["*.mdx"],
      parser: "eslint-mdx",
      plugins: ["mdx"],
      globals: {
        React: true,
      },
      rules: {
        "import/no-extraneous-dependencies": 0,
        // This is how we use jsx in mdx
        "no-unused-expressions": 0,
        // in mdx it's already in scope
        "react/react-in-jsx-scope": 0,
        // jsx is allowed in mdx
        "react/jsx-filename-extension": 0,
        // No exported function in MDX
        "jsdoc/require-jsdoc": 0,
      },
    },
    {
      files: ["src/pages/api/**/*"],
      rules: {
        "no-console": "off",
      },
    },
  ],
};
