import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'

export default function Register(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  async function submit(e){
    e.preventDefault();
    const res = await api.post('/api/auth/register', { email, password, name });
    if (res.data.token){
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <div><button type="submit">Register</button></div>
      </form>
    </div>
  )
}
