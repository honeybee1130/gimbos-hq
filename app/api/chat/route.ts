import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_FILE = '/tmp/gimbos-chat.json'

interface Message {
  id: string
  role: 'user' | 'cello'
  content: string
  timestamp: string
}

function loadMessages(): Message[] {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, 'utf8'))
    }
  } catch {}
  return []
}

function saveMessages(messages: Message[]) {
  writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2))
}

export async function GET() {
  const messages = loadMessages()
  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'empty' }, { status: 400 })

  const messages = loadMessages()
  const msg: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: content.trim(),
    timestamp: new Date().toISOString(),
  }
  messages.push(msg)
  saveMessages(messages)

  // Write to workspace so Cello's heartbeat can pick it up
  try {
    const workspaceMsg = {
      pending: true,
      message: content.trim(),
      timestamp: msg.timestamp,
      id: msg.id,
    }
    writeFileSync('/home/ubuntu/.openclaw/workspace/memory/gimbos-chat-pending.json', JSON.stringify(workspaceMsg, null, 2))
  } catch {}

  return NextResponse.json({ success: true, id: msg.id })
}

export async function PUT(req: NextRequest) {
  // Cello posts a reply via this endpoint (called from heartbeat script)
  const { content, secret } = await req.json()
  if (secret !== process.env.CELLO_SECRET) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const messages = loadMessages()
  const msg: Message = {
    id: Date.now().toString(),
    role: 'cello',
    content: content.trim(),
    timestamp: new Date().toISOString(),
  }
  messages.push(msg)
  saveMessages(messages)
  return NextResponse.json({ success: true })
}
