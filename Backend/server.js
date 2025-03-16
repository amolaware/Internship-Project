const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_123!';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Auctiondb';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Auction Item Schema
const auctionItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  currentBid: { type: Number, default: 0 },
  highestBidder: { type: String, default: '' },
  closingTime: { type: Date, required: true },
  isClosed: { type: Boolean, default: false },
});

const AuctionItem = mongoose.model('AuctionItem', auctionItemSchema);

// Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// Function to check and close expired auctions
const checkAndCloseExpiredAuctions = async () => {
  try {
    const now = new Date();
    const expiredAuctions = await AuctionItem.find({ closingTime: { $lte: now }, isClosed: false });

    for (const auction of expiredAuctions) {
      auction.isClosed = true;
      await auction.save();
      console.log(`Auction ${auction._id} closed automatically.`);
    }
  } catch (error) {
    console.error('Error closing expired auctions:', error);
  }
};

// Run the check every minute
setInterval(checkAndCloseExpiredAuctions, 60000); // 60000 ms = 1 minute

// Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Signin Route
app.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Signin successful', token });
  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create Auction Item (Protected)
app.post('/auction', authenticate, async (req, res) => {
  try {
    const { itemName, description, startingBid, closingTime } = req.body;

    if (!itemName || !description || !startingBid || !closingTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newItem = new AuctionItem({
      itemName,
      description,
      currentBid: startingBid,
      closingTime,
    });

    await newItem.save();
    res.status(201).json({ message: 'Auction item created', item: newItem });
  } catch (error) {
    console.error('Auction Post Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all auction items
app.get('/auctions', async (req, res) => {
  try {
    const auctions = await AuctionItem.find();
    res.json(auctions);
  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a single auction item by ID
app.get('/auctions/:id', async (req, res) => {
  try {
    const auctionItem = await AuctionItem.findById(req.params.id);
    if (!auctionItem) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if the auction should be closed
    if (new Date() > new Date(auctionItem.closingTime) && !auctionItem.isClosed) {
      auctionItem.isClosed = true;
      await auctionItem.save();
    }

    res.json(auctionItem);
  } catch (error) {
    console.error('Fetching Auction Item Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Bidding on an item (Protected)
app.post('/bid/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { bid } = req.body;

    const item = await AuctionItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Auction item not found' });
    }

    if (item.isClosed) {
      return res.status(400).json({ message: 'Auction is closed' });
    }

    if (new Date() > new Date(item.closingTime)) {
      item.isClosed = true;
      await item.save();
      return res.json({ message: 'Auction closed', winner: item.highestBidder });
    }

    if (bid > item.currentBid) {
      item.currentBid = bid;
      item.highestBidder = req.user.username;
      await item.save();

      console.log('Updated Auction Item:', item);

      res.json({ message: 'Bid successful', item });
    } else {
      res.status(400).json({ message: 'Bid too low' });
    }
  } catch (error) {
    console.error('Bidding Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete an auction item (Protected)
app.delete('/auctions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const auctionItem = await AuctionItem.findById(id);
    if (!auctionItem) {
      return res.status(404).json({ message: 'Auction item not found' });
    }

    await AuctionItem.findByIdAndDelete(id);

    res.json({ message: 'Auction item deleted successfully' });
  } catch (error) {
    console.error('Delete Auction Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});