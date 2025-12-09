import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'

function TodoPage() {
  const { session, fetchTodos, saveAllTodos } = useAuth()
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [view, setView] = useState('list') // 'list' or 'grid'

  useEffect(() => {
    setItems(fetchTodos())
  }, [fetchTodos])

  const persist = (next) => {
    setItems(next)
    saveAllTodos(next)
  }

  const addItem = () => {
    if (!text.trim() || !session?.email) return
    const newItem = {
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      createdAt: Date.now(),
      userEmail: session.email,
      userName: session.name,
    }
    const next = [...items, newItem]
    persist(next)
    setText('')
  }

  const canEdit = (ownerEmail) =>
    session?.role === 'admin' || ownerEmail?.toLowerCase() === session?.email?.toLowerCase()

  const toggle = (id) => {
    const next = items.map((item) => {
      if (item.id !== id) return item
      if (!canEdit(item.userEmail)) return item
      return { ...item, done: !item.done }
    })
    persist(next)
  }

  const remove = (id) => {
    const target = items.find((i) => i.id === id)
    if (!target || !canEdit(target.userEmail)) return
    persist(items.filter((item) => item.id !== id))
  }

  const saveNow = () => saveAllTodos(items)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 lg:py-14">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
            Todos
          </p>
          <h1 className="text-3xl font-semibold text-white">Your tasks</h1>
          <p className="text-sm text-slate-200/80">
            Tasks are stored per user in your browser. Mark them done or remove when finished.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
              placeholder="Add a new todo…"
            />
            <button
              type="button"
              onClick={addItem}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:from-sky-400 hover:to-indigo-400"
            >
              Add
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-200/80">
            <span>View:</span>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-lg px-3 py-2 font-semibold ${
                view === 'list' ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-200'
              }`}
            >
              Column
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-lg px-3 py-2 font-semibold ${
                view === 'grid' ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-200'
              }`}
            >
              Grid
            </button>
          </div>
          <button
            type="button"
            onClick={saveNow}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 ring-1 ring-white/10 transition hover:bg-white/15"
          >
            Save
          </button>
        </div>

        <div className="mt-6">
          {items.length === 0 && (
            <p className="text-sm text-slate-200/70">No tasks yet. Add your first one!</p>
          )}
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-1 gap-3 md:grid-cols-2'
                : 'flex flex-col gap-2'
            }
          >
            {items.map((item) => (
              <TodoCard
                key={item.id}
                item={item}
                toggle={toggle}
                remove={remove}
                canEdit={canEdit(item.userEmail)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TodoCard({ item, toggle, remove, canEdit }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-black/20">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.done}
          onChange={() => canEdit && toggle(item.id)}
          className="h-4 w-4 accent-sky-400"
          disabled={!canEdit}
        />
        <div className="flex flex-col">
          <span className={item.done ? 'line-through text-slate-400' : ''}>{item.text}</span>
          <span className="text-xs text-slate-400">
            By {item.userName || 'Unknown'} • {item.userEmail || '—'}
          </span>
        </div>
      </div>
      {canEdit && (
        <button
          type="button"
          onClick={() => remove(item.id)}
          className="text-xs font-semibold text-rose-200 hover:text-rose-100"
        >
          Remove
        </button>
      )}
    </div>
  )
}

export default TodoPage


