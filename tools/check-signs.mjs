import { loadContent, report } from './validate-content.mjs'
import { unapprovedSigns, validateContent } from '../packages/sign-schema/src/index.ts'

const content = await loadContent()

const issues = validateContent(content)
if (issues.length > 0) {
  console.error('Build blocked: invalid content:')
  report(issues)
  process.exit(1)
}

const allowDraft = process.env.LAKON_ALLOW_DRAFT === '1'
const drafts = unapprovedSigns(content.signs)
if (drafts.length > 0 && !allowDraft) {
  console.error(
    'Build blocked: signs not approved (set LAKON_ALLOW_DRAFT=1 for a development build):',
  )
  report(drafts)
  process.exit(1)
}

const total = Object.keys(content.signs).length
if (drafts.length > 0) {
  console.log(
    `LAKON_ALLOW_DRAFT=1: ${drafts.length} of ${total} signs not approved, continuing the build`,
  )
} else {
  console.log(`${total} signs approved`)
}
