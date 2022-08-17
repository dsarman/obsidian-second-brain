import 'dotenv/config';
import esbuild from "esbuild";
import fs from "fs";
import process from "process";
import builtins from 'builtin-modules'

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = process.argv[2] === "production";
const outdir = prod ? "dist/" : process.env.DEVDIR;

if (!outdir) {
  console.error(
    "\x1b[41m\x1b[1m", "ERROR!", "\x1b[0m ", "Output directory not set!",
    "\n",
    "Make sure that you have an .env file in the root of your project directory.",
    "\n",
    "Assure that the `DEVDIR` variable is set to the path of your test vault, like `<path to vault>/.obsidian/plugins/obsidian-second-brain`"
  );
  process.exit(1);
}

const moveStaticFiles = () => {
  fs.copyFileSync("./manifest.json", `${outdir}/manifest.json`);
  fs.copyFileSync("./styles.css", `${outdir}/styles.css`);
  try {
    fs.writeFileSync(`${outdir}/.hotreload`, "", { flag: "wx" });
  } catch {
  }
};

esbuild.build({
	banner: {
		js: banner,
	},
	entryPoints: ['src/main.ts'],
	bundle: true,
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/closebrackets',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/comment',
		'@codemirror/fold',
		'@codemirror/gutter',
		'@codemirror/highlight',
		'@codemirror/history',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/matchbrackets',
		'@codemirror/panel',
		'@codemirror/rangeset',
		'@codemirror/rectangular-selection',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/stream-parser',
		'@codemirror/text',
		'@codemirror/tooltip',
		'@codemirror/view',
		...builtins],
	format: 'cjs',
	watch: !prod && {
    onRebuild(error) {
      if (error) { return }
      moveStaticFiles();
    }
  },
	target: 'es2016',
	logLevel: "info",
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
  outdir
}).catch(() => process.exit(1));