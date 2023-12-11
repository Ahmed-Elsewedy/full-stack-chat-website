import { useState } from "react"
import axios from "axios"
import { Link, useParams } from "react-router-dom"


export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const { token } = useParams()
    async function resetPassword(ev) {
        ev.preventDefault()

        if (password !== confirmPassword) return setError('Password not matched')

        try {
            const res = await axios.patch('/user/resetPassword/' + token, { password });
            setMessage('Password changed successfully')
            setPassword('')
            setConfirmPassword('')
            setError('')


        } catch (err) {
            setMessage('')
            setError(err.response.data.message)
        }
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <div className="w-64 sm:w-96 mx-auto mb-12 flex-col">
                <div className="text-center">Enter Your Email to get forget password mail</div>
                <form onSubmit={resetPassword} className="pt-2 mt-3">
                    <input value={password} onChange={ev => setPassword(ev.target.value)} type="password" className="block w-full rounded-md p-2 mb-2 border" placeholder="password" suggested="new-password" />
                    <input value={confirmPassword} onChange={ev => setConfirmPassword(ev.target.value)} type="password" className={`block w-full rounded-md p-2 mb-2 border  ${password === confirmPassword ? '' : 'confirmPassword border-relative'}`} placeholder="confirm password" />

                    <button className="bg-blue-500 text-white w-full rounded-md p-2 mb-2">Send Email</button>
                    {error && <p className="text-red-500 bg-red-100 text-center block w-full rounded-md p-2 mb-2 border border-red-300">{error}</p>}
                </form>
                {message && <p className="text-green-500 text-center bg-green-100 block w-full rounded-md p-2 mb-2 border border-green-300">
                    {message}
                </p>}
                {message && (
                    <Link to={'/'} className="block bg-blue-500 text-white text-center w-full rounded-md p-2 mb-2">
                        Go to Login
                    </Link>
                )}
            </div>

        </div>
    )
}

// http://127.0.0.1:5173/changePassword/ecf45639bcd372ca4d6db35610484bee32a19d15de627f62ebf2c5645a3b91c7
// #Ahmed123