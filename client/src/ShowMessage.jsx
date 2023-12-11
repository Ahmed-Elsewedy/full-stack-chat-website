import axios from "axios"
import { useState } from "react"

export default function ShowMessage({ message, file, actionColor }) {
    const [showmore, setShowmore] = useState(false)
    const [showless, setShowless] = useState(true)

    // if (file) console.log(file)

    function expandMessage() {
        setShowmore(true)
        setShowless(false)
    }

    function limitMessage() {
        setShowmore(false)
        setShowless(true)
    }

    return (
        <div>
            {file && (
                <img
                    className="w-fit rounded " src={file?.data ? file.data : (axios.defaults.baseURL + 'uploads/' + file)} />

            )}
            {message && message.length && (
                <div className="p-2 ">
                    {message.length <= 120 && (
                        <>
                            {message}
                        </>

                    )}
                    {message.length > 120 && showless && (
                        <>
                            {message.slice(0, 120)}...
                            <button onClick={expandMessage} className={" text-md " + actionColor} >show more</button>
                        </>
                    )}
                    {message.length > 120 && showmore && (
                        <>
                            {message} <button onClick={limitMessage} className={"text-md " + actionColor} >show less</button>
                        </>
                    )}
                </div>
            )}

        </div>

    )
}

/*
{file && (
                <div className="">
                    <a target="_blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + 'uploads/' + file}>
                        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                        </svg>}
                        {file}
                    </a>
                </div>
            )}
*/