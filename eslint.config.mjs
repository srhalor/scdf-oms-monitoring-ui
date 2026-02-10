import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'

export default [
  // Ignore patterns
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
      'jest.config.js',
      'next-env.d.ts',
    ],
  },
  
  // Base JavaScript config
  js.configs.recommended,
  
  // TypeScript ESLint configs
  ...tseslint.configs.recommended,
  
  // Apply to TypeScript and JavaScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Custom rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Import ordering rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',        // Node.js built-in modules
            'external',       // External packages (react, next, etc.)
            'internal',       // Internal aliases (@/...)
            ['parent', 'sibling'], // Relative imports (../, ./)
            'index',          // Index imports
            'object',         // Object imports
            'type',           // Type imports
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
            {
              pattern: '**/*.css',
              group: 'object',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'next', 'type'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          warnOnUnassignedImports: false,
        },
      ],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },
]
