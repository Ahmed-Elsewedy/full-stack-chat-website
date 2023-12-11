import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { getToken } from "./utils/authentication";
import axios from "axios";

export const UserContext = createContext({})

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null)
    const [id, setId] = useState(null)

    useEffect(() => {
        if (!user) {
            const token = getToken()
            if (!token) return
            axios.get('user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            }).then((response) => {
                setUser(response.data.data.user.username)
                setId(response.data.data.user._id)
            }).catch(error => {
                console.log(error.message);
            })
        }
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser, id, setId }}>
            {children}
        </UserContext.Provider>
    )
}