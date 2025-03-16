import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function DeleteAuctionItem() {
  const { id } = useParams(); // Get the auction item ID from the URL
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to delete auction items');
        navigate('/signin');
        return;
      }

      const response = await fetch(`http://localhost:5001/auctions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Auction item deleted successfully!');
        navigate('/dashboard'); // Redirect to the dashboard after deletion
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete auction item');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      setError('An error occurred while deleting the auction item');
    }
  };

  return (
    <div className="delete-container">
      <h2>Delete Auction Item</h2>
      {error && <p className="error">{error}</p>}
      <p>Are you sure you want to delete this auction item?</p>
      <button onClick={handleDelete} className="btn danger">
        Delete
      </button>
      <button onClick={() => navigate(-1)} className="btn">
        Cancel
      </button>
    </div>
  );
}

export default DeleteAuctionItem;