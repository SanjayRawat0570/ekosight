import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from '../../utils/api'

export default function BoardPage(){
  const router = useRouter();
  const { id } = router.query;
  const [board, setBoard] = useState(null);
  const [recs, setRecs] = useState(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [newList, setNewList] = useState('');
  const [newCardTitles, setNewCardTitles] = useState({});
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(()=>{ if(id) fetchBoard(); },[id]);

  async function fetchBoard(){
    if (!id) return;
    try{
      const res = await api.get(`/api/boards/${id}`);
      setBoard(res.data);
    } catch (err){
      console.error('Fetch board error', err?.response || err.message || err);
      // handle unauthorized
      if (err?.response?.status === 401){
        if (confirm('You must be logged in to view this board. Go to login page?')) window.location.href = '/login';
        return;
      }
      alert('Failed to load board: ' + (err?.response?.data?.error || err.message || 'Unknown error'));
      setBoard(null);
    }
  }

  async function fetchRecs(){
    if (!id) return;
    setRecsLoading(true);
    try{
      console.log('Fetching recommendations for', id);
      const res = await api.get(`/api/recommendations/${id}`);
      console.log('Recommendations response', res.data);
      setRecs(res.data);
    } catch (err){
      console.error('Fetch recs error', err?.response || err.message || err);
      alert('Failed to fetch recommendations: ' + (err?.response?.data?.error || err.message || 'Unknown'));
      setRecs(null);
    } finally{
      setRecsLoading(false);
    }
  }
  useEffect(()=>{ if(id) fetchRecs(); },[id]);

  async function addList(){
    if(!newList) return;
    await api.post(`/api/boards/${id}/lists`, { title: newList });
    setNewList('');
    fetchBoard();
  }

  async function addCard(listId, listTitle){
    const title = (newCardTitles[listId] || '').trim();
    if(!title) return;
    await api.post(`/api/boards/${id}/cards`, { title, list: listTitle });
    // clear only this list's input
    setNewCardTitles(prev => { const copy = { ...prev }; delete copy[listId]; return copy; });
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

  async function applyMoveSuggestion(cardId, listTitle){
    try{
      // ensure list exists; if not create it
      const exists = (board.lists || []).some(l => l.title === listTitle);
      if (!exists){
        await api.post(`/api/boards/${id}/lists`, { title: listTitle });
        // refresh board lists
        await fetchBoard();
      }
      await api.patch(`/api/boards/${id}/cards/${cardId}`, { list: listTitle });
      await fetchBoard();
      await fetchRecs();
    } catch (err){
      console.error('Apply move error', err?.response || err.message || err);
      alert('Failed to apply move: ' + (err?.response?.data?.error || err.message || 'Unknown'));
    }
  }

  function ignoreSuggestion(cardId){
    // remove suggestions for this card from current recs state (client-side only)
    if (!recs) return;
    const filtered = (recs.recommendations || []).filter(r => String(r.cardId) !== String(cardId));
    setRecs(prev => ({ ...prev, recommendations: filtered }));
  }

  async function showRecs(){
    // open or refetch recommendations
    await fetchRecs();
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
              <input placeholder="New card title" value={newCardTitles[list._id] || ''} onChange={e=>setNewCardTitles(prev => ({ ...prev, [list._id]: e.target.value }))} />
              <button onClick={()=>addCard(list._id, list.title)} style={{ marginLeft: 6 }}>Add</button>
            </div>
          </div>
        ))}
        {/* Recommendations panel */}
        <div style={{ minWidth: 360, border: '1px solid #f0ad4e', padding: 12, borderRadius: 6, background: '#fff8e6' }}>
          <h3>Recommendations</h3>
          <div style={{ fontSize: 13, color: '#333' }}>Suggestions to help triage cards</div>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {recsLoading && <span>Loading suggestions...</span>}
                {!recsLoading && !recs && <span>No suggestions at the moment.</span>}
                {!recsLoading && recs && recs.recommendations && recs.recommendations.length === 0 && <span>No suggestions at the moment.</span>}
              </div>
              <div>
                <button type="button" onClick={fetchRecs} style={{ marginLeft: 8 }} disabled={recsLoading}>{recsLoading ? 'Refreshing...' : 'Refresh'}</button>
              </div>
            </div>
            {recs && recs.recommendations && recs.recommendations.map(r => (
              <div key={r.cardId} style={{ borderTop: '1px dashed #f0c36d', paddingTop: 8, marginTop: 8 }}>
                <div style={{ fontWeight: 'bold' }}>{r.title || '(untitled)'}</div>
                <div style={{ fontSize: 13, color: '#666' }}>Score: {Math.round((r.score||0)*100)/100}</div>
                {r.suggestedMove && (
                  <div style={{ marginTop: 6 }}>
                    <div>Move suggestion: <strong>“Move to {r.suggestedMove.list}”</strong> — <em>{r.suggestedMove.reason}</em></div>
                    <div style={{ marginTop: 6 }}>
                      <button onClick={()=>applyMoveSuggestion(r.cardId, r.suggestedMove.list)}>Apply move</button>
                      <button onClick={()=>ignoreSuggestion(r.cardId)} style={{ marginLeft: 8 }}>Ignore</button>
                    </div>
                  </div>
                )}
                {r.suggestedDue && (
                  <div style={{ marginTop: 6 }}>
                    <div>Due suggestion: <strong>{new Date(r.suggestedDue.date).toLocaleString()}</strong> — <em>{r.suggestedDue.reason}</em></div>
                    <div style={{ marginTop: 6 }}>
                      <button onClick={async ()=>{ await api.patch(`/api/boards/${id}/cards/${r.cardId}`, { dueDate: r.suggestedDue.date }); fetchBoard(); fetchRecs(); }}>Apply due date</button>
                      <button onClick={()=>ignoreSuggestion(r.cardId)} style={{ marginLeft: 8 }}>Ignore</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {recs && recs.related && recs.related.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <h4>Related cards</h4>
                {recs.related.map((g,i)=> (
                  <div key={i} style={{ padding: 6, borderTop: '1px solid #f5e6c8' }}>
                    <div>Cards: {g.titles ? g.titles.join(' • ') : g.cards.join(', ')}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Common tokens: {g.commonTokens.join(', ') || '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
