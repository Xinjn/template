const esbuild = require("esbuild");
const textReplace = require("esbuild-plugin-text-replace");
// const alias = require('esbuild-plugin-alias');
const path = require("path");
const glob = require("glob");
const isDev = process.env.NODE_ENV == "development" ? true : false;
const del = require("del");

del.sync([`${path.join(process.cwd(), "./dist/*_*_handler*.js")}`]);

exports.esbuild = async () => {
  try {
    let files = glob.sync(path.join(process.cwd(), "./src/**/handler.js"));
    if (files.length == 0) {
      return;
    }
    let entryPoints = {};
    for (const filepath of files) {
      let trunkName = filepath
        .split("/src/")
        .pop()
        .replace(/\//g, "_")
        .replace(".js", "");
      entryPoints[trunkName] = filepath;
    }
    console.log(entryPoints);
    let result = await esbuild.build({
      bundle: true,
      entryPoints: entryPoints,
      outdir: "./dist",
      entryNames: isDev ? "[dir]/[name]" : "[dir]/[name].[hash]",
      platform: "node",
      target: "node14.7",
      external: ["./node_modules/*"],
      format: "iife",
      charset: "utf8",
      globalName: "handler",
      drop: ["debugger", "console"],
      plugins: [
        // alias({
        //     '@src': path.resolve(process.cwd(), './src'),
        // }),
        textReplace({
          include: /.*\.js$/,
          pattern: [
            [
              /import[\w\,\{\}\-\:\s]*?['"](?!\.|@src\/|@\/)[\-\w\@\/]+(\.\w+)?['"];?/g,
              "",
            ],
            [
              /(let|const|var)?[\w\,\{\}\-\:\s\=]*?require\( *['"](?!\.|@src\/|@\/)[\-\w\@\/]+(\.\w+)?['"] *\);?/g,
              "",
            ],
          ],
        }),
      ],
    });

    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};
