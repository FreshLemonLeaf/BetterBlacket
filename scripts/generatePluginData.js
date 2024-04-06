import fs from 'fs';
import { devs } from '../src/constants.js';

let plugins = [];

[...fs.readdirSync('./src/plugins')].forEach((file) => {
    let raw = fs.readFileSync('./src/plugins/' + file + '/index.js', 'utf8');

    plugins.push({
        title: raw.match(/title: '([^']*)'/m)[1],
        description: raw.match(/description: '([^']*)'/m)[1],
        author: devs[raw.match(/author: devs\.([\w.]+)/m)[1]],
        path: file
    });
});

fs.writeFileSync('./dist/pluginData.json', JSON.stringify(plugins));

console.log('Generated!\n');