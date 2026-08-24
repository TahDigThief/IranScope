import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import content from './content.json'
import './styles.css'

const formatLabel = (value) => value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const getPostFromHash = (posts) => posts.find((post) => `#/${post.slug}` === window.location.hash)

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState(() => getPostFromHash(content.posts))

  const categories = useMemo(() => [...new Set(content.posts.map((post) => post.category))], [])
  const visiblePosts = useMemo(() => content.posts.filter((post) => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory
    const haystack = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase()
    return matchesCategory && haystack.includes(query.toLowerCase().trim())
  }), [activeCategory, query])

  useEffect(() => {
    const onHashChange = () => setSelectedPost(getPostFromHash(content.posts))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const openPost = (post) => {
    window.location.hash = `/${post.slug}`
    setSelectedPost(post)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closePost = () => {
    window.location.hash = ''
    setSelectedPost(undefined)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" onClick={closePost} aria-label="Iran documented home">
          <span className="brand-mark">IR</span>
          <span><strong>Iran, documented</strong><small>A living archive</small></span>
        </a>
        <nav className="top-nav" aria-label="Primary navigation">
          <a href="#archive" onClick={closePost}>Archive</a>
        </nav>
      </header>

      <main>
        {selectedPost ? <Article post={selectedPost} onBack={closePost} /> : <>
          <section className="hero">
            <p className="eyebrow">A sourced record</p>
            <h1>IranScope.<br /><em>Never forget.</em></h1>
            <p className="hero-copy">A clear, growing archive documenting the islamic republic’s brutality, corruption, and propaganda, alongside the voices and safety of Iranian people.</p>
            <a className="text-link" href="#archive">Explore the archive <span>↓</span></a>
          </section>

          <section className="archive" id="archive">
            <div className="section-heading"><div><p className="eyebrow">The collection</p><h2>Browse the archive</h2></div><span className="count">{visiblePosts.length} {visiblePosts.length === 1 ? 'story' : 'stories'}</span></div>
            <div className="controls">
              <div className="category-tabs" role="tablist" aria-label="Filter by category">
                <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>All</button>
                {categories.map((category) => <button key={category} className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)}>{formatLabel(category)}</button>)}
              </div>
              <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories" aria-label="Search stories" /></label>
            </div>
            {visiblePosts.length ? <div className="post-grid">{visiblePosts.map((post, index) => <PostCard key={post.id} post={post} index={index} onOpen={openPost} />)}</div> : <p className="empty">No stories match that search.</p>}
          </section>
        </>}
      </main>

      <footer><span>Iran, documented</span><span>Built from the Markdown archive · {new Date().getFullYear()}</span></footer>
    </div>
  )
}

function PostCard({ post, index, onOpen }) {
  return <article className="post-card" style={{ '--delay': `${index * 35}ms` }}><div className="card-meta"><span>{formatLabel(post.category)}</span><span>{String(index + 1).padStart(2, '0')}</span></div><h3>{post.title}</h3><p>{post.excerpt}</p><button className="read-more" onClick={() => onOpen(post)}>Read story <span>→</span></button></article>
}

function Article({ post, onBack }) {
  const bodyMarkdown = post.markdown.replace(/^#\s+.*(?:\r?\n|$)/, '')
  const html = DOMPurify.sanitize(marked.parse(bodyMarkdown, { breaks: true }))
  return <article className="article-page"><button className="back-link" onClick={onBack}>← Back to archive</button><p className="eyebrow">{formatLabel(post.category)}</p><h1>{post.title}</h1><div className="article-body" dangerouslySetInnerHTML={{ __html: html }} /></article>
}

createRoot(document.getElementById('root')).render(<App />)


