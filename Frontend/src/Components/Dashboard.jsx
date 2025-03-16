import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dash.css';

function Dashboard() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch('http://localhost:5001/auctions');
        if (!response.ok) throw new Error('Failed to fetch auctions');
        const data = await response.json();
        setAuctions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const handleDeleteAuction = async (auctionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to delete auctions');
        return;
      }

      const response = await fetch(`http://localhost:5001/auctions/${auctionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAuctions(auctions.filter((auction) => auction._id !== auctionId));
      }
    } catch (error) {
      console.error('Error deleting auction:', error);
    }
  };

  if (loading) return <div className="message">Loading auctions...</div>;
  if (error) return <div className="message error">{error}</div>;

  return (
    <div className="dashboard">
      <h2>Auction Dashboard</h2>

      <div className="action-buttons">
        <Link to="/postauction">
          <button className="btn primary">Post New Auction</button>
        </Link>
      </div>

      <div className="auctions-list">
        {auctions.length === 0 ? (
          <p className="message">No active auctions available</p>
        ) : (
          auctions.map((auction) => (
            <div key={auction._id} className="auction-item">
              <h4>{auction.itemName} - ${auction.currentBid}</h4>
              <p>Closes: {new Date(auction.closingTime).toLocaleString()}</p>

              <div className="item-actions">
                <Link to={`/auction/${auction._id}`} className="btn primary">
                  View Details
                </Link>

                <button
                  className="btn danger"
                  onClick={() => handleDeleteAuction(auction._id)}
                >
                  Delete Auction
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;