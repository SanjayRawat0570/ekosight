import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function submit(e){
    e.preventDefault();
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.token){
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/');
    } else {
      alert('Login failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <div><button type="submit">Login</button></div>
      </form>
    </div>
  )
}
