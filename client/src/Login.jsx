import { useContext, useState } from "react"
import axios from 'axios'
import { UserContext } from "./UserContext"
import { setToken } from './utils/authentication'
import Google from "./Google"
import { Link } from 'react-router-dom'

export default function Login({ setStatus }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { setUser, setId } = useContext(UserContext)

    function login(ev) {
        ev.preventDefault()

        if (!username || !password) return setError('all fields are required')


        axios
            .post('/user/login', { username, password })
            .then(res => {
                setUser(res.data.data.user.username)
                setId(res.data.data.user._id)
                setToken(res.data.data.token)
                console.log('done')
            })
            .catch(err => {
                setError(err.response.data.message)
            })


    }
    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <div className="w-64 sm:w-96 mx-auto mb-12 flex-col divide-y-2">
                <Google />
                <form onSubmit={login} className="pt-2">
                    <input value={username} onChange={ev => setUsername(ev.target.value)} type="text" className="block w-full rounded-md p-2 mb-2 border" placeholder="username or email" />
                    <input value={password} onChange={ev => setPassword(ev.target.value)} type="password" className="block w-full rounded-md p-2 mb-2 border" placeholder="password" />
                    {error && <p className="text-red-500 bg-red-100 block w-full rounded-md p-2 mb-2 border border-red-300">{error}</p>}
                    <button className="bg-blue-500 text-white w-full rounded-md p-2 mb">Login</button>
                    <div className="text-center"><Link to={'/forgetPassword'} className="cursor-pointer text-blue-800">Forget Password?</Link> </div>
                    <div className="text-center mb-2">Not have account? <span className="cursor-pointer text-gray-500" onClick={ev => setStatus('register')}>Register here</span> </div>
                </form>
            </div>
        </div>
    )
}