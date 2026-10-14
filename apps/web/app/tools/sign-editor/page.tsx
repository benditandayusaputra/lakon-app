import type { Metadata } from 'next'
import { SignEditor } from '@/components/sign-editor'

export const metadata: Metadata = {
  title: 'Editor isyarat | Lakon',
}

export default function SignEditorPage() {
  return <SignEditor />
}
