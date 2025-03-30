
from decimal import Decimal
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection function
def get_db_connection():
    #print(os.getenv('DB_NAME'))
    mydb = mysql.connector.connect(
        host="localhost",
        user="pranav",
        passwd="pranav1234",
        database="trading_db"
    )
    return mydb


def convert_decimal_to_float(data):
    if isinstance(data, list):
        return [convert_decimal_to_float(item) for item in data]
    elif isinstance(data, dict):
        return {key: float(value) if isinstance(value, Decimal) else value for key, value in data.items()}
    return data

# User routes
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    initial_balance = data.get('initial_balance', 0)
    
    if initial_balance < 0:
        return jsonify({"error": "Initial balance cannot be negative"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.callproc('create_user', [initial_balance])
        conn.commit()
        
        # Get the user ID of the newly created user
        cursor.execute("SELECT LAST_INSERT_ID()")
        user_id = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({"user_id": user_id, "balance": convert_decimal_to_float(initial_balance)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users/<int:user_id>/balance', methods=['PUT'])
def update_balance(user_id):
    data = request.json
    new_balance = data.get('balance')
    
    if new_balance is None or new_balance < 0:
        return jsonify({"error": "Invalid balance value"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.callproc('update_user_balance', [user_id, new_balance])
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"user_id": user_id, "new_balance": convert_decimal_to_float(new_balance)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users/<int:user_id>/portfolio', methods=['GET'])
def get_portfolio(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('get_user_account_info', [user_id])
        
        # Get user summary from the first result set
        user_summary = None
        for result in cursor.stored_results():
            user_summary = result.fetchone()
            break
        
        # Get asset details from the second result set
        cursor.callproc('get_user_account_info', [user_id])
        asset_details = []
        results = list(cursor.stored_results())
        if len(results) > 1:
            asset_details = results[1].fetchall()
        
        cursor.close()
        conn.close()
        
        if not user_summary:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "user_summary": convert_decimal_to_float(user_summary),
            "asset_details": convert_decimal_to_float(asset_details)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Order routes
@app.route('/orders/parent', methods=['POST'])
def create_parent_order():
    data = request.json
    ticker = data.get('ticker')
    shares = data.get('shares')
    order_type = data.get('type')  # 'buy' or 'sell'
    amount = data.get('amount')
    user_id = data.get('user_id')
    
    # Validate inputs
    if not all([ticker, shares, order_type, amount, user_id]):
        return jsonify({"error": "Missing required fields"}), 400
    
    if shares <= 0 or amount <= 0:
        return jsonify({"error": "Shares and amount must be positive"}), 400
    
    if order_type not in ['buy', 'sell']:
        return jsonify({"error": "Order type must be 'buy' or 'sell'"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.callproc('create_parent_order', [ticker, shares, order_type, amount, user_id])
        conn.commit()
        
        # Get the ID of the newly created order
        cursor.execute("SELECT LAST_INSERT_ID()")
        order_id = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "order_id": order_id,
            "ticker": ticker,
            "shares": shares,
            "type": order_type,
            "amount": convert_decimal_to_float(amount),
            "user_id": user_id
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/orders/child', methods=['POST'])
def create_child_order():
    data = request.json
    parent_order_id = data.get('parent_order_id')
    price = data.get('price')
    shares = data.get('shares')
    amount = data.get('amount')
    
    # Validate inputs
    if not all([parent_order_id, price, shares, amount]):
        return jsonify({"error": "Missing required fields"}), 400
    
    if price <= 0 or shares <= 0 or amount <= 0:
        return jsonify({"error": "Price, shares, and amount must be positive"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.callproc('create_child_order', [parent_order_id, price, shares, amount])
        conn.commit()
        
        # Get the ID of the newly created child order
        cursor.execute("SELECT LAST_INSERT_ID()")
        child_order_id = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "child_order_id": child_order_id,
            "parent_order_id": parent_order_id,
            "price": convert_decimal_to_float(price),
            "shares": convert_decimal_to_float(shares),
            "amount": convert_decimal_to_float(amount)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/orders/child/<int:child_order_id>/complete', methods=['PUT'])
def complete_child_order(child_order_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.callproc('complete_child_order', [child_order_id])
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": f"Child order {child_order_id} completed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/orders/parent/<int:parent_order_id>/complete', methods=['PUT'])
def complete_parent_order(parent_order_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.callproc('complete_parent_order', [parent_order_id])
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": f"Parent order {parent_order_id} completed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Data view routes
@app.route('/orders/active', methods=['GET'])
def get_active_orders():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM order_book")
        orders = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"orders": convert_decimal_to_float(orders)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users/<int:user_id>/orders/status', methods=['GET'])
def get_user_order_status(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user_order_status WHERE userID = %s", (user_id,))
        orders = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"orders": convert_decimal_to_float(orders)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users/<int:user_id>/orders/history', methods=['GET'])
def get_user_order_history(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user_completed_orders WHERE userID = %s", (user_id,))
        orders = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"orders": convert_decimal_to_float(orders)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
