
from decimal import Decimal
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Supabase client setup
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def convert_decimal_to_float(data):
    if isinstance(data, list):
        return [convert_decimal_to_float(item) for item in data]
    elif isinstance(data, dict):
        return {key: float(value) if isinstance(value, Decimal) else convert_decimal_to_float(value) if isinstance(value, (dict, list)) else value for key, value in data.items()}
    elif isinstance(data, Decimal):
        return float(data)
    return data

# User routes
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    username = data.get('username')
    initial_balance = data.get('initial_balance', 20)  # Default to 20 if not specified
    
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    if initial_balance < 0:
        return jsonify({"error": "Initial balance cannot be negative"}), 400
    
    try:
        # Call the RPC function to create a user
        response = supabase.rpc('create_user', {'p_username': username, 'initial_balance': initial_balance}).execute()
        
        return jsonify({"username": username, "balance": convert_decimal_to_float(initial_balance)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users/<string:username>/balance', methods=['PUT'])
def update_balance(username):
    data = request.json
    new_balance = data.get('balance')
    
    if new_balance is None or new_balance < 0:
        return jsonify({"error": "Invalid balance value"}), 400
    
    try:
        # Call the RPC function to update user balance
        response = supabase.rpc('update_user_balance', {
            'target_username': username, 
            'new_balance': new_balance
        }).execute()
        
        return jsonify({"username": username, "new_balance": convert_decimal_to_float(new_balance)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New route: Get User Balance via stored procedure
@app.route('/users/<string:username>/balance', methods=['GET'])
def get_balance(username):
    try:
        # Call the RPC function to get user balance
        response = supabase.rpc('get_user_balance', {'p_username': username}).execute()
        
        if not response.data:
            return jsonify({"error": "User not found"}), 404
        
        # Handle the response data properly
        # The response.data should be a single numeric value, not an object
        if isinstance(response.data, (int, float, Decimal)):
            balance = float(response.data)
            return jsonify({"username": username, "balance": balance}), 200
        else:
            print(f"Unexpected balance data type: {type(response.data)}, value: {response.data}")
            # Try to convert the data to a float if possible
            try:
                if isinstance(response.data, dict) and 'balance' in response.data:
                    balance = float(response.data['balance'])
                else:
                    balance = float(response.data)
                return jsonify({"username": username, "balance": balance}), 200
            except (ValueError, TypeError) as e:
                print(f"Error converting balance to float: {e}")
                return jsonify({"error": f"Invalid balance data: {response.data}"}), 500
    except Exception as e:
        print(f"Error in get_balance: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/users/<string:username>/portfolio', methods=['GET'])
def get_portfolio(username):
    try:
        # Query the user_account_info view
        response = supabase.table('app_user').select('*').eq('username', username).execute()
        
        if not response.data:
            return jsonify({"error": "User not found"}), 404
            
        user_summary = response.data[0]
        return jsonify({
            "user_summary": convert_decimal_to_float(user_summary)
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
    username = data.get('username')
    
    # Validate inputs
    if not all([ticker, shares, order_type, amount, username]):
        return jsonify({"error": "Missing required fields"}), 400
    
    if shares <= 0 or amount <= 0:
        return jsonify({"error": "Shares and amount must be positive"}), 400
    
    if order_type not in ['buy', 'sell']:
        return jsonify({"error": "Order type must be 'buy' or 'sell'"}), 400
    
    try:
        # Call the RPC function to create a parent order
        response = supabase.rpc('create_parent_order', {
            'p_ticker': ticker, 
            'p_shares': shares, 
            'p_type': order_type, 
            'p_amount': amount, 
            'p_username': username
        }).execute()
        
        # Get the ID of the newly created order
        order_query = supabase.table('parent_order').select('porderid').order('porderid', desc=True).limit(1).execute()
        order_id = order_query.data[0]['porderid'] if order_query.data else None
        
        return jsonify({
            "order_id": order_id,
            "ticker": ticker,
            "shares": shares,
            "type": order_type,
            "amount": convert_decimal_to_float(amount),
            "username": username
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/orders/child', methods=['POST'])
def create_child_order():
    data = request.json
    parent_order_id = data.get('parent_order_id')
    price = data.get('price')
    shares = data.get('shares')
    
    # Validate inputs
    if not all([parent_order_id, price, shares]):
        return jsonify({"error": "Missing required fields"}), 400
    
    if price <= 0 or shares <= 0:
        return jsonify({"error": "Price and shares must be positive"}), 400
    
    try:
        # Call the RPC function to create a child order
        response = supabase.rpc('create_child_order', {
            'p_porderid': parent_order_id, 
            'c_price': price, 
            'c_shares': shares
        }).execute()
        
        # Get the ID of the newly created child order
        child_query = supabase.table('child_order').select('corderid').order('corderid', desc=True).limit(1).execute()
        child_order_id = child_query.data[0]['corderid'] if child_query.data else None
        
        return jsonify({
            "child_order_id": child_order_id,
            "parent_order_id": parent_order_id,
            "price": convert_decimal_to_float(price),
            "shares": convert_decimal_to_float(shares)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/orders/child/<int:child_order_id>/complete', methods=['PUT'])
def complete_child_order(child_order_id):
    try:
        # Call the RPC function to complete a child order
        response = supabase.rpc('complete_child_order', {'in_corderid': child_order_id}).execute()
        
        return jsonify({"message": f"Child order {child_order_id} completed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/orders/parent/<int:parent_order_id>/complete', methods=['PUT'])
def complete_parent_order(parent_order_id):
    try:
        # Call the RPC function to complete a parent order
        response = supabase.rpc('complete_parent_order', {'in_porderid': parent_order_id}).execute()
        
        return jsonify({"message": f"Parent order {parent_order_id} completed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Data view routes
@app.route('/orders/active', methods=['GET'])
def get_active_orders():
    try:
        # Query the order_book view
        response = supabase.table('order_book').select('*').execute()
        orders = response.data
        
        return jsonify({"orders": convert_decimal_to_float(orders)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users/<string:username>/orders/status', methods=['GET'])
def get_user_order_status(username):
    try:
        # Query the user_order_status view
        response = supabase.table('user_order_status').select('*').eq('username', username).execute()
        orders = response.data
        
        return jsonify({"orders": convert_decimal_to_float(orders)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users/<string:username>/orders/history', methods=['GET'])
def get_user_order_history(username):
    try:
        # Query the user_completed_orders view
        response = supabase.table('user_completed_orders').select('*').eq('username', username).execute()
        orders = response.data
        
        # Transform the data to match the expected format in the frontend
        transformed_orders = []
        for order in orders:
            # Convert decimal values to float
            transformed_order = convert_decimal_to_float(order)
            
            # Add created_at field for compatibility with frontend
            if 'order_time' in transformed_order:
                transformed_order['created_at'] = transformed_order['order_time']
            
            # Add price field if it doesn't exist (calculate from amount and shares)
            if 'price' not in transformed_order and 'amount' in transformed_order and 'shares' in transformed_order:
                shares = float(transformed_order['shares'])
                if shares > 0:
                    transformed_order['price'] = float(transformed_order['amount']) / shares
                else:
                    transformed_order['price'] = 0
            
            transformed_orders.append(transformed_order)
        
        return jsonify({"orders": transformed_orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
