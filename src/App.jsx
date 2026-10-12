import { useEffect, useState, useCallback, useRef } from 'react'
import './App.css'

// ✏️ EDIT YOUR DETAILS HERE
const NAME = 'Raveendranath D'
const ROLE = '3D Artist · Visual Creator'
const SLIDE_MS = 3000 // About background: time per image (1000 = 1 second)
const SKILLS = [
  { name: 'Blender', level: 92 },
  { name: '3D Modelling', level: 90 },
  { name: 'Realistic Rendering', level: 85 },
  { name: 'Lighting & Atmosphere', level: 82 },
  { name: 'Texturing / Shading', level: 80 },
  { name: 'Compositing', level: 70 },
]
// `folder` must match the folder name inside src/assets/projects/
const PROJECTS = [
  { title: 'Render One', folder: 'render-one', desc: 'A cinematic scene built around light, form and atmosphere.', tags: ['Blender', 'Cycles'] },
  { title: 'Render Two', folder: 'render-two', desc: 'A realistic product visual with detailed materials.', tags: ['Modelling', 'Shading'] },
  { title: 'Render Three', folder: 'render-three', desc: 'An environment study with volumetric lighting.', tags: ['Environment', 'Eevee'] },
]
const LINKS = { email: 'mailto:raveendranathdurai@gmail.com', linkedin: 'https://www.linkedin.com/in/raveendranath-durai-0a691a390/', artstation: 'https://www.artstation.com/raveendranathd' }

// 🖼️ AUTO-LOAD IMAGES
const projectFiles = import.meta.glob(
  './assets/projects/*/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}',
  { eager: true, import: 'default' }
)
const heroFiles = import.meta.glob(
  './assets/hero.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}',
  { eager: true, import: 'default' }
)
const HERO_BG = Object.values(heroFiles)[0]

// Profile photos: src/assets/profile/
// A file with "zaun" in its name (e.g. zaun.jpg) is used for the Zaun theme.
const profileFiles = import.meta.glob(
  './assets/profile/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}',
  { eager: true, import: 'default' }
)
const profileList = Object.entries(profileFiles).sort(([a], [b]) => a.localeCompare(b))
const isZaunFile = ([path]) => path.toLowerCase().includes('zaun')
const PROFILE_ZAUN = profileList.find(isZaunFile)?.[1]
const PROFILE =
  (profileList.find(([path]) => path.toLowerCase().includes('piltover')) ||
    profileList.find((entry) => !isZaunFile(entry)))?.[1]

// About slideshow: every image inside src/assets/about/
const aboutFolderFiles = import.meta.glob(
  './assets/about/*.{png,jpg,jpeg,webp,gif,PNG,JPG,JPEG,WEBP,GIF}',
  { eager: true, import: 'default' }
)
// fallback: a single src/assets/about.png / .jpg ...
const aboutSingleFiles = import.meta.glob(
  './assets/about.{png,jpg,jpeg,webp,gif,PNG,JPG,JPEG,WEBP,GIF}',
  { eager: true, import: 'default' }
)
const folderList = Object.entries(aboutFolderFiles)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)
const ABOUT_SLIDES = folderList.length ? folderList : Object.values(aboutSingleFiles)

const IMAGES = {}
Object.entries(projectFiles)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .forEach(([path, src]) => {
    const folder = path.split('/')[3]
    ;(IMAGES[folder] ||= []).push(src)
  })

// image that fades in when it scrolls into view
function FadeImg({ src, alt, onClick }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (el.complete) setLoaded(true)
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onClick={onClick}
      className={`fade-img ${seen && loaded ? 'in' : ''}`}
    />
  )
}

// hexagon rings; your photo sits inside when `photo` is given
function HexRing({ photo, tint }) {
  const hex = (r) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6
      return `${200 + r * Math.cos(a)},${200 + r * Math.sin(a)}`
    }).join(' ')
  return (
    <div className="hex-frame">
      <svg viewBox="0 0 400 400" fill="none" stroke="currentColor">
        <g stroke="var(--accent)" strokeWidth="1.5">
          <g className="ring1">
            <circle cx="200" cy="200" r="185" strokeDasharray="4 10" />
            <polygon points={hex(160)} />
          </g>
          <g className="ring2">
            <polygon points={hex(photo ? 146 : 120)} strokeDasharray="20 8" />
            {!photo && <circle cx="200" cy="200" r="95" />}
          </g>
        </g>
        {photo ? (
          <polygon points={hex(131)} stroke="var(--glow)" strokeWidth="3" />
        ) : (
          <g className="core">
            <polygon points={hex(55)} stroke="var(--glow)" strokeWidth="3" fill="var(--glow)" fillOpacity="0.25" />
            <circle cx="200" cy="200" r="14" fill="var(--glow)" stroke="none" />
          </g>
        )}
      </svg>
      {photo && <img className={`portrait ${tint ? 'tint' : ''}`} src={photo} alt={NAME} />}
    </div>
  )
}

// About background slideshow (own component so only this part re-renders every few seconds)
function AboutSlideshow() {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (ABOUT_SLIDES.length < 2) return
    const id = setInterval(() => {
      setSlide((i) => (i + 1) % ABOUT_SLIDES.length)
    }, SLIDE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="about-bg" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {ABOUT_SLIDES.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: 'brightness(0.7) saturate(1.15)',
            opacity: i === slide ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
          }}
        />
      ))}
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState('piltover')
  const [glitching, setGlitching] = useState(false)
  const [project, setProject] = useState(null)
  const [shot, setShot] = useState(null)

  const heroBgRef = useRef(null)
  const closeRef = useRef(null)
  const lastFocus = useRef(null)
  const touchX = useRef(null)

  const imgs = project ? IMAGES[project.folder] || [] : []

  const toggleTheme = () => {
    if (glitching) return // ignore clicks while the glitch is playing
    setGlitching(true)
    setTimeout(() => setTheme((t) => (t === 'piltover' ? 'zaun' : 'piltover')), 200)
    setTimeout(() => setGlitching(false), 900)
  }

  // scroll reveal for sections
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.15 }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // hero background blurs as the page scrolls
  useEffect(() => {
    let ticking = false
    let last = -1
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const v = Math.round(Math.min(window.scrollY / 50, 12))
        if (v !== last && heroBgRef.current) {
          heroBgRef.current.style.setProperty('--sb', v)
          last = v
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const next = useCallback(() => setShot((i) => (i + 1) % imgs.length), [imgs.length])
  const prev = useCallback(() => setShot((i) => (i - 1 + imgs.length) % imgs.length), [imgs.length])

  const openProject = (p) => {
    lastFocus.current = document.activeElement
    setProject(p)
  }
  const closeAll = useCallback(() => {
    setShot(null)
    setProject(null)
    if (lastFocus.current && lastFocus.current.focus) lastFocus.current.focus()
  }, [])

  // lock page scroll while the viewer is open
  useEffect(() => {
    if (!project) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [project])

  // move keyboard focus into the viewer when it opens
  useEffect(() => {
    if (project && closeRef.current) closeRef.current.focus()
  }, [project])

  // keyboard: Esc closes, arrows change image
  useEffect(() => {
    if (!project) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (shot !== null) setShot(null)
        else closeAll()
      } else if (shot !== null && e.key === 'ArrowRight') {
        next()
      } else if (shot !== null && e.key === 'ArrowLeft') {
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, shot, next, prev, closeAll])

  // swipe left/right in the fullscreen viewer
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) < 50 || imgs.length < 2) return
    if (dx < 0) next()
    else prev()
  }

  return (
    <div className={`app ${glitching ? 'glitching' : ''} ${project ? 'viewing' : ''}`} data-theme={theme}>
      <nav className="nav">
        <div className="logo">{NAME.split(' ')[0].toUpperCase()}</div>
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Mastery</a></li>
          <li><a href="#projects">Samples</a></li>
          <li><a href="#contact">Contact</a></li>
          <li>
            <button className="toggle" onClick={toggleTheme}>
              {theme === 'piltover' ? 'Enter Zaun' : 'Return to Piltover'}
            </button>
          </li>
        </ul>
      </nav>

      <header className="hero-wrap">
        {HERO_BG && <div ref={heroBgRef} className="hero-bg" style={{ backgroundImage: `url(${HERO_BG})` }} />}
        <div className="hero-fade" />
        <section className="hero">
          <div>
            <div className="eyebrow">{ROLE}</div>
            <h1 className="glitch" data-text={NAME}>{NAME}</h1>
            <p>3D modelling, realistic rendering and cinematic visual experiences crafted through light, form and atmosphere.</p>
            <a href="#projects" className="btn fill">Explore My Work</a>
            <a href="#contact" className="btn">Contact</a>
          </div>
          <div className="hex-wrap">
            <HexRing photo={theme === 'zaun' && PROFILE_ZAUN ? PROFILE_ZAUN : PROFILE} tint={!PROFILE_ZAUN} />
          </div>
        </section>
      </header>

      {/* ABOUT (slideshow background) */}
      <div className="about-wrap">
        <AboutSlideshow />
        <div className="about-shade" />
        <section id="about" className="reveal">
          <h2 className="title">About</h2>
          <div className="about-box">
            I'm a 3D artist based in India, focused on 3D visuals and cinematic renders in Blender.
            I love building worlds where light and atmosphere tell the story.
          </div>
        </section>
      </div>

      <section id="skills" className="reveal">
        <h2 className="title">Mastery</h2>
        <div className="skills">
          {SKILLS.map((s) => (
            <div className="skill" key={s.name}>
              <span>{s.name}<em>{s.level}%</em></span>
              <div className="bar"><i style={{ '--lvl': s.level + '%' }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section id="projects" className="reveal">
        <h2 className="title">Samples</h2>
        <div className="projects">
          {PROJECTS.map((p) => {
            const list = IMAGES[p.folder] || []
            return (
              <div className="card" key={p.title}>
                {list[0] && (
                  <div className="card-cover" onClick={() => openProject(p)}>
                    <img src={list[0]} alt={p.title} loading="lazy" decoding="async" />
                    <span className="count">{list.length} render{list.length === 1 ? '' : 's'}</span>
                  </div>
                )}
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
                <button className="view-btn" onClick={() => openProject(p)}>View Project →</button>
              </div>
            )
          })}
        </div>
      </section>

      <section id="contact" className="contact reveal">
        <h2 className="title">Send a Message</h2>
        <p>Have a project in mind or just want to talk? My door is always open.</p>
        <a className="btn fill" href={LINKS.email}>Email Me</a>
        <a className="btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a className="btn" href={LINKS.artstation} target="_blank" rel="noreferrer">ArtStation</a>
      </section>

      <footer>© {new Date().getFullYear()} {NAME}. Forged in the undercity.</footer>

      {/* PROJECT VIEWER */}
      {project && (
        <div
          className="pv"
          onClick={closeAll}
          onScroll={(e) => {
            const el = e.currentTarget
            const v = Math.round(Math.min(el.scrollTop / 60, 10))
            if (el.dataset.b !== String(v)) {
              el.dataset.b = String(v)
              el.style.setProperty('--pvb', v + 'px')
            }
          }}
        >
          <div
            className="pv-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeRef} className="pv-close" onClick={closeAll} aria-label="Close">✕</button>
            <h2 id="pv-title" className="pv-title">{project.title}</h2>
            <p className="pv-desc">{project.desc}</p>
            <div className="tags">{project.tags.map((t) => <span key={t}>{t}</span>)}</div>

            {imgs.length === 0 ? (
              import.meta.env.DEV ? (
                <div className="empty">
                  <p>No renders found yet.</p>
                  <p>Add images to <code>src/assets/projects/{project.folder}/</code> and restart <code>npm run dev</code>.</p>
                </div>
              ) : (
                <div className="empty">
                  <p>Renders for this project are coming soon.</p>
                </div>
              )
            ) : (
              <div className="pv-grid">
                {imgs.map((src, i) => (
                  <FadeImg key={`${src}-${i}`} src={src} alt={`${project.title} ${i + 1}`} onClick={() => setShot(i)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE */}
      {project && shot !== null && imgs[shot] && (
        <div
          className="pv-full"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} image ${shot + 1} of ${imgs.length}`}
          onClick={() => setShot(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button className="pv-nav pv-x" onClick={() => setShot(null)} aria-label="Close image">✕</button>
          {imgs.length > 1 && (
            <button className="pv-nav pv-l" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); prev() }}>‹</button>
          )}
          <img key={shot} src={imgs[shot]} alt={`${project.title} ${shot + 1}`} onClick={(e) => e.stopPropagation()} />
          {imgs.length > 1 && (
            <button className="pv-nav pv-r" aria-label="Next image" onClick={(e) => { e.stopPropagation(); next() }}>›</button>
          )}
          <div className="pv-count">{project.title} · {shot + 1} / {imgs.length}</div>
        </div>
      )}
    </div>
  )
}