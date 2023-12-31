export default function Avatar({ username, userId, online }) {

    const colors = ['bg-teal-200', 'bg-red-200',
        'bg-green-200', 'bg-purple-200',
        'bg-blue-200', 'bg-yellow-200',
        'bg-orange-200', 'bg-pink-200', 'bg-fuchsia-200', 'bg-rose-200'];
    const userIdBase10 = parseInt(userId.substring(10), 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
    return (
        <div className={"w-8 h-8 relative  rounded-full flex items-center " + color}>
            <div className="text-center w-full opacity-70">
                {username[0].toUpperCase()}
            </div>
            <div className={`absolute w-3 h-3 rounded-full ${online ? 'bg-green-700' : 'bg-gray-500'} bottom-0 right-0 border border-white border-2`}></div>

        </div>
    )
}