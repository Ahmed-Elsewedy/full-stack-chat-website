import { useContext, useState } from "react";
import Register from "./Register";
import Login from "./Login";
import { UserContext } from "./UserContext";
import Chat from "./Chat";

export default function Index() {
    const [status, setStatus] = useState('login')
    const { user, id } = useContext(UserContext)

    console.log(user)

    if (user || id) {
        return <Chat />
    }
    return (
        <>
            {status === 'register' && (<Register setStatus={setStatus} />)}
            {status === 'login' && (<Login setStatus={setStatus} />)}
        </>
    )
}