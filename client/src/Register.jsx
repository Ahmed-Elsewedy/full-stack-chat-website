import { useContext, useState } from "react"
import axios from 'axios'
import { UserContext } from "./UserContext"
import { setToken } from './utils/authentication'
import Google from "./Google"


export default function Register({ setStatus }) {
    const [fullname, setFullname] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const { setUser, setId } = useContext(UserContext)


    function register(ev) {
        ev.preventDefault()

        console.log(username, fullname, email, password, confirmPassword)

        if (!(username && email && fullname && password && confirmPassword))
            return setError('all fields are required')
        if (password != confirmPassword)
            return setError('not same password')

        axios
            .post('/user/register', { fullname, email, username, password })
            .then(res => {
                setUser(username)
                setId(res.data.data.user._id)
                setToken(res.data.data.token)
            })
            .catch(err => {
                setError(err.response.data.message)
            })
    }
    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <div className="w-64 sm:w-96 mx-auto mb-12 flex-col divide-y-2">
                <Google />
                <form className="pt-2" onSubmit={register}>
                    <input value={fullname} onChange={ev => setFullname(ev.target.value)} type="text" className="block w-full rounded-md p-2 mb-2 border" placeholder="full name" />
                    <input value={email} onChange={ev => setEmail(ev.target.value)} type="email" className="block w-full rounded-md p-2 mb-2 border" placeholder="email" />
                    <input value={username} onChange={ev => setUsername(ev.target.value)} type="text" className="block w-full rounded-md p-2 mb-2 border" placeholder="@username" />
                    <input value={password} onChange={ev => setPassword(ev.target.value)} type="password" className="block w-full rounded-md p-2 mb-2 border" placeholder="password" suggested="new-password" />
                    <input value={confirmPassword} onChange={ev => setConfirmPassword(ev.target.value)} type="password" className={`block w-full rounded-md p-2 mb-2 border  ${password === confirmPassword ? '' : 'confirmPassword border-relative'}`} placeholder="confirm password" />
                    {error && <p className="text-red-500 bg-red-100 block w-full rounded-md p-2 mb-2 border">{error}</p>}
                    <button className="bg-blue-500 text-white w-full rounded-md p-2">Register</button>
                    <div className="text-center mb-2">Already a member? <span className="cursor-pointer text-gray-500" onClick={ev => setStatus('login')}>Login here</span> </div>
                </form>
            </div>
        </div>
    )
}