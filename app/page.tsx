'use client'

import { useState, useEffect, useRef } from 'react'

const TABS = ['overview', 'lore', 'campaign', 'calendar', 'todos', 'chat'] as const
type Tab = typeof TABS[number]

const TODOS_KEY = 'gimbos-todos-v1'

interface Todo {
  id: string
  text: string
  done: boolean
  category: string
  priority: 'high' | 'mid' | 'low'
}

const INITIAL_TODOS: Todo[] = [
  { id: '1', text: 'Post speculation video (today)', done: false, category: 'Content', priority: 'high' },
  { id: '2', text: 'Write Gimbos lore (full Book of Gimbo)', done: false, category: 'Lore', priority: 'high' },
  { id: '3', text: 'Get Geez (@GeezOnApe) to add Gimbos to their marketplace (buy with PNUTZ)', done: false, category: 'Partnerships', priority: 'high' },
  { id: '4', text: 'Confirm mint price + mechanic (free for WL winners? public price?)', done: false, category: 'Mint', priority: 'high' },
  { id: '5', text: 'Confirm total Gimbos collection size', done: false, category: 'Mint', priority: 'high' },
  { id: '6', text: 'Lock March 20 mint date (tentative)', done: false, category: 'Mint', priority: 'mid' },
  { id: '7', text: 'Commission "The Last Offering" art (Renaissance Last Supper with Gimbos)', done: false, category: 'Content', priority: 'mid' },
  { id: '8', text: 'Create faction lore posts (Stone, Void, Forest, Tech, Warrior)', done: false, category: 'Content', priority: 'mid' },
  { id: '9', text: 'Set up Gimbos-specific Twitter account OR confirm @ape_church is the handle', done: false, category: 'Socials', priority: 'mid' },
  { id: '10', text: 'Cross-chain marketing push — Solana/Base degen targeting', done: false, category: 'Marketing', priority: 'mid' },
  { id: '11', text: 'Plan OG x Ape Church collab event on Otherside', done: false, category: 'Partnerships', priority: 'mid' },
  { id: '12', text: 'Identify 3 streamers to pitch "I joined a frog cult casino"', done: false, category: 'Marketing', priority: 'low' },
  { id: '13', text: 'Build "Vitruvian Gimbo" visual for normie/art Twitter', done: false, category: 'Content', priority: 'low' },
  { id: '14', text: 'Write cross-chain onboarding copy ("the crossing" ritual framing)', done: false, category: 'Content', priority: 'low' },
]

const CALENDAR_EVENTS = [
  { date: 'Feb 27', label: 'TODAY', items: ['Speculation video drop', 'Campaign planning session'] },
  { date: 'Feb 28', label: 'SAT', items: ['OG x Typical Tigers event (3PM EST)', 'Faction lore drop: Stone Gimbo'] },
  { date: 'Mar 1', label: 'SUN', items: ['Into The Otherside — Papichulomeme (3PM EST)', 'Faction lore drop: Void Gimbo'] },
  { date: 'Mar 2', label: 'MON', items: ['Faction lore drop: Forest Gimbo'] },
  { date: 'Mar 3', label: 'TUE', items: ['OG Chaos Trials (9PM EST)', 'Faction lore drop: Tech Gimbo'] },
  { date: 'Mar 4', label: 'WED', items: ['Faction lore drop: Warrior Class'] },
  { date: 'Mar 5', label: 'THU', items: ['Faction lore drop: Legendary/Collab teaser (Thanos)'] },
  { date: 'Mar 8', label: 'SAT', items: ['OG Saturday Event', 'Church Mechanics content: The Runestones'] },
  { date: 'Mar 10', label: 'MON', items: ['Church Mechanics content: The Offering'] },
  { date: 'Mar 12', label: 'WED', items: ['WL FOMO post — "seats left, not many"'] },
  { date: 'Mar 15', label: 'SUN', items: ['5 days to mint — countdown begins'] },
  { date: 'Mar 17', label: 'TUE', items: ['3 days to mint', 'OG Chaos Trials'] },
  { date: 'Mar 19', label: 'THU', items: ['1 day to mint — final push'] },
  { date: 'Mar 20', label: '🎯 MINT', items: ['GIMBOS MINT DAY', 'Risk it for the Church', 'Geez marketplace goes live with PNUTZ'] },
]

interface ChatMessage {
  id: string
  role: 'user' | 'cello'
  content: string
  timestamp: string
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('overview')
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS)
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(TODOS_KEY)
    if (saved) {
      try { setTodos(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    if (tab === 'chat') {
      fetchChat()
      const interval = setInterval(fetchChat, 5000)
      return () => clearInterval(interval)
    }
  }, [tab])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const fetchChat = async () => {
    try {
      const r = await fetch('/api/chat')
      const d = await r.json()
      setChatMessages(d.messages || [])
    } catch {}
  }

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    setChatLoading(true)
    const optimistic: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    }
    setChatMessages(m => [...m, optimistic])
    setChatInput('')
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: optimistic.content }),
      })
      await fetchChat()
    } catch {}
    setChatLoading(false)
  }

  const toggleTodo = (id: string) => {
    setTodos(t => t.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo))
  }

  const addTodo = () => {
    if (!newTodo.trim()) return
    const t: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      done: false,
      category: 'Custom',
      priority: 'mid',
    }
    setTodos(prev => [...prev, t])
    setNewTodo('')
  }

  const cats = ['all', ...Array.from(new Set(todos.map(t => t.category)))]
  const filtered = filter === 'all' ? todos : todos.filter(t => t.category === filter)
  const done = filtered.filter(t => t.done).length
  const total = filtered.length

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #e8e8e0; font-family: 'Georgia', serif; min-height: 100vh; }
        .app { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
        .header { border-bottom: 1px solid #2a2a1a; padding-bottom: 20px; margin-bottom: 24px; display: flex; align-items: baseline; gap: 16px; }
        .logo { font-size: 28px; font-weight: 700; color: #c8a84b; letter-spacing: -0.5px; }
        .logo span { color: #4a8c4a; }
        .subtitle { font-size: 13px; color: #666; font-style: italic; }
        .tabs { display: flex; gap: 4px; margin-bottom: 28px; flex-wrap: wrap; }
        .tab { padding: 8px 16px; border: 1px solid #2a2a1a; background: transparent; color: #888; cursor: pointer; font-family: Georgia, serif; font-size: 13px; border-radius: 4px; transition: all 0.15s; }
        .tab:hover { color: #c8a84b; border-color: #c8a84b44; }
        .tab.active { background: #1a1a0a; border-color: #c8a84b; color: #c8a84b; }
        .section { margin-bottom: 32px; }
        .section-title { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c8a84b; margin-bottom: 16px; }
        .card { background: #111108; border: 1px solid #2a2a1a; border-radius: 8px; padding: 20px; margin-bottom: 12px; }
        .card h3 { font-size: 15px; color: #e8e8e0; margin-bottom: 8px; }
        .card p { font-size: 13px; color: #888; line-height: 1.7; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media(max-width: 600px) { .grid2 { grid-template-columns: 1fr; } }
        .stat { background: #111108; border: 1px solid #2a2a1a; border-radius: 8px; padding: 16px; text-align: center; }
        .stat .num { font-size: 32px; font-weight: 700; color: #c8a84b; }
        .stat .label { font-size: 11px; color: #666; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .progress { background: #1a1a1a; border-radius: 99px; height: 6px; overflow: hidden; margin: 8px 0; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, #4a8c4a, #c8a84b); border-radius: 99px; transition: width 0.3s; }
        .todo-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #1a1a0a; }
        .todo-item:last-child { border-bottom: none; }
        .todo-cb { width: 18px; height: 18px; border: 1.5px solid #444; border-radius: 3px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin-top: 2px; transition: all 0.15s; }
        .todo-cb.checked { background: #4a8c4a; border-color: #4a8c4a; }
        .todo-text { font-size: 14px; line-height: 1.5; flex: 1; }
        .todo-text.done { text-decoration: line-through; color: #555; }
        .badge { font-size: 10px; padding: 2px 7px; border-radius: 99px; font-family: monospace; }
        .badge-high { background: #3a1a1a; color: #c85a5a; }
        .badge-mid { background: #1a2a1a; color: #5a9a5a; }
        .badge-low { background: #1a1a2a; color: #5a7aaa; }
        .badge-cat { background: #2a2a1a; color: #c8a84b; margin-left: 6px; }
        .cal-row { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #1a1a0a; align-items: flex-start; }
        .cal-date { min-width: 80px; font-size: 12px; color: #c8a84b; font-family: monospace; }
        .cal-label { font-size: 10px; color: #666; display: block; margin-top: 2px; }
        .cal-items { flex: 1; }
        .cal-item { font-size: 13px; color: #aaa; padding: 2px 0; }
        .cal-row.mint { background: #1a1a0a; border-radius: 6px; padding: 12px; border: 1px solid #c8a84b44; }
        .cal-row.mint .cal-item { color: #c8a84b; font-weight: bold; }
        .lore-block { border-left: 3px solid #4a8c4a; padding-left: 16px; margin-bottom: 20px; }
        .lore-block h4 { font-size: 14px; color: #c8a84b; margin-bottom: 6px; }
        .lore-block p { font-size: 13px; color: #aaa; line-height: 1.8; }
        .lore-quote { font-style: italic; color: #888; border: 1px solid #2a2a1a; padding: 16px; border-radius: 6px; margin: 16px 0; font-size: 14px; line-height: 1.8; }
        .chat-window { height: 420px; overflow-y: auto; background: #0d0d0a; border: 1px solid #2a2a1a; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
        .chat-msg { margin-bottom: 16px; }
        .chat-msg .who { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .chat-msg.user .who { color: #c8a84b; }
        .chat-msg.cello .who { color: #4a8c4a; }
        .chat-msg .body { font-size: 14px; line-height: 1.7; color: #ccc; white-space: pre-wrap; }
        .chat-msg .ts { font-size: 10px; color: #444; margin-top: 4px; }
        .chat-input-row { display: flex; gap: 8px; }
        .chat-input-row input { flex: 1; background: #111108; border: 1px solid #2a2a1a; color: #e8e8e0; padding: 10px 14px; border-radius: 6px; font-family: Georgia, serif; font-size: 14px; }
        .chat-input-row input:focus { outline: none; border-color: #c8a84b44; }
        .btn { background: #1a1a0a; border: 1px solid #c8a84b44; color: #c8a84b; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-family: Georgia, serif; font-size: 13px; transition: all 0.15s; }
        .btn:hover { background: #2a2a0a; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .filter-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .filter-btn { font-size: 11px; padding: 4px 10px; border-radius: 99px; border: 1px solid #2a2a1a; background: transparent; color: #666; cursor: pointer; font-family: Georgia, serif; }
        .filter-btn.active { border-color: #c8a84b; color: #c8a84b; background: #1a1a0a; }
        .add-row { display: flex; gap: 8px; margin-top: 16px; }
        .add-row input { flex: 1; background: #111108; border: 1px solid #2a2a1a; color: #e8e8e0; padding: 8px 12px; border-radius: 6px; font-family: Georgia, serif; font-size: 13px; }
        .add-row input:focus { outline: none; border-color: #c8a84b44; }
        .notice { background: #1a1a0a; border: 1px solid #2a2a1a; border-radius: 6px; padding: 12px 16px; font-size: 12px; color: #666; line-height: 1.6; }
        .faction-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-top: 12px; }
        .faction-card { background: #0d0d0a; border: 1px solid #2a2a1a; border-radius: 6px; padding: 14px; }
        .faction-card .name { font-size: 12px; color: #c8a84b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .faction-card .desc { font-size: 12px; color: #777; line-height: 1.5; }
        .highlight { color: #c8a84b; }
        .green { color: #4a8c4a; }
      `}</style>

      <div className="app">
        <div className="header">
          <div className="logo">🐸 Gimbos <span>HQ</span></div>
          <div className="subtitle">Ape Church Command Center — built by Cello</div>
        </div>

        <div className="tabs">
          {TABS.map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? '⚡ Overview' :
               t === 'lore' ? '📜 Lore' :
               t === 'campaign' ? '📣 Campaign' :
               t === 'calendar' ? '📅 Calendar' :
               t === 'todos' ? '✅ Todos' :
               '💬 Chat Cello'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div>
            <div className="section">
              <div className="section-title">Status</div>
              <div className="grid2">
                <div className="stat">
                  <div className="num">Mar 20</div>
                  <div className="label">Mint Date (tentative)</div>
                </div>
                <div className="stat">
                  <div className="num">{todos.filter(t => t.done).length}/{todos.length}</div>
                  <div className="label">Tasks Complete</div>
                </div>
              </div>
              <div className="card" style={{marginTop: 12}}>
                <div className="progress">
                  <div className="progress-bar" style={{width: `${Math.round(todos.filter(t=>t.done).length/todos.length*100)}%`}} />
                </div>
                <div style={{fontSize: 11, color: '#666', marginTop: 6}}>{Math.round(todos.filter(t=>t.done).length/todos.length*100)}% complete</div>
              </div>
            </div>

            <div className="section">
              <div className="section-title">What Gimbos Are</div>
              <div className="card">
                <p>Ancient frog creatures that evolved from tadpoles in the margins of the Otherside. They built the Church — the oldest structure in the Otherside — before the Apes arrived. Their religion is <span className="highlight">chance itself</span>. They gather at the altar, make offerings, throw the runestones, and play games of chance as an act of worship. They are degens. They are true believers. Same thing.</p>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Active Threads</div>
              <div className="card">
                <h3>🎯 Immediate (Today/Tomorrow)</h3>
                <p style={{marginTop: 8}}>
                  {todos.filter(t => t.priority === 'high' && !t.done).map(t => (
                    <span key={t.id} style={{display: 'block', padding: '4px 0', color: '#c85a5a', fontSize: 13}}>
                      → {t.text}
                    </span>
                  ))}
                  {todos.filter(t => t.priority === 'high' && !t.done).length === 0 && <span style={{color: '#4a8c4a'}}>All high priority tasks done ✓</span>}
                </p>
              </div>
              <div className="card">
                <h3>🤝 Key Partnerships</h3>
                <p style={{marginTop: 8, fontSize: 13, lineHeight: 2}}>
                  <span style={{display: 'block'}}>→ <span className="highlight">@GeezOnApe</span> — add Gimbos to marketplace, buyable with PNUTZ</span>
                  <span style={{display: 'block'}}>→ <span className="highlight">@OtherGamesXYZ</span> — Ape Church sponsored events / collab Saturday events</span>
                  <span style={{display: 'block'}}>→ <span className="highlight">@apecoin</span> — ecosystem alignment, cross-promote</span>
                </p>
              </div>
            </div>

            <div className="section">
              <div className="section-title">The One-Line Pitch</div>
              <div className="lore-quote">
                "A frog cult runs a casino inside an ancient church at the edge of the known world. Nobody knows who built the altar. They just know: the Church provides."
              </div>
            </div>
          </div>
        )}

        {tab === 'lore' && (
          <div>
            <div className="section">
              <div className="section-title">Origin</div>
              <div className="lore-block">
                <h4>Before the Apes. Before the Kodas.</h4>
                <p>Long before anyone mapped the biomes of the Otherside, there were the ponds. Hidden in the swampy margins of untamed land, where soil glowed and water held memory. The tadpoles lived there. They absorbed everything — the energy of every bet ever made, every game ever played, every soul that passed through. And then they changed. The Church of the Gimbo is the oldest structure in the Otherside. The Kodas know it exists. They don't talk about it.</p>
              </div>
              <div className="lore-block">
                <h4>The First Offering</h4>
                <p>The first Gimbo to climb out of the water looked at the Otherside and understood something the others couldn't yet: the only true freedom in a world built and destroyed on the whims of the powerful is the bet. Not luck. The moment where everything could go either way and you still choose to throw. This Gimbo built the altar. Not to a god. To chance itself. The runestones are how they commune with it.</p>
              </div>
              <div className="lore-block">
                <h4>Why They Play</h4>
                <p>Playing is praying. Every game is a conversation with the universe. You come to the altar, you make an offering — something real, not symbolic — you throw the runestones, and the universe answers. Win or lose, you come back. That's the faith. Not believing you'll win. Believing it's always worth the throw. The altar rewards commitment. Not caution.</p>
              </div>
            </div>

            <div className="section">
              <div className="section-title">The Factions</div>
              <div className="faction-grid">
                {[
                  { name: 'Stone', color: '#5a8a7a', desc: "Been at the altar since before anyone was watching. Patient. Immovable. Most trusted in the Church. They've seen the runestones fall ten thousand times." },
                  { name: 'Forest', color: '#4a8c4a', desc: "Oracles. They don't predict the future. They remember futures that already happened somewhere else." },
                  { name: 'Void', color: '#888', desc: "Lost everything. Came back. Lost it again. Came back again. Even the Church doesn't fully trust them. They always show up when there's something to win." },
                  { name: 'Tech', color: '#5a7aaa', desc: "Absorbed the Otherside's digital pulse. New converts. Run probability models on their chest panels. Throw the runestones anyway." },
                  { name: 'Warrior', color: '#c8a84b', desc: "Took on a role. Serve the Church. The ninja protects the altars. The plague doctor tends to those who bet wrong and lost something they can't get back." },
                ].map(f => (
                  <div className="faction-card" key={f.name}>
                    <div className="name" style={{color: f.color}}>{f.name} Gimbo</div>
                    <div className="desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <div className="section-title">The Aesthetic Bible</div>
              <div className="card">
                <h3>Renaissance Catholic × Casino × Otherside Chaos</h3>
                <p style={{marginTop: 10, lineHeight: 2}}>
                  Leonardo da Vinci hired to document a frog cult casino in a swamp. Baroque drama. Chiaroscuro lighting. Illuminated manuscripts where the saints have been replaced by Gimbos.<br/>
                  <span className="highlight">The Last Offering</span> — The Last Supper but all Gimbos at the altar table.<br/>
                  <span className="highlight">Vitruvian Gimbo</span> — Perfect Gimbo form inscribed in circle and square.<br/>
                  <span className="highlight">The Book of Gimbo</span> — Illuminated manuscript pages, gold leaf, Gimbo script.<br/>
                  Colors: deep crimson, aged gold, midnight black, forest green, stone grey. Accent: <span style={{color: '#00e5cc'}}>teal (the color of luck)</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === 'campaign' && (
          <div>
            <div className="section">
              <div className="section-title">Campaign Strategy</div>
              <div className="card">
                <h3>Core Framing</h3>
                <p style={{marginTop: 8, lineHeight: 1.8}}>Two audiences at once:<br/>
                  <span className="highlight">The earners</span> (already have WL) — validation. "What you've been grinding toward is real and it's this."<br/>
                  <span className="highlight">The outsiders</span> (don't have WL) — FOMO. "Look what these people are about to get. There's still time."
                </p>
              </div>
              <div className="card">
                <h3>Tagline</h3>
                <div className="lore-quote" style={{marginTop: 8}}>"Risk it for the Church."</div>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Content Drops — Ready to Post</div>
              {[
                { label: 'Speculation Video Caption', content: 'They were here before everyone else.\n\nGimbos. March 20.\n\nYou\'ve been playing. You\'ve been earning.\n\nTime to find out what for.' },
                { label: 'Stone Gimbo Lore Drop', content: 'Stone Gimbos don\'t rush.\n\nThey\'ve been at the altar longer than you\'ve known this place existed.\n\nWeekly. Every week. Offering after offering.\n\nThe Church noticed.\n\nYou think grinding the leaderboard is new? They invented it.' },
                { label: 'Void Gimbo Lore Drop', content: 'Lost everything.\nCame back.\nLost it again.\nCame back again.\n\nThe void Gimbo doesn\'t fear the altar.\n\nThe altar fears the void Gimbo.\n\nSome things you can\'t scare away from the game.' },
                { label: 'Mint Day Post', content: 'Today is the day.\n\nYou played. You earned. You made your offerings.\n\nThe altar is open.\n\nGimbos mint now.\n\nRisk it for the Church.' },
                { label: 'Cross-Chain Invite', content: 'Your chain doesn\'t matter.\nYour tokens can be converted.\n\nThe Church has one requirement:\nyou show up with something to bet.\n\nThe bridge is open. The altar is waiting.' },
              ].map((item, i) => (
                <div className="card" key={i}>
                  <h3 style={{fontSize: 12, color: '#c8a84b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10}}>{item.label}</h3>
                  <pre style={{fontFamily: 'Georgia, serif', fontSize: 13, color: '#aaa', lineHeight: 1.8, whiteSpace: 'pre-wrap'}}>{item.content}</pre>
                </div>
              ))}
            </div>

            <div className="section">
              <div className="section-title">Growth Channels</div>
              <div className="grid2">
                <div className="card">
                  <h3>Cross-Chain (Solana/Base)</h3>
                  <p style={{marginTop: 8}}>Post Gimbo faction art on Solana/Base NFT Twitter with zero context. Let people ask what it is. Bridge = "the crossing." Frame as ritual of entry.</p>
                </div>
                <div className="card">
                  <h3>Streamers</h3>
                  <p style={{marginTop: 8}}>"I joined a frog cult casino" = instant YouTube title. Religious framing makes every outcome content. Win = altar provides. Loss = bad offering.</p>
                </div>
                <div className="card">
                  <h3>Art/Normie Twitter</h3>
                  <p style={{marginTop: 8}}>Renaissance aesthetic travels without context. "The Last Offering," Vitruvian Gimbo, oil portrait of a Gimbo holding runestones — no crypto knowledge required.</p>
                </div>
                <div className="card">
                  <h3>OG x Ape Church</h3>
                  <p style={{marginTop: 8}}>Gimbos-themed Saturday event. Gimbo holders get priority queue or special game mode. Cross-pollinates OG's Otherside audience into Ape Church funnel.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div>
            <div className="section">
              <div className="section-title">Launch Timeline</div>
              <div className="card">
                {CALENDAR_EVENTS.map((ev, i) => (
                  <div key={i} className={`cal-row ${ev.label === '🎯 MINT' ? 'mint' : ''}`}>
                    <div className="cal-date">
                      {ev.date}
                      <span className="cal-label">{ev.label}</span>
                    </div>
                    <div className="cal-items">
                      {ev.items.map((item, j) => (
                        <div key={j} className="cal-item">→ {item}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'todos' && (
          <div>
            <div className="section">
              <div className="section-title">Task List — {done}/{total} done</div>
              <div className="progress" style={{marginBottom: 16}}>
                <div className="progress-bar" style={{width: `${total ? Math.round(done/total*100) : 0}%`}} />
              </div>

              <div className="filter-row">
                {cats.map(c => (
                  <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
                    {c}
                  </button>
                ))}
              </div>

              <div className="card">
                {filtered.map(todo => (
                  <div key={todo.id} className="todo-item">
                    <div className={`todo-cb ${todo.done ? 'checked' : ''}`} onClick={() => toggleTodo(todo.id)}>
                      {todo.done && <span style={{color: '#fff', fontSize: 11}}>✓</span>}
                    </div>
                    <div style={{flex: 1}}>
                      <div className={`todo-text ${todo.done ? 'done' : ''}`}>{todo.text}</div>
                      <div style={{marginTop: 4}}>
                        <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>
                        <span className="badge badge-cat">{todo.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-row">
                <input
                  placeholder="Add a task..."
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTodo()}
                />
                <button className="btn" onClick={addTodo}>Add</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div>
            <div className="section">
              <div className="section-title">Chat with Cello</div>
              <div className="notice" style={{marginBottom: 12}}>
                Messages are sent to Cello's workspace. Responses appear here within a few minutes (next heartbeat check). Keep the context about Gimbos, Ape Church, or campaign decisions.
              </div>
              <div className="chat-window">
                {chatMessages.length === 0 && (
                  <div style={{color: '#444', fontSize: 13, textAlign: 'center', marginTop: 40}}>
                    No messages yet. Ask Cello anything about the Gimbos campaign.
                  </div>
                )}
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`chat-msg ${msg.role}`}>
                    <div className="who">{msg.role === 'user' ? '🐝 Honey B' : '🎻 Cello'}</div>
                    <div className="body">{msg.content}</div>
                    <div className="ts">{new Date(msg.timestamp).toLocaleString()}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-row">
                <input
                  placeholder="Ask Cello about the Gimbos campaign..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                />
                <button className="btn" onClick={sendChat} disabled={chatLoading}>
                  {chatLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
