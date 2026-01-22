import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";
import { babel } from "@rollup/plugin-babel";

const dev = process.env.ROLLUP_WATCH;

export default [
    {
        input: "js/panel/main.tsx",
        output: {
            file: "custom_components/intentsity/panel.js",
            format: "es",
        },
        plugins: [
            nodeResolve(),
            json(),
            typescript(),
            babel({ babelHelpers: 'bundled', exclude: "node_modules/**" }),
            !dev && terser({ format: { comments: false } }),
        ],
    },
];
