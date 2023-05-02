import path from 'path'
import rollup from '../rollup/index.js'
import {fileURLToPath} from 'url'
const entry = path.resolve(fileURLToPath(new URL('../src/main.js',import.meta.url)))
const output = path.resolve(fileURLToPath(new URL('../dist/bundle.js',import.meta.url)))

rollup(entry, output)