import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from '../../utils/api'

export default function BoardPage(){
  const router = useRouter();
  const { id } = router.query;
  const [board, setBoard] = useState(null);
  const [newList, setNewList] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(()=>{ if(id) fetchBoard(); },[id]);

  async function fetchBoard(){
    const res = await api.get(`/api/boards/${id}`);
    setBoard(res.data);
  }

  async function addList(){
    if(!newList) return;
    await api.post(`/api/boards/${id}/lists`, { title: newList });
    setNewList('');
    fetchBoard();
  }

  async function addCard(listTitle){
    if(!newCardTitle) return;
    await api.post(`/api/boards/${id}/cards`, { title: newCardTitle, list: listTitle });
    setNewCardTitle('');
    fetchBoard();
  }

  async function moveCard(cardId, newList){
    await api.patch(`/api/boards/${id}/cards/${cardId}`, { list: newList });
    fetchBoard();
  }

  async function invite(){
    if(!inviteEmail) return;
    await api.post(`/api/boards/${id}/invite`, { email: inviteEmail });
    setInviteEmail('');
    fetchBoard();
  }

  async function showRecs(){
    const res = await api.get(`/api/recommendations/${id}`);
    alert(JSON.stringify(res.data, null, 2));
  }

  if (!board) return <div style={{ padding: 20 }}>Loading...</div>

  const lists = board.lists || [];

  return (
    <div style={{ padding: 20 }}>
      <h2>{board.title}</h2>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="New list title" value={newList} onChange={e=>setNewList(e.target.value)} />
        <button onClick={addList} style={{ marginLeft: 8 }}>Add list</button>
        <button onClick={showRecs} style={{ marginLeft: 8 }}>Recommendations</button>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {lists.map(list => (
          <div key={list._id} style={{ minWidth: 260, border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
            <h4>{list.title}</h4>
            <div>
              {(board.cards||[]).filter(c=>c.list===list.title).map(c=> (
                <div key={c._id} style={{ padding: 6, marginBottom: 6, background: '#fafafa', borderRadius: 4 }}>
                  <div style={{ fontWeight: 'bold' }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{c.description}</div>
                  <div style={{ marginTop: 6 }}>
                    <select onChange={e=>moveCard(c._id, e.target.value)} value={c.list}>
                      {lists.map(l=> <option key={l._id} value={l.title}>{l.title}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <input placeholder="New card title" value={newCardTitle} onChange={e=>setNewCardTitle(e.target.value)} />
              <button onClick={()=>addCard(list.title)} style={{ marginLeft: 6 }}>Add</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Invite member</h4>
        <input placeholder="Email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
        <button onClick={invite} style={{ marginLeft: 8 }}>Invite</button>
        <div style={{ marginTop: 8 }}>Members: {board.members?.join(', ')}</div>
      </div>
    </div>
  )
}
