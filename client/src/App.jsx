import axios from 'axios'
import { Route, Routes } from "react-router-dom"
import { UserContextProvider } from './UserContext'
import Index from './Index'
import Verify from './Verify'
import ForgetPassword from './ForgetPassword'
import ResetPassword from './ResetPassword'
import Layout from './Layout'


axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL + '/api/'
axios.defaults.withCredentials = true


function App() {
    return (
        <UserContextProvider>
            <Routes>
                <Route path='/' element={<Layout />} >
                    <Route index element={<Index />} />
                    <Route path='/verify' element={<Verify />} />
                    <Route path='/forgetPassword' element={<ForgetPassword />} />
                    <Route path='/changePassword/:token' element={<ResetPassword />} />
                    <Route path='*' element={<Index />} />
                </Route>
            </Routes>
        </UserContextProvider>
    )
}

export default App