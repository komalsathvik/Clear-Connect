import React, { useState } from 'react';

function Guest() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    console.log('Joining as', username, 'in room', roomId);
    // Your join logic here
  };

  return (
      <div
        className="card shadow p-4"
       style={{ background: "linear-gradient(to right,rgb(243, 226, 193), #90ee90)" ,width:"450px",height:"400px"}}
      >
        <h3 className="text-center mb-4">
          Join as Guest
        </h3>

        <form onSubmit={handleJoin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-control form-control-lg"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              
            />
          </div>

          <div className="mb-4">
            <label htmlFor="roomId" className="form-label fw-semibold" style={{ color: '#ffa500' }}>
              Room ID
            </label>
            <input
              type="text"
              id="roomId"
              className="form-control form-control-lg"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-lg w-100 shadow-sm"
            style={{
              backgroundColor: '#ffa500',
              color: '#000',
              fontWeight: 'bold',
              border: 'none',
            }}
          >
            Join Room
          </button>
        </form>
      </div>
  );
}

export default Guest;
