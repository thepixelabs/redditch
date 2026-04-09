import Ajv2020 from 'ajv/dist/2020'
import addFormats from 'ajv-formats'
import { readFileSync, readdirSync } from 'fs'
import yaml from 'js-yaml'
import { join, resolve } from 'path'

const root = resolve(process.cwd())
const schemaPath = join(root, 'data/bikes/_schema.json')
const bikesDir = join(root, 'data/bikes')

const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'))
const ajv = new Ajv2020({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

const files = readdirSync(bikesDir).filter(f => f.endsWith('.yaml'))
let hasErrors = false

console.log(`\nValidating ${files.length} bike file(s)...\n`)

for (const file of files) {
  const filePath = join(bikesDir, file)
  const content = yaml.load(readFileSync(filePath, 'utf-8'))
  const valid = validate(content)
  if (!valid) {
    console.error(`❌ INVALID: ${file}`)
    for (const err of validate.errors ?? []) {
      console.error(`   ${err.instancePath || '(root)'}: ${err.message}`)
    }
    hasErrors = true
  } else {
    console.log(`✅ VALID:   ${file}`)
  }
}

console.log('')
if (hasErrors) {
  console.error('Validation failed. Fix errors above before building.\n')
  process.exit(1)
} else {
  console.log('All bike files are valid.\n')
}
