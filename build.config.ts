import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./src/index'],
  externals: ['react'],
  clean: true,
  declaration: true, // 是否需要生成 d.ts
  rollup: {
    // inlineDependencies: true, // 是否将依赖inline方式注入产物
    esbuild: {
      minify: true,
      format: 'esm',
    },
  },
});
