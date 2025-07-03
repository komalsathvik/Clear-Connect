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
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '70vh',
        backgroundColor: '#000000',
        fontFamily: 'Segoe UI, sans-serif',
        padding: '2rem',
      }}
    >
      <div
        className="card shadow p-4"
        style={{
          maxWidth: '420px',
          width: '100%',
          borderRadius: '20px',
          backgroundColor: '#1c1c1c',
          border: '1px solid #333',
          color: 'white',
        }}
      >
        <h3 className="text-center mb-4" style={{ color: '#ffa500' }}>
          Join as Guest
        </h3>

        <form onSubmit={handleJoin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold" style={{ color: '#ffa500' }}>
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
              style={{
                backgroundColor: '#2c2c2c',
                border: '1px solid #444',
                color: 'white',
              }}
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
              style={{
                backgroundColor: '#2c2c2c',
                border: '1px solid #444',
                color: '#ffa500',
              }}
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
    </div>
  );
}

export default Guest;
