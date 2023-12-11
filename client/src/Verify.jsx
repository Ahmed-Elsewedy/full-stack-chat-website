import { useContext, useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { UserContext } from "./UserContext"
import axios from "axios"
import { setToken } from "./utils/authentication"


export default function Verify() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const [fullname, setFullname] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const { setUser, setId } = useContext(UserContext)
    const navigate = useNavigate();



    useEffect(() => {
        if (!token) navigate('/')

        axios.get('user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(({ data: { data: { user, token } } }) => {
            console.log(user)
            if (user?.username) {
                setUser(user.username)
                setId(user._id)
                setToken(token)
                navigate('/')
            }
            setEmail(user.email)
            setFullname(user.fullname)

        }).catch(error => {
            console.log(error.message);
        })
    }, [token])

    function update(ev) {
        ev.preventDefault()


        axios.patch('/user/update', { fullname, username }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(({ data: { data: { user, token } } }) => {
            setToken(token)
            setId(user._id)
            setUser(user.username)
            navigate('/')
        }).catch(err => {
            setError(err.response.data.message)
            // setError('username already exist')
        })

    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <div className="w-64 sm:w-96 mx-auto mb-12 flex-col">
                <form className="pt-2" onSubmit={update}>
                    <p className="text-xl text-center rounded-md mb-2 border p-2 bg-gray-200">complete your info</p>
                    <input readOnly value={email} type="email" className="block w-full rounded-md p-2 mb-2 border" placeholder="email" />
                    <input value={fullname} onChange={ev => setFullname(ev.target.value)} type="text" className="block w-full rounded-md p-2 mb-2 border" placeholder="full name" />
                    <input value={username} onChange={ev => setUsername(ev.target.value)} type="text" className="block w-full rounded-md p-2 mb-2 border" placeholder="@username" />
                    {error && <p className="text-red-500 text-center bg-red-100 block w-full rounded-md p-2 mb-2 border">{error}</p>}
                    <button className="bg-blue-500 text-white w-full rounded-md p-2">Send</button>
                </form>
            </div>
        </div>
    )
}