// What the site currently says about TinyBase, read from the same sources that
// the docs build uses, so that the showreel cannot drift from it. Needs a
// production build in dist/ for the bundle size.
import {readFileSync, statSync} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const UTF8 = 'utf-8';

const read = (path) => readFileSync(join(ROOT, path), UTF8);
const count = (number) => number.toLocaleString('en-US');

// As formatted by site/ui/Readme.tsx.
const toKb = (bytes) => `${(bytes / 1000).toFixed(1)}kB`;

// The integrations on the home page, in their groups.
const getFriends = (home) => {
  const start = home.indexOf('<section id="friends">');
  const section = home.slice(start, home.indexOf('</section>', start));
  const friends = [];
  let group = '';
  for (const [, heading, logo, name] of section.matchAll(
    /<h3>.*?>([^<]+)<\/a><\/h3>|src="\/([\w-]+)\.svg\?asImg" \/>\s*([^\n<]+)/g,
  )) {
    if (heading) {
      group = heading;
    } else {
      friends.push({group, logo, name: name.trim()});
    }
  }
  return friends;
};

export const getFacts = () => {
  const coverage = JSON.parse(read('coverage.json'));
  const {covered, total, pct} = coverage.lines;
  return {
    size: toKb(statSync(join(ROOT, 'dist/min/store/index.js.gz')).size),
    coverage: `${Math.floor(pct)}%`,
    coverageNote: `${count(covered)} of ${count(total)} lines tested`,
    tests: count(coverage.tests),
    assertions: count(coverage.assertions),
    friends: getFriends(read('site/home/index.md')),
  };
};

if (process.argv[1] == fileURLToPath(import.meta.url)) {
  console.log(getFacts());
}
