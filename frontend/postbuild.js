// eslint-disable-next-line no-undef
const path = require('path');
// eslint-disable-next-line no-undef
const fs = require('fs-extra');

// eslint-disable-next-line no-undef
const BUILD_DIR = path.join(__dirname, './build');
// eslint-disable-next-line no-undef
const PUBLIC_DIR = path.join(__dirname, '../src/main/resources/public');

fs.emptyDirSync(PUBLIC_DIR);
fs.copySync(BUILD_DIR, PUBLIC_DIR);
