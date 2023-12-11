import { useContext, useEffect, useRef, useState } from "react"
import { getToken, removeToken } from './utils/authentication'
import Avatar from "./Avatar"
import Logo from "./Logo"
import { UserContext } from "./UserContext"
import axios from "axios"
import ShowMessage from "./ShowMessage"

export default function Chat() {
    const [ws, setWs] = useState()
    const [onlinePeople, setOnlinePeople] = useState({})
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const { user, id, setUser, setId } = useContext(UserContext)
    const [newMessageText, setNewMessageText] = useState('')
    const [messages, setMessages] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [focus, setFocus] = useState(true)
    const [newChat, setNewChat] = useState(false)
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [chatedUsers, setChatedUsers] = useState([])
    const inputRef = useRef(null);
    const divUnderMessages = useRef(null);

    const scrollToBottom = () => {
        const div = divUnderMessages.current;
        if (div) {
            div.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
    };

    useEffect(() => {
        if (!selectedUserId) return
        const token = getToken()
        axios.post(
            '/message/chat',
            { receiver: selectedUserId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        ).then((response) => {
            setMessages(response.data.data.messages)
            setFocus(!focus)
        }).catch((error) => {
            console.error(error.message)
        })
        inputRef.current.focus()
    }, [selectedUserId])

    useEffect(() => {
        scrollToBottom();
    }, [focus]);

    useEffect(() => {
        const token = getToken()
        if (token) {
            let url = import.meta.env.VITE_SERVER_URL
            url = url.replace('http', '')
            url = url.replace('https', '')
            const ws = new WebSocket(`ws${url}?token=${token}`)
            setWs(ws)
            ws.addEventListener('message', handleMessage);
            ws.addEventListener('close', () => {
                setTimeout(() => {
                    console.log('Disconnected. Trying to reconnect.');
                    connectToWs();
                }, 1000);
            });
        }
    }, [])

    function handleMessage(e) {
        const messageData = JSON.parse(e.data)
        if ('online' in messageData)
            showOnlinePeople(messageData.online)
        else if ('text' in messageData) {
            const messageId = messageData.id;
            if (!messages.some(message => message.id === messageId)) {
                const tmpMsg = messages
                tmpMsg.push(messageData);
                setMessages(prevMessages => [...prevMessages, messageData]);
            }
        }
    }

    async function showOnlinePeople(peopleArray) {
        const peopleSet = new Set()
        peopleArray.forEach(({ userId }) => {
            peopleSet.add(userId)
        })

        setOnlinePeople(peopleSet)
        const token = getToken()
        const { data: { data: { people } } } = await axios.get('/user/people', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const { data: { data: { users } } } = await axios.get('/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const peopleTmp = people.map(person => ({ ...person, online: peopleSet.has(person.id) }))
        const usersTmp = users.map(person => ({ ...person, online: peopleSet.has(person._id) }))

        setChatedUsers(peopleTmp)
        setAllUsers(usersTmp)
    }

    function sendMessage(ev) {
        if (ev)
            ev.preventDefault()

        const messageAfterFiltered = newMessageText.trim().replace(/\s+/g, ' ')

        if (messageAfterFiltered.length || selectedFile) {

            ws.send(JSON.stringify({
                message: {
                    receiver: selectedUserId,
                    text: messageAfterFiltered,
                    file: selectedFile,
                }
            }))

            if (messages.length === 0) {
                setChatedUsers([{ id: selectedUserId, ...selectedUser }, ...chatedUsers])
            }

            setMessages([...messages, { text: messageAfterFiltered, sender: id, receiver: selectedUserId, file: selectedFile || null }])
            setNewMessageText('')
            setSelectedFile(null)
            setFocus(!focus)
        }
    }
    function logout() {
        removeToken()
        setWs(null);
        setId(null);
        setUser(null);
    }
    function sendFile(ev) {
        const file = ev.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);

            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setSelectedFile({
                    name: Date.now() + '.' + file.name.split('.').pop(),
                    data: reader.result
                });
                setFocus(!focus)
            };


        } else {
            setSelectedFile(null);
            alert('Please select a valid image file.');
        }

    }
    const toggleSidebar = () => {
        setSidebarVisible(!isSidebarVisible);
    };

    document.body.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape' || ev.key === 'Esc')
            setSelectedUserId(null)
    })

    return (

        <div className="relative flex h-screen overflow-hidden">
            <div className={` flex flex-col z-10 w-1/3 lg:w-1/5 bg-gray-800 h-full block ${isSidebarVisible ? 'flex-0 w-64 absolute left-0 block index-0' : 'hidden sm:block'}`}>
                <div className="bg-white h-full flex flex-col">
                    <div className="cursor-pointer flex flex-row" >
                        <div className="" onClick={() => { setSelectedUserId(null) }}><Logo /></div>
                        <button
                            className="text-white px-2 py-1 rounded block sm:hidden"
                            onClick={toggleSidebar}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 bg-white text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>

                        </button>
                    </div>
                    {newChat && (
                        <div className="flex flex-row gap-0.5 pl-4 bg-relative mb-4">
                            <button onClick={() => { setNewChat(false) }} className="w-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                            </button>
                            <div className="flex flex-col">
                                <span className="text-gray-800 text-xl/4">select user</span>
                                <span className="text-gray-500 text-xs"> {allUsers.length} {allUsers.length === 1 ? 'user' : 'users'}</span>
                            </div>

                        </div>
                    )}

                    <div className="flex-grow overflow-y-auto scrollContainer">
                        {!newChat && chatedUsers.map(({ id: userId, username, fullname, online }) => (
                            <div className="flex-gorw" key={userId}>
                                {
                                    userId !== id && (
                                        <div onClick={() => { setSelectedUserId(userId); if (isSidebarVisible) toggleSidebar(); setSelectedUser({ username, fullname, userId, online }) }} className={"flex gap-2 items-center border-b border-gray-100 cursor-pointer " + (userId === selectedUserId ? 'bg-blue-50' : '')}>
                                            {userId === selectedUserId && (
                                                <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
                                            )}
                                            <div className="flex gap-2 py-1 pl-4 items-center">
                                                <Avatar username={fullname} userId={userId} online={online} />
                                                <div className="flex flex-col">
                                                    <div className="text-gray-800 text-xl/4 ">{fullname}</div>
                                                    <div className="text-gray-500 text-xs "> @{username}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        ))}


                        {newChat && allUsers.map(({ _id: userId, username, fullname, online }) => (
                            <div className="flex-gorw" key={userId}>
                                {
                                    userId !== id && (
                                        <div onClick={() => { setSelectedUserId(userId); if (isSidebarVisible) toggleSidebar(); setSelectedUser({ username, fullname, userId, online }) }} className={"flex gap-2 items-center border-b border-gray-100 cursor-pointer " + (userId === selectedUserId ? 'bg-blue-50' : '')}>
                                            {userId === selectedUserId && (
                                                <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
                                            )}
                                            <div className="flex gap-2 py-1 pl-4 items-center">
                                                <Avatar username={fullname} userId={userId} online={online} />
                                                <div className="flex flex-col">
                                                    <div className="text-gray-800 text-xl/4 ">{fullname}</div>
                                                    <div className="text-gray-500 text-xs "> @{username}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                    {!newChat && (
                        <div className=" flex h-10 w-10 absolute bottom-12 bg-blue-600 ml-3 z-50 rounded-xl cursor-pointer items-center" onClick={(ev) => { setNewChat(true) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white m-auto">
                                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                            </svg>

                        </div>)}
                    <div className="p-2 text-center flex items-center justify-center">
                        <span className="mr-2 text-sm text-gray-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                            {user}
                        </span>
                        <button
                            onClick={logout}
                            className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm">logout</button>
                    </div>
                </div>
            </div>
            <div className=" flex-1 flex-col z-1 px-1 h-screen" onClick={() => { if (isSidebarVisible) toggleSidebar() }}>
                <div className="flex flex-col bg-blue-50 h-full">
                    <div className="flex-grow">
                        <div className="flex">
                            <button className={"text-white px-2 py-1 rounded-l sm:hidden  " + (!!selectedUserId ? 'bg-blue-100' : 'relative')} onClick={toggleSidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 bg-relative text-black">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                </svg>
                            </button>
                            {!!selectedUserId && (
                                <div className="h-12 w-full bg-blue-100 pl-6 pt-2 flex flex-row gap-2">
                                    <Avatar username={selectedUser.fullname} userId={selectedUser.userId} online={selectedUser.online} />
                                    <div className="flex flex-col">
                                        <span className="text-gray-800 text-xl/4">{selectedUser.fullname}</span>
                                        <span className="text-gray-500 text-xs">@{selectedUser.username} </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {(!selectedUserId && (
                            <div className="flex flex-grow h-full items-center justify-center">
                                <div className="text-gray-400 text-2xl">&larr; Select chat from sidebar</div>
                            </div>
                        ))}

                        {!!selectedUserId && (
                            <div className="relative h-full">

                                <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-3 scrollContainer gap-2 ">
                                    {messages.length === 0 && (
                                        <div className="flex flex-grow h-full items-center justify-center">
                                            <div className="text-gray-400 text-2xl">
                                                No messages till now
                                            </div>
                                        </div>
                                    )}
                                    {messages.map((message, idx) => (
                                        <div key={idx} className="flex " >
                                            {message.sender === id && (
                                                <div className={"text-xl bg-blue-500 text-white ml-auto rounded-md  m-2 h-auto whitespace-pre-wrap break-words " + (message?.file ? 'w-80' : message.text.length >= 65 ? 'w-3/5 lg:w-7/12' : 'w-fit')}>
                                                    <div className="p-0.5 ">
                                                        <ShowMessage message={message.text} file={message?.file} actionColor={'text-gray-600'} />
                                                    </div>
                                                </div>
                                            )}
                                            {message.sender === selectedUserId && (
                                                <div className={"text-xl bg-white text-gray-600 border border rounded-md m-3 h-auto whitespace-pre-wrap break-words " + (message?.file ? 'w-80' : message.text.length >= 65 ? 'w-3/5 lg:w-7/12' : 'w-fit')}>
                                                    <div className="p-0.5">
                                                        <ShowMessage message={message.text} file={message?.file} actionColor={'text-blue-400'} />
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <>
                                        {selectedFile && (
                                            <div className="w-3/5 h-50  border ml-auto">
                                                <p className="border-b pl-2 bg-gray-200">selected iamge...</p>
                                                <img className="w-full h-auto" src={selectedFile.data} alt="Selected" />
                                                <p></p>
                                            </div>
                                        )}
                                    </>
                                    <div className="block" ref={divUnderMessages}>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {!!selectedUserId && (

                        <form className={`flex p-2 block gap-2 z-0 pt-8 sm:pt-0`} onSubmit={sendMessage}>
                            <input ref={inputRef} value={newMessageText} onChange={ev => setNewMessageText(ev.target.value)} type="text" placeholder="type your message here..." className="bg-white flex-grow border p-2 rounded-sm" />
                            <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
                                <input type="file" className="hidden" onChange={sendFile} />
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                                </svg>
                            </label>
                            <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div >
    )
}