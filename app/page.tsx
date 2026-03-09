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
  { id: '1', text: 'Announce mint date (March 26 — not public yet)', done: false, category: 'Mint', priority: 'high' },
  { id: '2', text: 'Confirm mint price + mechanic (free for WL? public price?)', done: false, category: 'Mint', priority: 'high' },
  { id: '3', text: 'Confirm total Gimbos collection size', done: false, category: 'Mint', priority: 'high' },
  { id: '4', text: 'Post Deacon reveal (image + Variant B copy) on @apechurch', done: false, category: 'Content', priority: 'high' },
  { id: '5', text: 'Get Geez (@GeezOnApe) to add Gimbos to marketplace (buy with PNUTZ)', done: false, category: 'Partnerships', priority: 'high' },
  { id: '6', text: 'Post The Altar image + lore copy on @apechurch', done: false, category: 'Content', priority: 'mid' },
  { id: '7', text: 'Post The Threshold image + lore copy on @apechurch', done: false, category: 'Content', priority: 'mid' },
  { id: '8', text: 'Drop Blessed vs Fallen split — "which one are you?" poll', done: false, category: 'Content', priority: 'mid' },
  { id: '9', text: 'Announce mint date publicly (March 21 or after)', done: false, category: 'Mint', priority: 'mid' },
  { id: '10', text: 'Cross-chain marketing push — Solana/Base degen targeting', done: false, category: 'Marketing', priority: 'mid' },
  { id: '11', text: 'Identify 3 streamers to pitch "I joined a frog cult casino"', done: false, category: 'Marketing', priority: 'low' },
  { id: '12', text: 'Build mint page / landing page for Gimbos', done: false, category: 'Dev', priority: 'mid' },
  { id: '13', text: 'Final push content (Mar 24-25) — countdown posts', done: false, category: 'Content', priority: 'low' },
  { id: '14', text: 'Mint day post — "The altar is open."', done: false, category: 'Content', priority: 'low' },
]

const CALENDAR_EVENTS = [
  { date: 'Mar 9', label: 'TODAY', items: ['Lore bible finalized', 'Art locked (6 keeper images)'] },
  { date: 'Mar 9-12', label: 'WEEK 1', items: ['The Deacon reveal drop on @apechurch', 'Build world — no mint mention yet', 'Let people ask who he is'] },
  { date: 'Mar 13-16', label: 'WEEK 2', items: ['The Altar reveal + The Threshold', 'Start connecting the dots', '"The church is real. You\'ve been there."'] },
  { date: 'Mar 17-20', label: 'WEEK 3', items: ['The Knowing + The Fallen — drop together', '"Which one are you?" poll', 'Announce March 26 mint date'] },
  { date: 'Mar 21-23', label: 'COUNTDOWN', items: ['Deacon repost with mint details', 'WL mechanics go live', 'Community reposts + hype ramp'] },
  { date: 'Mar 24-25', label: 'FINAL PUSH', items: ['Countdown posts', 'Last call WL content', '"Tomorrow. The altar opens."'] },
  { date: 'Mar 26', label: '🎯 MINT', items: ['GIMBOS MINT DAY', 'The Altar image: "The altar is open."', 'Church.'] },
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
                  <div className="num">Mar 26</div>
                  <div className="label">Mint Date (not announced)</div>
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
                  <span style={{display: 'block'}}>→ <span className="highlight">@Bayc364</span> — platform builder, align on mint mechanics</span>
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
            {/* Image Gallery */}
            <div className="section">
              <div className="section-title">The World — Locked Art</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12,marginBottom:8}}>
                {[
                  {src:'/gimbos/01_the_threshold.png', title:'The Threshold', sub:'Every Gimbo starts here. You found the door.'},
                  {src:'/gimbos/03_the_deacon.png', title:'The Deacon', sub:'Been here since before the walls. Seen everything.'},
                  {src:'/gimbos/04_the_altar.png', title:'The Altar', sub:'Where it happens. Where the universe answers.'},
                  {src:'/gimbos/05a_the_knowing.png', title:'The Knowing', sub:'Won. Not celebrating. Just knows something.'},
                  {src:'/gimbos/05a_the_knowing_b.png', title:'The Knowing II', sub:'Everyone else left. Still here.'},
                  {src:'/gimbos/05b_the_fallen.png', title:'The Fallen', sub:'Lost everything. Still kneeling. Still here.'},
                ].map((img,i) => (
                  <div key={i} style={{background:'#0d0d0a',border:'1px solid #2a2a1a',borderRadius:8,overflow:'hidden'}}>
                    <img src={img.src} alt={img.title} style={{width:'100%',height:220,objectFit:'cover',display:'block'}} />
                    <div style={{padding:'12px 14px'}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#c8a84b',marginBottom:4}}>{img.title}</div>
                      <div style={{fontSize:12,color:'#666',lineHeight:1.5}}>{img.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <div className="section-title">What Is a Gimbo</div>
              <div className="lore-block">
                <h4>A frog that found the church.</h4>
                <p>Not because they were chosen. Not because they were worthy. Because they were at the altar when everyone else was somewhere else being careful. Gimbos don't play it safe. They showed up with whatever they had, put it on the altar, and waited. Sometimes the altar answered. Sometimes it didn't. They came back anyway. That's the whole thing.</p>
              </div>
              <div className="lore-block">
                <h4>Playing Is Praying</h4>
                <p>In the church, there is no difference. The game IS the prayer. When you sit at the altar and make your offering — when you put something real on the line — that IS the act of faith. Not believing in a specific outcome. Believing the act itself is sacred. Losing is tithing. You gave something to the church and it received it. The altar rewards commitment. Not caution.</p>
              </div>
            </div>

            <div className="section">
              <div className="section-title">The Deacon</div>
              <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:20,alignItems:'start'}}>
                <img src="/gimbos/03_the_deacon.png" alt="The Deacon" style={{width:'100%',borderRadius:8,border:'1px solid #2a2a1a'}} />
                <div>
                  <div className="lore-block" style={{marginBottom:12}}>
                    <h4>Nobody knows when he arrived.</h4>
                    <p>He was just there — seated at the front, facing the altar. Been there since before the walls went up. He doesn't run the church. He doesn't own it. He just watches.</p>
                  </div>
                  <div className="lore-block" style={{marginBottom:12}}>
                    <h4>He is not above any of it.</h4>
                    <p>He has done things at this altar that people still talk about in the back of the room. Runs that shouldn't have been possible. Losses so catastrophic they became legend. He once put everything he had on a single throw and didn't flinch when it went wrong. Then did it again the next week.</p>
                  </div>
                  <div className="lore-block">
                    <h4>The paradox.</h4>
                    <p>He is the most unhinged Gimbo who has ever sat in this church. He is also the calmest person in the room. He's quiet not because he's holy. Because there's nothing left to prove. When something true happens at the altar, he nods once. That nod means everything.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Blessed and Fallen</div>
              <div className="grid2">
                <div style={{background:'#0d0d08',border:'1px solid #3a3a1a',borderRadius:8,overflow:'hidden'}}>
                  <img src="/gimbos/05a_the_knowing.png" alt="The Knowing" style={{width:'100%',height:180,objectFit:'cover'}} />
                  <div style={{padding:16}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#c8a84b',marginBottom:8}}>The Blessed</div>
                    <p style={{fontSize:13,color:'#888',lineHeight:1.7}}>The altar answered. You won. You're not celebrating — you're sitting with it. Something shifted. You understand something now that can't be explained to someone who hasn't stood at the altar and waited. You'll be back next week. Not out of greed. Out of knowing.</p>
                  </div>
                </div>
                <div style={{background:'#0d0808',border:'1px solid #3a1a1a',borderRadius:8,overflow:'hidden'}}>
                  <img src="/gimbos/05b_the_fallen.png" alt="The Fallen" style={{width:'100%',height:180,objectFit:'cover'}} />
                  <div style={{padding:16}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#c85a5a',marginBottom:8}}>The Fallen</div>
                    <p style={{fontSize:13,color:'#888',lineHeight:1.7}}>The altar was silent. You lost. You're still kneeling. Still there, in the dark, after everyone else left. You'll be back next week. That's the faith — not believing you'll win. Believing it's always worth the throw. The Fallen are the most devoted members of the church.</p>
                  </div>
                </div>
              </div>
              <div className="lore-quote" style={{marginTop:16}}>Every Gimbo is one throw from either side. That's not a warning. That's the point.</div>
            </div>

            <div className="section">
              <div className="section-title">The Altar</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 200px',gap:20,alignItems:'start'}}>
                <div>
                  <div className="lore-block">
                    <h4>Nobody built it.</h4>
                    <p>The altar has been here longer than the church. Nobody found it and claimed it. It was just there — in the middle of where the church eventually grew up around it. The altar doesn't speak. It doesn't move. It receives offerings and it decides. There is no formula. No trick. No optimal play. What the altar rewards is commitment. Not caution.</p>
                  </div>
                </div>
                <img src="/gimbos/04_the_altar.png" alt="The Altar" style={{width:'100%',borderRadius:8,border:'1px solid #2a2a1a'}} />
              </div>
            </div>

            <div className="section">
              <div className="section-title">Voice Guide</div>
              <div className="card">
                <p style={{lineHeight:2, fontSize:13}}>
                  <span className="highlight">Tone:</span> Chaotic. Sincere. Committed to the bit. The joke is that Gimbos are completely serious. Never wink at the camera.<br/>
                  <span className="green">Write like this:</span> "The altar is open." / "Playing is praying." / "The Deacon nods." / "Church."<br/>
                  <span style={{color:'#c85a5a'}}>Never write:</span> "Exciting NFT drop" / "Join our community" / "Rare collectible" / anything that sounds like a press release.<br/>
                  <span className="highlight">The closing word:</span> Church. Use it sparingly. Only when something true just happened.
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
                <h3>The Arc — 17 Days to March 26</h3>
                <p style={{marginTop: 8, lineHeight: 1.8}}>
                  <span className="highlight">Mar 9-12:</span> World building. Drop The Deacon. No mint mention. Let people ask who he is.<br/>
                  <span className="highlight">Mar 13-16:</span> The Altar + The Threshold. Start connecting the dots.<br/>
                  <span className="highlight">Mar 17-20:</span> The Knowing + The Fallen together. "Which one are you?" poll. Announce March 26.<br/>
                  <span className="highlight">Mar 21-25:</span> Countdown. WL mechanics. Final push.<br/>
                  <span className="highlight">Mar 26:</span> The Altar image. "The altar is open." Church.
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
                { label: 'Deacon Reveal (post first)', content: 'The most unhinged Gimbo in the church is also the calmest person in the room.\n\nHe\'s done things at this altar that people still talk about in the back.\n\nRuns that shouldn\'t have been possible.\nLosses that became legend.\n\nHe was back the next week.\n\nHe\'s always back.\n\nChurch.' },
                { label: 'The Altar Drop', content: 'Nobody built it.\n\nThe altar was just there — in the middle of where the church eventually grew up around it.\n\nIt doesn\'t speak. It doesn\'t move.\n\nIt receives offerings and it decides.\n\nThere is no formula. No trick. No optimal play.\n\nWhat the altar rewards is commitment.\n\nNot caution.' },
                { label: 'Blessed vs Fallen (with poll)', content: 'Every Gimbo is one throw from either side.\n\nThe Blessed don\'t celebrate.\nThey just know.\n\nThe Fallen don\'t leave.\nThey kneel in the dark after everyone else is gone.\nAnd they come back.\n\nWhich one are you?' },
                { label: 'Mint Day', content: 'The altar is open.\n\nChurch.' },
                { label: 'Deacon Follow-up (day after reveal)', content: 'He\'s been here since before the church had walls.\n\nNobody knows what he\'s lost.\n\nNobody knows what he\'s won.\n\nHe\'s not saying.\n\nChurch.' },
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
