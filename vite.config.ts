/// <reference types="vitest" />
import * as path from 'path'
import {resolve} from 'path'
import {defineConfig} from 'vite';
// For wasm inclusion
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
// For wasm generated by wasm-pack
import wasmPack from 'vite-plugin-wasm-pack';
// To include and minify glsl into the bundle
import glsl from 'vite-plugin-glsl';
// To include css into the bundle
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
    build: {
        minify: 'esbuild',
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, 'src/js/A.js'),
            name: 'A',
            formats: ["umd", "es"],
            // the proper extensions will be added
            fileName: 'aladin',
        },
        rollupOptions: {},
        //formats: ["es"],
        target: ["es2015", "chrome58", "edge18", "firefox57", "node20", "safari11"],
        //target: ["es2015"],
        // Relative to the root
        outDir: resolve(__dirname, 'dist'),
    },
    //publicDir: resolve(__dirname, 'src/img'),
    plugins: [
        wasm(),
        wasmPack(resolve(__dirname, 'src/core')),
        topLevelAwait(),
        glsl({
            compress: true,
        }),
        cssInjectedByJsPlugin(),
    ],
    resolve: {
        alias: [
            {find: '@', replacement: path.resolve(__dirname, '/src')},
            {find: '#', replacement: path.resolve(__dirname, '/tests/unit')},
            {find: '$', replacement: path.resolve(__dirname, '/tests/e2e')}
        ],
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        include: [
            'tests/unit/**/*.{test,spec}.{js,ts}'
        ],
        deps: {
            inline: ['core/pkg'],
        },
    },
    server: {
        open: '/examples/index.html',
    },
});
