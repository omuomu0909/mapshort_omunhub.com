import { useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Search, LocateFixed, SlidersHorizontal, Play, Star, MapPin, Clock3, ArrowUpRight, Utensils, ChevronDown, X, Menu, Sparkles } from 'lucide-react'
import { restaurants } from './data'
import type { Restaurant } from './types'

const center: [number, number] = [35.6638, 139.6967]
const icon = (color: string) => L.divIcon({ className:'pin-wrap', html:`<div class="pin" style="background:${color}"><span></span></div>`, iconSize:[34,42], iconAnchor:[17,40] })
function Recenter({ position }: { position:[number,number] }) { const map=useMap(); return <button className="locate" onClick={()=>map.setView(position,15)} aria-label="現在地へ"><LocateFixed size={18}/></button> }

function App() {
  const [active, setActive] = useState<Restaurant | null>(null)
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('すべて')
  const [searched, setSearched] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const genres = ['すべて','寿司','焼肉','ラーメン','カフェ','居酒屋・創作料理']
  const filtered = restaurants.filter(r=>(genre==='すべて'||r.genre.includes(genre)) && (!query||r.name.includes(query)||r.genre.includes(query)))
  const search = () => { setSearched(true); if (filtered[0]) setActive(filtered[0]) }
  return <div className="app">
    <header><div className="brand"><div className="brand-mark"><Utensils size={20}/></div><div><b>omunhub</b><small>食のショート動画マップ</small></div></div><nav><a className="active">探す</a><a>保存したお店</a><a>使い方</a></nav><button className="mobile-menu" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><div className="header-actions"><button className="icon-btn"><Sparkles size={17}/> おすすめ</button><button className="avatar">T</button></div></header>
    {mobileMenu&&<div className="mobile-nav"><a className="active">探す</a><a>保存したお店</a><a>使い方</a></div>}
    <main><section className="hero"><div><p className="eyebrow"><span/>TODAY'S FOOD DISCOVERY</p><h1>気になる街の、<br/><em>おいしい瞬間</em>を探そう。</h1><p className="lead">マップでエリアを選んで、リアルな食のショート動画から<br className="desktop"/>次に行きたいお店を見つけよう。</p></div><div className="search-area"><div className="search-box"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="店名・ジャンルで検索"/><button onClick={search}>検索</button></div><div className="filters">{genres.map(g=><button key={g} className={genre===g?'selected':''} onClick={()=>setGenre(g)}>{g}</button>)}<button className="filter-btn"><SlidersHorizontal size={15}/> 絞り込み</button></div></div></section>
      <section className="workspace"><div className="map-panel"><MapContainer center={center} zoom={15} zoomControl={false} scrollWheelZoom={true}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><Circle center={center} radius={780} pathOptions={{color:'#c8704b',fillColor:'#c8704b',fillOpacity:.07,weight:1.5,dashArray:'5 7'}}/>{restaurants.map(r=><Marker key={r.id} position={[r.lat,r.lng]} icon={icon(r.color)} eventHandlers={{click:()=>setActive(r)}}><Popup><b>{r.name}</b><br/>{r.genre}</Popup></Marker>)}<Recenter position={center}/></MapContainer><div className="map-label"><MapPin size={16}/> 渋谷駅周辺 <span>半径 800m</span></div><button className="map-search" onClick={search}><Search size={17}/> このエリアで探す</button></div>
        <aside className="results"><div className="results-head"><div><span className="count">{filtered.length}件</span><h2>{searched?'このエリアのおすすめ':'渋谷駅周辺のおすすめ'}</h2></div><button className="sort">おすすめ順 <ChevronDown size={15}/></button></div><p className="result-note">YouTube Shortsで話題のお店をピックアップ</p><div className="cards">{filtered.length===0?<div className="empty">条件に一致するお店がありません。<br/>検索条件を変えてみてください。</div>:filtered.map(r=><RestaurantCard key={r.id} restaurant={r} active={active?.id===r.id} onClick={()=>setActive(r)}/>)}</div></aside>
      </section>
    </main>
    {active&&<div className="detail-overlay" onClick={()=>setActive(null)}><div className="detail" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setActive(null)}><X/></button><img src={active.video.thumbnail}/><div className="detail-body"><span className="tag">{active.genre}</span><h2>{active.name}</h2><div className="rating"><Star size={16} fill="currentColor"/> {active.rating} <small>({active.reviews}件)</small><span>{active.price}</span></div><p><MapPin size={15}/> {active.address}</p><a className="youtube" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(active.name+' '+active.genre+' shorts')}`} target="_blank" rel="noreferrer"><Play size={17} fill="currentColor"/> Shorts動画をYouTubeで見る <ArrowUpRight size={15}/></a></div></div></div>}
    <footer><span>© 2025 omunhub</span><span>動画情報はYouTubeより取得しています</span></footer>
  </div>
}
function RestaurantCard({restaurant:r,active,onClick}:{restaurant:Restaurant;active:boolean;onClick:()=>void}) { return <article className={`card ${active?'active':''}`} onClick={onClick}><div className="thumb"><img src={r.video.thumbnail}/><span className="play"><Play size={14} fill="white"/></span><span className="shorts">SHORTS</span></div><div className="card-info"><div className="card-title"><h3>{r.name}</h3><button onClick={e=>e.stopPropagation()} aria-label="保存">♡</button></div><p className="genre">{r.genre} <i>·</i> {r.price}</p><div className="meta"><span className="rating"><Star size={14} fill="currentColor"/> {r.rating} <small>({r.reviews})</small></span><span><MapPin size={13}/>{r.distance}</span></div><div className="video-title"><Clock3 size={13}/> {r.video.title}</div><p className="channel">{r.video.channel}　·　{r.video.views}回視聴　·　{r.video.age}</p></div></article> }
export default App