
# Trading Platform Backend

This is a Flask-based backend for the trading platform, designed to connect to a MySQL database using stored procedures and views.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` with your database credentials.

5. Start the server:
   ```
   python app.py
   ```

## API Endpoints

### User Management
- `POST /users`: Create a new user with an initial balance
- `PUT /users/<userID>/balance`: Update a user's balance
- `GET /users/<userID>/portfolio`: Get a user's portfolio information

### Order Management
- `POST /orders/parent`: Create a parent order
- `POST /orders/child`: Create a child order
- `PUT /orders/child/<cOrderID>/complete`: Complete a child order
- `PUT /orders/parent/<pOrderID>/complete`: Complete a parent order

### Data Views
- `GET /orders/active`: View active orders in the order book
- `GET /users/<userID>/orders/status`: View a user's order statuses
- `GET /users/<userID>/orders/history`: View a user's order history

## Frontend Integration Example

```javascript
// Using Axios to fetch a user's portfolio
axios.get(`/users/${userId}/portfolio`)
  .then(response => {
    const { user_summary, asset_details } = response.data;
    // Update UI with portfolio data
  })
  .catch(error => console.error('Error fetching portfolio:', error));

// Submitting a parent order
axios.post('/orders/parent', {
  ticker: 'AAPL',
  shares: 10,
  type: 'buy',
  amount: 1750.00,
  user_id: userId
})
  .then(response => {
    const { order_id } = response.data;
    // Update UI with new order
  })
  .catch(error => console.error('Error creating order:', error));

// Polling active orders
setInterval(() => {
  axios.get('/orders/active')
    .then(response => {
      const { orders } = response.data;
      // Update order book display
    })
    .catch(error => console.error('Error fetching active orders:', error));
}, 5000);
```
