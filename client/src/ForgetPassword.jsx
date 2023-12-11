import { useState } from "react"
import axios from "axios"
import { Link } from 'react-router-dom'

export default function ForgetPassword() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    async function forgetPassword(ev) {
        ev.preventDefault()

        try {
            const res = await axios.post('/user/forgetPassword', { email });
            setMessage('Check your email to change password')
            setEmail('')
            setError('')
        } catch (err) {
            setMessage('')
            setError(err.response.data.message)
        }
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <div className="w-64 sm:w-96 mx-auto mb-12 flex-col">

                <div className="text-center flex flex-row gap-4"> <Link to={'/'}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>Enter Your Email to get forget password mail</div>
                <form onSubmit={forgetPassword} className="pt-2 mt-3">
                    <input value={email} onChange={ev => setEmail(ev.target.value)} type="email" className="block w-full rounded-md p-2 mb-2 border" placeholder="your email" />
                    {error && <p className="text-red-500 bg-red-100 text-center block w-full rounded-md p-2 mb-2 border border-red-300">{error}</p>}
                    {message && <p className="text-green-500 text-center bg-green-100 block w-full rounded-md p-2 mb-2 border border-green-300">{message}</p>}
                    <button className="bg-blue-500 text-white w-full rounded-md p-2 mb-2">Send Email</button>
                </form>
            </div>
        </div>
    )
}

