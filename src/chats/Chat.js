import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const Chat = ({ chatId, chatName, userId, userName, token }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    const fetchOldMessages = async () => {
      try {
        // const response = await fetch(`http://localhost:5000/api/v1/messages/${chatId}`, {
        //   credentials: 'include',
        // });
        const response = await fetch(`https://electrocord.onrender.com/api/v1/messages/${chatId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const result = await response.json();
        console.log('Old messages:', result.data);
        setMessages(result.data);
      } catch (error) {
        console.error('Error fetching old messages:', error);
      }
    };

    const fetchRoutines = async () => {
      try {
        const response = await fetch('https://electrocord.onrender.com/api/v1/routines/', {
          credentials: 'include',
        });
        // const response = await fetch('http://localhost:5000/api/v1/routines/', {
        //   credentials: 'include',
        // });

        if (!response.ok) {
          throw new Error('Failed to fetch routines');
        }
        console.log("Fetching routines");
        const result = await response.json();
        console.log("Routines: ", result.data);
        setRoutines(result.data);
      } catch (error) {
        console.error('Error fetching routines:', error);
      }
    };
    fetchRoutines();

    console.log("Displaying routines: ", routines);
    if (token && chatId) {
      const newSocket = io('https://electrocord.onrender.com', {
        auth: { token },
      });
      // const newSocket = io('http://localhost:5000', {
      //   auth: { token },
      // });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        newSocket.emit('join', { userId, chatId });
      });

      newSocket.on('chatMessage', (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      fetchOldMessages();

      return () => {
        if (newSocket) {
          newSocket.emit('leave', { userId, chatId });
          newSocket.off('chatMessage');
          newSocket.disconnect();
        }
      };
    }
  }, [chatId, userId, token]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() && attachments.length === 0) {
      setError('Message or attachments cannot be empty');
      return;
    }

    const uploadedUrls = await Promise.all(attachments.map(uploadFile));

    const payload = {
      chatId,
      senderId: userId,
      senderName: userName,
      message,
      attachments: uploadedUrls.map(url => ({
        originalName: url.originalName,
        uploadedName: url.uploadedName,
        filePath: url.filePath,
        fileType: url.fileType,
      })),
    };

    if (isConnected && socket) {
      socket.emit('chatMessage', payload);
      setMessages((prevMessages) => [...prevMessages, payload]);
      setMessage('');
      setAttachments([]);
      setError('');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 5) {
      setError('You can only attach up to 5 files.');
      return;
    }
    setAttachments((prev) => [...prev, ...files]);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://electrocord.onrender.com/api/v1/attachments/upload', {
      method: 'POST',
      body: formData,
    });

    // const response = await fetch('http://localhost:5000/api/v1/attachments/upload', {
    //   method: 'POST',
    //   body: formData,
    // });

    const result = await response.json();
    if (!response.ok) {
      throw new Error('File upload failed');
    }
    const { originalName, uploadedName, filePath, fileType } = result.data[0];
    console.log('Uploaded file:', { originalName, uploadedName, filePath, fileType });
    return { originalName, uploadedName, filePath, fileType };
  };

  const handleSendClick = () => {
    sendMessage();
  };

  const handleAttachmentClick = () => {
    document.getElementById('attachment-input').click();
  };

  const getAttachmentElement = (file) => {
    const filePath = file.filePath || file.file_path;
    const fileType = file.fileType || file.file_type;

    switch (true) {
      case fileType.startsWith('image'):
        return (
          <img
            key={filePath}
            src={filePath}
            alt={file.originalName || file.original_name}
            className="w-16 h-16 object-cover rounded-md"
          />
        );
      case fileType.startsWith('video'):
        return (
          <video
            key={filePath}
            src={filePath}
            controls
            className="w-64 h-36 object-cover rounded-md mt-2 mr-2"
          ></video>
        );
      case fileType.startsWith('audio'):
        return (
          <div
            key={filePath}
            className="flex items-center p-2 m-1 bg-gray-200 rounded-md w-full h-12"
          >
            <audio controls className="w-full">
              <source src={filePath} />
            </audio>
          </div>
        );
      case fileType.startsWith('application'):
        return (
          <div
            key={filePath}
            className="flex items-center justify-between p-2 m-1 bg-gray-200 rounded-md w-full h-12"
          >
            <div className="flex items-center">
              <span className="text-lg mr-2">📄</span>
              <a
                href={filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 underline"
              >
                {file.originalName || file.original_name}
              </a>
            </div>
            <a
              href={filePath}
              download
              className="block text-blue-600 underline"
            >
              Download <span role="img" aria-label="Download icon">⬇️</span>
            </a>
          </div>
        );
      default:
        return (
          <div
            key={filePath}
            className="flex items-center justify-between p-2 m-1 bg-gray-200 rounded-md w-full h-12"
          >
            <div className="flex items-center">
              <span className="text-lg mr-2">📄</span>
              <a
                href={filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 underline"
              >
                {file.originalName || file.original_name}
              </a>
            </div>
            <a
              href={filePath}
              download
              className="block text-blue-600 underline"
            >
              Download <span role="img" aria-label="Download icon">⬇️</span>
            </a>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-100">
      <div className="max-w-screen-lg mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Chat Room: {chatName}</h1>
        <div className="mb-4 h-64 overflow-y-auto" style={{ overflowAnchor: 'none' }}>
          {messages.map((msg, index) => (
            <div key={index} className="mb-2">
              <strong>{msg.senderName || msg.sendername}</strong>: {msg.message}
              <div className="flex flex-wrap">
                {msg.attachments?.map((file) => getAttachmentElement(file))}
              </div>
            </div>
          ))}
          {/* Dummy div to scroll into view */}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center">
          <button
            onClick={handleAttachmentClick}
            className="mr-2 px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 focus:outline-none"
          >
            📎
          </button>
          <input
            type="file"
            id="attachment-input"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
            onFocus={() => setError('')}
          />
          <button
            onClick={handleSendClick}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Send
          </button>
        </div>
        {attachments.length > 0 && (
          <div className="mt-2 p-2 bg-gray-100 rounded-lg">
            <strong>Attachments:</strong>
            <div className="flex flex-wrap">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="relative w-16 h-16 p-2 m-1 bg-gray-200 rounded-md flex flex-col items-center"
                >
                  <span className="text-xs text-gray-600 truncate">
                    {file.name}
                  </span>
                  <span className="absolute bottom-0 right-0 text-xs text-gray-600">
                    📄
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default Chat;
