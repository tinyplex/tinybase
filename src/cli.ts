#! /usr/bin/env node
/* eslint-disable no-console */

const main = () => {
  const [, , command, ...args] = process.argv;
  switch (command) {
    case 'pwd':
      console.log(process.cwd());
      return;
    default:
      console.dir(args);
      console.log('Commands: [pwd]');
      return;
  }
};

main();
