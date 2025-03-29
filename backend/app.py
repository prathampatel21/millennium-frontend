from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'trading.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        userID INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        account_balance REAL NOT NULL DEFAULT 10000
    )
    ''')
    
    # Create orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        orderID INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker TEXT NOT NULL,
        shares INTEGER NOT NULL,
        status TEXT NOT NULL,
        type TEXT NOT NULL,
        executionType TEXT NOT NULL,
        price REAL NOT NULL,
        timestamp DATETIME NOT NULL,
        userID INTEGER NOT NULL,
        FOREIGN KEY (userID) REFERENCES users (userID)
    )
    ''')
    
    # Create assets table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS assets (
        assetID INTEGER PRIMARY KEY AUTOINCREMENT,
        userID INTEGER NOT NULL,
        ticker TEXT NOT NULL,
        shares INTEGER NOT NULL,
        FOREIGN KEY (userID) REFERENCES users (userID),
        UNIQUE (userID, ticker)
    )
    ''')
    
    # Insert demo user if not exists
    cursor.execute('INSERT OR IGNORE INTO users (name, email, account_balance) VALUES (?, ?, ?)', 
                  ('John Doe', 'john.doe@example.com', 10000.0))
    
    # Add some initial assets for the demo user
    user_id = cursor.execute('SELECT userID FROM users WHERE email = ?', ('john.doe@example.com',)).fetchone()[0]
    initial_assets = [
        (user_id, 'AAPL', 10),
        (user_id, 'MSFT', 3),
        (user_id, 'NVDA', 2),
        (user_id, 'TSLA', 15)
    ]
    
    for asset in initial_assets:
        cursor.execute('INSERT OR IGNORE INTO assets (userID, ticker, shares) VALUES (?, ?, ?)', asset)
    
    conn.commit()
    conn.close()

# Initialize the database
init_db()

# API Routes
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    users = cursor.execute('SELECT * FROM users').fetchall()
    
    result = []
    for user in users:
        result.append({
            'userID': user['userID'],
            'name': user['name'],
            'email': user['email'],
            'account_balance': user['account_balance']
        })
    
    conn.close()
    return jsonify(result)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    
    required_fields = ['name', 'email']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Set default balance if not provided
    if 'account_balance' not in data:
        data['account_balance'] = 10000.0
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Check if email already exists
    existing_user = cursor.execute('SELECT * FROM users WHERE email = ?', (data['email'],)).fetchone()
    if existing_user:
        conn.close()
        return jsonify({'error': 'Email already registered'}), 400
    
    # Insert new user
    cursor.execute('''
    INSERT INTO users (name, email, account_balance) 
    VALUES (?, ?, ?)
    ''', (data['name'], data['email'], data['account_balance']))
    
    user_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    # Return the created user
    return jsonify({
        'userID': user_id,
        'name': data['name'],
        'email': data['email'],
        'account_balance': data['account_balance']
    })

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    user = cursor.execute('SELECT * FROM users WHERE userID = ?', (user_id,)).fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    result = {
        'userID': user['userID'],
        'name': user['name'],
        'email': user['email'],
        'account_balance': user['account_balance']
    }
    
    conn.close()
    return jsonify(result)

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    
    if 'account_balance' not in data:
        return jsonify({'error': 'account_balance is required'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('UPDATE users SET account_balance = ? WHERE userID = ?', 
                  (data['account_balance'], user_id))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/orders', methods=['GET'])
def get_orders():
    user_id = request.args.get('userID')
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if user_id:
        orders = cursor.execute('SELECT * FROM orders WHERE userID = ? ORDER BY timestamp DESC', (user_id,)).fetchall()
    else:
        orders = cursor.execute('SELECT * FROM orders ORDER BY timestamp DESC').fetchall()
    
    result = []
    for order in orders:
        result.append({
            'id': order['orderID'],
            'ticker': order['ticker'],
            'size': order['shares'],
            'status': order['status'],
            'type': order['type'],
            'executionType': order['executionType'],
            'price': order['price'],
            'timestamp': order['timestamp'],
            'userID': order['userID']
        })
    
    conn.close()
    return jsonify(result)

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    
    required_fields = ['ticker', 'size', 'type', 'executionType', 'price', 'userID']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Check if user exists
    user = cursor.execute('SELECT * FROM users WHERE userID = ?', (data['userID'],)).fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    # Validate order
    if data['type'] == 'Buy':
        # Check if user has enough balance
        total_cost = data['price'] * data['size']
        if user['account_balance'] < total_cost:
            conn.close()
            return jsonify({'error': 'Insufficient funds'}), 400
        
        # Update user balance
        cursor.execute('UPDATE users SET account_balance = account_balance - ? WHERE userID = ?', 
                      (total_cost, data['userID']))
    
    elif data['type'] == 'Sell':
        # Check if user has enough shares
        asset = cursor.execute('SELECT * FROM assets WHERE userID = ? AND ticker = ?', 
                             (data['userID'], data['ticker'])).fetchone()
        
        if not asset or asset['shares'] < data['size']:
            conn.close()
            return jsonify({'error': 'Insufficient shares'}), 400
    
    # Insert order with initial 'Processing' status
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute('''
    INSERT INTO orders (ticker, shares, status, type, executionType, price, timestamp, userID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (data['ticker'], data['size'], 'Processing', data['type'], data['executionType'], 
          data['price'], timestamp, data['userID']))
    
    order_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    # Return the created order
    return jsonify({
        'id': order_id,
        'ticker': data['ticker'],
        'size': data['size'],
        'status': 'Processing',
        'type': data['type'],
        'executionType': data['executionType'],
        'price': data['price'],
        'timestamp': timestamp,
        'userID': data['userID']
    })

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    data = request.json
    
    if 'status' not in data:
        return jsonify({'error': 'status is required'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get current order
    order = cursor.execute('SELECT * FROM orders WHERE orderID = ?', (order_id,)).fetchone()
    if not order:
        conn.close()
        return jsonify({'error': 'Order not found'}), 404
    
    # Update order status
    cursor.execute('UPDATE orders SET status = ? WHERE orderID = ?', (data['status'], order_id))
    
    # If order is now completed, update assets and balance for sell orders
    if data['status'] == 'Completed':
        user_id = order['userID']
        ticker = order['ticker']
        shares = order['shares']
        price = order['price']
        
        if order['type'] == 'Buy':
            # Add shares to user's assets
            asset = cursor.execute('SELECT * FROM assets WHERE userID = ? AND ticker = ?', 
                                 (user_id, ticker)).fetchone()
            
            if asset:
                cursor.execute('UPDATE assets SET shares = shares + ? WHERE assetID = ?',
                              (shares, asset['assetID']))
            else:
                cursor.execute('INSERT INTO assets (userID, ticker, shares) VALUES (?, ?, ?)',
                              (user_id, ticker, shares))
                
        elif order['type'] == 'Sell':
            # Remove shares from user's assets
            cursor.execute('UPDATE assets SET shares = shares - ? WHERE userID = ? AND ticker = ?',
                          (shares, user_id, ticker))
            
            # Add funds to user's balance
            total_amount = price * shares
            cursor.execute('UPDATE users SET account_balance = account_balance + ? WHERE userID = ?',
                          (total_amount, user_id))
            
            # Remove asset record if shares = 0
            cursor.execute('DELETE FROM assets WHERE userID = ? AND ticker = ? AND shares <= 0',
                          (user_id, ticker))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/assets', methods=['GET'])
def get_assets():
    user_id = request.args.get('userID')
    
    if not user_id:
        return jsonify({'error': 'userID is required'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    assets = cursor.execute('SELECT * FROM assets WHERE userID = ?', (user_id,)).fetchall()
    
    result = []
    for asset in assets:
        result.append({
            'assetID': asset['assetID'],
            'userID': asset['userID'],
            'ticker': asset['ticker'],
            'quantity': asset['shares']
        })
    
    conn.close()
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
