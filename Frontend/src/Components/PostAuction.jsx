import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PostAuction() {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePostAuction = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const auctionData = {
        itemName,
        description,
        startingBid: Number(startingBid),
        closingTime: new Date(closingTime).toISOString(),
      };

      // Hardcode the API URL here
      const API_URL = 'http://localhost:5001';

      const response = await fetch(`${API_URL}/auction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(auctionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post auction');
      }

      alert('Auction posted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Post Auction Error:', error);
      setError(error.message || 'Failed to post auction');
    }
  };

  return (
    <div className="form-container">
      <h2>Post New Auction</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handlePostAuction}>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
        <textarea
          placeholder="Item Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <input
          type="number"
          placeholder="Starting Bid"
          value={startingBid}
          onChange={(e) => setStartingBid(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={closingTime}
          onChange={(e) => setClosingTime(e.target.value)}
          required
        />
        <button type="submit">Post Auction</button>
      </form>
    </div>
  );
}

export default PostAuction;