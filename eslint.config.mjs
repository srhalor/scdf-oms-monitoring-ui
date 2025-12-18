import js from '@eslint/js'
import tseslint from 'typescript-eslint'

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
    },
  },
]
