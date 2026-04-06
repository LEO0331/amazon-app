import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import MessageBox from '../components/MessageBox';
import apiClient from '../apiClient';

function SupportScreen() {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');

  const selectedThread = useMemo(
    () => threads.find((thread) => thread._id === selectedThreadId),
    [threads, selectedThreadId]
  );

  useEffect(() => {
    let timer;

    const loadThreads = async () => {
      const { data } = await apiClient.get('/api/support/threads');
      setThreads(data);
      if (!selectedThreadId && data.length > 0) {
        setSelectedThreadId(data[0]._id);
      }
    };

    loadThreads().catch(() => {
      setThreads([]);
    });
    timer = window.setInterval(loadThreads, 5000);

    return () => window.clearInterval(timer);
  }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }

    let timer;

    const loadMessages = async () => {
      const { data } = await apiClient.get(`/api/support/threads/${selectedThreadId}/messages`);
      setMessages(data);
    };

    loadMessages().catch(() => {
      setMessages([]);
    });
    timer = window.setInterval(loadMessages, 3500);

    return () => window.clearInterval(timer);
  }, [selectedThreadId]);

  const submitHandler = async (event) => {
    event.preventDefault();
    if (!selectedThreadId || !messageBody.trim()) {
      return;
    }

    const text = messageBody.trim();
    setMessageBody('');

    await apiClient.post(`/api/support/threads/${selectedThreadId}/messages`, { body: text });
    const { data } = await apiClient.get(`/api/support/threads/${selectedThreadId}/messages`);
    setMessages(data);
  };

  return (
    <div className="row top full-container">
      <div className="col-1 support-users">
        {threads.length === 0 && <MessageBox>No support threads found</MessageBox>}
        <ul>
          {threads.map((thread) => (
            <li
              key={thread._id}
              className={thread._id === selectedThreadId ? 'selected' : ''}
            >
              <button className="block" type="button" onClick={() => setSelectedThreadId(thread._id)}>
                {thread.user?.name || thread.user?.email || 'Customer'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="col-3 support-messages">
        {!selectedThreadId ? (
          <MessageBox>Select a thread to start support</MessageBox>
        ) : (
          <div className="support-chat-panel">
            <div className="row">
              <strong>{`Chat with ${selectedThread?.user?.name || 'Customer'}`}</strong>
            </div>
            <ul>
              {messages.length === 0 && <li>No message.</li>}
              {messages.map((message) => (
                <li key={message._id}>
                  <strong>{`${message.name}: `}</strong>
                  {message.body}
                </li>
              ))}
            </ul>
            <form onSubmit={submitHandler} className="row support-compose">
              <input
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                type="text"
                placeholder="Please type message"
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupportScreen;
