import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './src',
    environment: 'node',
    coverage: {
      provider: 'v8',
      reportsDirectory: '../coverage',
      include: ['**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.d.ts', 'main.ts'],
    },
  },
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          // Required for NestJS: emitDecoratorMetadata equivalent
          decoratorMetadata: true,
          legacyDecorator: true,
        },
        target: 'es2022',
      },
      module: { type: 'es6' },
    }),
  ],
});
