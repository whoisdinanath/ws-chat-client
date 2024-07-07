import React, { useEffect, useState } from 'react';
import Chat from './chats/Chat';

const Handler = ({ token, userId, userName, handleLogout }) => {
  const [chatId, setChatId] = useState('');
  const [chatName, setChatName] = useState('');
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/chats/rooms/', {
          credentials: 'include', // Ensure cookies, including auth tokens, are sent with the request
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }

        const result = await response.json();
        setChats(result.data);
        setChatId(result.data[0]?.id || ''); // Set default chatId
        setChatName(result.data[0]?.name || ''); // Set default chatName
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };

    fetchChats();
  }, [token, userId, userName]);

  const handleChatChange = (e) => {
    const selectedChat = chats.find(chat => chat.name === e.target.value);
    setChatId(selectedChat.id);
    setChatName(selectedChat.name);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome to the Chat App</h1>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="chatName">Chat Room:</label>
          <select
            id="chatName"
            value={chatName}
            onChange={handleChatChange}
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {chats.map(chat => (
              <option key={chat.id} value={chat.name}>{chat.name}</option>
            ))}
          </select>
        </div>
        <Chat chatId={chatId} chatName={chatName} userId={userId} userName={userName} token={token} />
        <button onClick={handleLogout} className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg focus:outline-none">Logout</button>
      </div>
    </div>
  );
};

export default Handler;
