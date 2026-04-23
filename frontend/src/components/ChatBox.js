import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../apiClient';

function ChatBox(props) {
  const { userInfo } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([
    { _id: 'welcome', name: 'Support', body: 'Hello there, Please ask your questions.' },
  ]);
  const [threadId, setThreadId] = useState(null);
  const uiMessagesRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !uiMessagesRef.current) {
      return;
    }

    uiMessagesRef.current.scrollBy({
      top: uiMessagesRef.current.clientHeight,
      left: 0,
      behavior: 'smooth',
    });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let timer;

    const openThread = async () => {
      const { data: thread } = await apiClient.post('/api/support/threads', { userId: userInfo._id });
      setThreadId(thread._id);

      const poll = async () => {
        const response = await apiClient.get(`/api/support/threads/${thread._id}/messages`);
        setMessages((previous) => {
          if (response.data.length === 0) {
            return previous;
          }
          return response.data;
        });
      };

      await poll();
      timer = window.setInterval(poll, 4000);
    };

    openThread().catch(() => {
      setMessages([{ _id: 'error', name: 'Support', body: 'Support inbox is temporarily unavailable.' }]);
    });

    return () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [isOpen, userInfo._id]);

  const submitHandler = async (event) => {
    event.preventDefault();
    if (!messageBody.trim() || !threadId) {
      return;
    }

    const text = messageBody.trim();
    setMessageBody('');
    const optimistic = { _id: `tmp-${Date.now()}`, name: userInfo.name, body: text };
    setMessages((previous) => [...previous, optimistic]);

    try {
      await apiClient.post(`/api/support/threads/${threadId}/messages`, { body: text });
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        { _id: `err-${Date.now()}`, name: 'Support', body: 'Failed to send message. Please retry.' },
      ]);
    }
  };

  return (
    <div className="chatbox">
      {!isOpen ? (
        <button type="button" onClick={() => setIsOpen(true)} aria-label="Open support inbox">
          <i className="fa fa-support" aria-hidden="true" />
        </button>
      ) : (
        <div className="card card-body">
          <div className="row">
            <strong>Support Inbox</strong>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close support inbox">
              <i className="fa fa-close" aria-hidden="true" />
            </button>
          </div>
          <ul ref={uiMessagesRef}>
            {messages.map((message) => (
              <li key={message._id}>
                <strong>{`${message.name}: `}</strong>
                {message.body}
              </li>
            ))}
          </ul>
          <form onSubmit={submitHandler} className="row">
            <input
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              type="text"
              placeholder="Please type message"
              aria-label="Type support message"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
