import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '../utils/api'

export default function Home(){
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState('');
  const [user, setUser] = useState(null);

  useEffect(()=>{ fetchBoards(); const u = localStorage.getItem('user'); if(u) setUser(JSON.parse(u)); },[]);

  async function fetchBoards(){
    const res = await api.get(`/api/boards`);
    setBoards(res.data);
  }

  async function createBoard(){
    if(!title) return;
    await api.post(`/api/boards`, { title });
    setTitle('');
    fetchBoards();
  }

  function logout(){ localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Mini Trello Clone</h1>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 8 }}>Hi {user.name || user.email}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login"><a style={{ marginRight: 8 }}>Login</a></Link>
              <Link href="/register"><a>Register</a></Link>
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Board title" />
        <button onClick={createBoard} style={{ marginLeft: 8 }}>Create</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {boards.map(b => (
          <BoardCard key={b._id} board={b} onUpdated={fetchBoards} />
        ))}
      </div>
    </div>
  )
}

function BoardCard({ board }){
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <h3>{board.title}</h3>
      <div style={{ fontSize: 13, color: '#666' }}>Lists: {board.lists?.length || 0} • Cards: {board.cards?.length || 0}</div>
      <div style={{ marginTop: 8 }}>
        <Link href={`/board/${board._id}`}><a>Open Board</a></Link>
      </div>
    </div>
  )
}
