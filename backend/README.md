
# Trading Application Backend

This is a Flask-based backend for the trading application. It provides API endpoints for managing users, orders, and assets.

## Setup

1. Install the required packages:
```
pip install -r requirements.txt
```

2. Run the Flask server:
```
python app.py
```

The server will start at http://localhost:5000.

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/<id>` - Get a specific user
- `PUT /api/users/<id>` - Update a user's balance

### Orders
- `GET /api/orders` - Get all orders (can filter by userID with query parameter)
- `POST /api/orders` - Create a new order
- `PUT /api/orders/<id>` - Update an order's status

### Assets
- `GET /api/assets` - Get assets for a user (requires userID query parameter)

## Database

The application uses SQLite for data storage. The database file is `trading.db` and is created automatically when the application starts.

## Models

### User
- `userID`: Primary key
- `name`: User's name
- `email`: User's email (unique)
- `account_balance`: User's account balance

### Order
- `orderID`: Primary key
- `ticker`: Stock ticker symbol
- `shares`: Number of shares
- `status`: Order status (Processing, In-Progress, Completed)
- `type`: Order type (Buy, Sell)
- `executionType`: Order execution type (Market, Limit)
- `price`: Price per share
- `timestamp`: Order creation time
- `userID`: Foreign key to User

### Asset
- `assetID`: Primary key
- `userID`: Foreign key to User
- `ticker`: Stock ticker symbol
- `shares`: Number of shares
