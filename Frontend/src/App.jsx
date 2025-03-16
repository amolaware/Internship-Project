import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Signup from './Components/Signup';
import Signin from './Components/Signin';
import Dashboard from './Components/Dashboard';
import PostAuction from './Components/PostAuction';
import AuctionItem from './Components/AuctionItem';
import DeleteAuctionItem from './Components/DeleteAuctionItem';
import AuthPage from './Components/AuthPage';
import './App.css';
import logo from '../src/assets/bid.png';

function App() {
  return (
    <Router>
      <div className="app">
        <header>
          <nav>
            <img src={logo} height="250px" alt="" />
          </nav>
        </header>
        <main>
          <p>Welcome to BidWave – The Place Where Every Bid is a Step Toward Victory! 🏆✨
          Browse through exciting auctions, make your bids, and claim amazing rewards. Sign in or sign up to kick off your auction experience today!</p>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/postauction" element={<PostAuction />} />
            <Route path="/auction/:id" element={<AuctionItem />} />
            <Route path="/delete-auction/:id" element={<DeleteAuctionItem />} />
            <Route path="/" element={<AuthPage />} />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2025 BidWave App. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;