import { useEffect, useRef, useState } from 'react'
import { Search, LocateFixed, SlidersHorizontal, Play, Star, MapPin, Clock3, ArrowUpRight, Utensils, ChevronDown, X, Menu, Sparkles } from 'lucide-react'
import { restaurants } from './data'
import type { Restaurant } from './types'

const defaultCenter = { lat: 35.6638, lng: 139.6967, label: '渋谷駅周辺' }

declare global { interface Window { google?: any } }

function GoogleMap({ center, onMarkerClick }: { center: {lat:number;lng:number}; onMarkerClick: (restaurant: Restaurant) => void }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey || window.google?.maps) { setReady(Boolean(window.google?.maps)); return }
    const existing = document.querySelector('script[data-google-maps]')
    if (existing) { existing.addEventListener('load', () => setReady(true)); return () => existing.removeEventListener('load', () => setReady(true)) }
    const script = document.createElement('script')
    script.dataset.googleMaps = 'true'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [apiKey])

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return
    const position = { lat: center.lat, lng: center.lng }
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, { center: position, zoom: 15, mapTypeControl: false, streetViewControl: false, fullscreenControl: false })
      restaurants.forEach((restaurant) => {
        const marker = new window.google.maps.Marker({ position: { lat: restaurant.lat, lng: restaurant.lng }, map: mapInstance.current, title: restaurant.name })
        marker.addListener('click', () => onMarkerClick(restaurant))
      })
    } else mapInstance.current.setCenter(position)
  }, [ready, center.lat, center.lng, onMarkerClick])

  if (!apiKey) return <iframe className="google-map" title="Google Maps 飲食店マップ" src={`https://www.google.com/maps?q=${center.lat},${center.lng}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
  if (!ready) return <div className="map-fallback"><MapPin size={24}/><b>Google Mapsを読み込み中…</b><span>地図と飲食店マーカーを準備しています。</span></div>
  return <div ref={mapRef} className="google-map" aria-label="Google Maps 飲食店マップ" />
}

function App() {
  const [active, setActive] = useState<Restaurant | null>(null)
  const [playing, setPlaying] = useState<Restaurant | null>(null)
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('すべて')
  const [searched, setSearched] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeNav, setActiveNav] = useState('探す')
  const [showFilters, setShowFilters] = useState(false)
  const [sortOrder, setSortOrder] = useState<'recommended'|'rating'>('recommended')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [location, setLocation] = useState<{lat:number;lng:number} | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const resultsRef = useRef<HTMLElement>(null)
  const genres = ['すべて','寿司','焼肉','ラーメン','カフェ','居酒屋・創作料理']
  const filtered = restaurants.filter(r=>(genre==='すべて'||r.genre.includes(genre)) && (!query||r.name.includes(query)||r.genre.includes(query)))
    .sort((a,b) => sortOrder === 'rating' ? b.rating - a.rating : 0)
  const toggleSaved = (id: string) => setSavedIds(current => {
    const next = new Set(current)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  const navigate = (label: string) => { setActiveNav(label); setMobileMenu(false) }
  const search = () => { setSearched(true); setActive(null); window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0) }
  const locateMe = () => {
    if (!navigator.geolocation) { setLocationStatus('error'); return }
    setLocationStatus('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocation({ lat: coords.latitude, lng: coords.longitude }); setLocationStatus('success') },
      () => setLocationStatus('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }
  const locationMessage = locationStatus === 'loading' ? '現在地を取得中…' : locationStatus === 'success' ? '現在地周辺を表示中' : locationStatus === 'error' ? '位置情報を取得できませんでした。ブラウザの設定を確認してください。' : ''
  const mapCenter = location ?? defaultCenter
  return <div className="app">
    <header><div className="brand"><div className="brand-mark"><Utensils size={20}/></div><div><b>omunhub</b><small>食のショート動画マップ</small></div></div><nav>{['探す','保存したお店','使い方'].map(label=><a key={label} className={activeNav===label?'active':''} onClick={()=>navigate(label)} role="button" tabIndex={0}>{label}</a>)}</nav><button className="mobile-menu" onClick={()=>setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu} aria-label="メニューを開く"><Menu/></button><div className="header-actions"><button className="icon-btn" onClick={()=>{setSortOrder('recommended'); setActiveNav('探す')}}><Sparkles size={17}/> おすすめ</button><button className="avatar" onClick={()=>navigate('保存したお店')} aria-label="保存したお店">T</button></div></header>
    {mobileMenu&&<div className="mobile-nav">{['探す','保存したお店','使い方'].map(label=><a key={label} className={activeNav===label?'active':''} onClick={()=>navigate(label)} role="button" tabIndex={0}>{label}</a>)}</div>}
    <main><section className="hero"><div><p className="eyebrow"><span/>TODAY'S FOOD DISCOVERY</p><h1>気になる街の、<br/><em>おいしい瞬間</em>を探そう。</h1><p className="lead">マップでエリアを選んで、リアルな食のショート動画から<br className="desktop"/>次に行きたいお店を見つけよう。</p></div><div className="search-area"><div className="search-box"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="店名・ジャンルで検索"/><button onClick={search}>検索</button></div><div className="filters">{genres.map(g=><button key={g} className={genre===g?'selected':''} onClick={()=>setGenre(g)}>{g}</button>)}<button className={`filter-btn ${showFilters?'selected':''}`} onClick={()=>setShowFilters(!showFilters)}><SlidersHorizontal size={15}/> 絞り込み</button></div>{showFilters&&<div className="filter-panel">条件を選ぶと一覧に反映されます。ジャンルボタンから絞り込めます。</div>}</div></section>
      <section className="workspace"><div className="map-panel"><GoogleMap center={mapCenter} onMarkerClick={setActive}/><div className="map-label"><MapPin size={16}/> {location ? '現在地周辺' : defaultCenter.label} <span>Google Maps</span></div><button className="locate-me" onClick={locateMe} disabled={locationStatus==='loading'}><LocateFixed size={16}/> {locationStatus==='loading' ? '取得中' : '現在地を表示'}</button>{locationMessage&&<div className={`location-message ${locationStatus==='error'?'error':''}`}>{locationMessage}</div>}<button className="map-search" onClick={search}><Search size={17}/> このエリアで探す</button></div>
         <aside className="results" ref={resultsRef}><div className="results-head"><div><span className="count">{filtered.length}件</span><h2>{searched?'このエリアの飲食店一覧':'渋谷駅周辺の飲食店'}</h2></div><button className="sort" onClick={()=>setSortOrder(sortOrder==='recommended'?'rating':'recommended')}>{sortOrder==='recommended'?'おすすめ順':'評価順'} <ChevronDown size={15}/></button></div><p className="result-note">Google Maps上の店舗をクリックするか、「このエリアで探す」で一覧を表示</p><div className="cards">{filtered.length===0?<div className="empty">条件に一致するお店がありません。<br/>検索条件を変えてみてください。</div>:filtered.map(r=><RestaurantCard key={r.id} restaurant={r} active={active?.id===r.id} saved={savedIds.has(r.id)} onSave={()=>toggleSaved(r.id)} onClick={()=>setActive(r)} onPlay={()=>setPlaying(r)}/>)}</div></aside>
      </section>
    </main>
    {active&&<div className="detail-overlay" onClick={()=>setActive(null)}><div className="detail" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setActive(null)}><X/></button><div className="detail-body"><span className="tag">{active.genre}</span><h2>{active.name}</h2><div className="rating"><Star size={16} fill="currentColor"/> {active.rating} <small>({active.reviews}件)</small><span>{active.price}</span></div><p><MapPin size={15}/> {active.address}</p><button className="youtube" onClick={()=>setPlaying(active)}><Play size={17} fill="currentColor"/> この動画をアプリ内で再生 <ArrowUpRight size={15}/></button></div></div></div>}
    {playing&&<div className="video-overlay" onClick={()=>setPlaying(null)}><div className="video-modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setPlaying(null)}><X/></button><div className="video-frame"><iframe src={`https://www.youtube.com/embed/${playing.video.videoId}?autoplay=1&rel=0`} title={playing.video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/></div><div className="video-caption"><b>{playing.video.title}</b><span>{playing.name} · {playing.video.channel}</span></div></div></div>}
    <footer><span>© 2025 omunhub</span><span>動画情報はYouTubeより取得しています</span></footer>
  </div>
}
function RestaurantCard({restaurant:r,active,saved,onClick,onPlay,onSave}:{restaurant:Restaurant;active:boolean;saved:boolean;onClick:()=>void;onPlay:()=>void;onSave:()=>void}) { return <article className={`card ${active?'active':''}`} onClick={onClick}><div className="thumb" onClick={e=>{e.stopPropagation();onPlay()}}><img src={r.video.thumbnail}/><span className="play"><Play size={14} fill="white"/></span><span className="shorts">SHORTS</span></div><div className="card-info"><div className="card-title"><h3>{r.name}</h3><button onClick={e=>{e.stopPropagation();onSave()}} aria-label="保存" aria-pressed={saved}>{saved?'♥':'♡'}</button></div><p className="genre">{r.genre} <i>·</i> {r.price}</p><div className="meta"><span className="rating"><Star size={14} fill="currentColor"/> {r.rating} <small>({r.reviews})</small></span><span><MapPin size={13}/>{r.distance}</span></div><button className="video-title video-link" onClick={e=>{e.stopPropagation();onPlay()}}><Clock3 size={13}/> {r.video.title}</button><p className="channel">{r.video.channel}　·　{r.video.views}回視聴　·　{r.video.age}</p></div></article> }
export default App