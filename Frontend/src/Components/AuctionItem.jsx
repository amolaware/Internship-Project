import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AuctionItem.css';

function AuctionItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await fetch(`http://localhost:5001/auctions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch auction');
        const data = await response.json();
        setAuction(data);
        console.log('Auction Data:', data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(`http://localhost:5001/bid/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bid: Number(bidAmount) }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Bid failed');

      console.log('Server Response:', data);

      setAuction((prev) => ({
        ...prev,
        currentBid: data.item.currentBid,
        highestBidder: data.item.highestBidder,
      }));
      setBidAmount('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading auction details...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="auction-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &larr; Back to Dashboard
      </button>

      <div className="auction-header">
        <h1>{auction?.itemName}</h1>
        <span className={`status ${auction?.isClosed ? 'closed' : 'open'}`}>
          {auction?.isClosed ? 'Closed' : 'Open'}
        </span>
      </div>

      <div className="auction-content">
        <div className="description-section">
          <h2>Item Description</h2>
          <p>{auction?.description}</p>

          <div className="auction-meta">
            <p>
              <strong>Starting Price:</strong>{' '}
              {auction?.startingBid ? `$${auction.startingBid}` : 'N/A'}
            </p>
            <p>
              <strong>Listed:</strong>{' '}
              {auction?.createdAt ? new Date(auction.createdAt).toLocaleDateString() : 'N/A'}
            </p>
            <p>
              <strong>Auction Ends:</strong>{' '}
              {auction?.closingTime ? new Date(auction.closingTime).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bid-section">
          <div className="current-bid">
            <h2>Current Bid</h2>

            <div className="bid-amount">
              <strong>Auction Highest Bid: </strong>{' '}
              ${auction?.currentBid || 0}
            </div>
            <div className="highest-bidder">
              <strong>Auction Highest Bid By: </strong>{' '}
              {auction?.highestBidder || 'No bids yet'}
            </div>
          </div>

          {auction && !auction.isClosed && (
            <form onSubmit={handleSubmitBid} className="bid-form">
              <div className="form-group">
                <label htmlFor="bidAmount">Enter Bid:</label>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={auction.currentBid + 1}
                  step="1"
                  placeholder={`Minimum bid $${auction.currentBid + 1}`}
                  required
                />
              </div>
              <button type="submit" className="bid-button">
                Place Bid
              </button>
              {error && <div className="error-message">{error}</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuctionItem;