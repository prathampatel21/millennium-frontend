from decimal import Decimal
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import requests

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
        return {key: convert_decimal_to_float(value) for key, value in data.items()}
    elif isinstance(data, Decimal):
        return float(data)
    else:
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
            
        # If Supabase returned a list with 1 dict:
        raw_balance = response.data
        if isinstance(raw_balance, list) and len(raw_balance) > 0:
            balance = raw_balance[0].get('balance')
        else:
            balance = None
        
        return jsonify({"username": username, "balance": convert_decimal_to_float(balance)}), 200
    except Exception as e:
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
    amount = data.get('amount')    # Now this is just price per share, not total cost
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
        # Note: amount now represents price per share
        response = supabase.rpc('create_parent_order', {
            'p_ticker': ticker, 
            'p_shares': shares, 
            'p_type': order_type, 
            'p_amount': amount,  # This is now just the price per share 
            'p_username': username
        }).execute()
        
        # Get the ID of the newly created order
        order_query = supabase.table('parent_order').select('porderid').order('porderid', desc=True).limit(1).execute()
        order_id = order_query.data[0]['porderid'] if order_query.data else None
        
        parent_order_payload = {
            "order_id": order_id,
            "ticker": ticker,
            "shares": shares,
            "type": order_type,
            "amount": convert_decimal_to_float(amount),  # Now just the price per share
            "username": username
        }

        relay_url = "http://127.0.0.1:5000/relayToSpringBoot"
        requests.post(relay_url, json=parent_order_payload)
        return jsonify(parent_order_payload), 201
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
    
@app.route('/users/<string:username>/holdings', methods=['GET'])
def get_user_holdings(username):
    try:
        # Query the user_stock_holdings view
        response = supabase.table('user_stock_holdings').select('*').eq('username', username).execute()
        holdings = response.data
        
        return jsonify({"holdings": convert_decimal_to_float(holdings)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/springMessage', methods=['GET'])
def spring_message():
    return jsonify({"message": "Hello from Flask!"}), 200

@app.route('/messageFromSpring', methods=['POST'])
def receive_spring_message():
    data = request.json
    message = data.get('message')

    if not message:
        return jsonify({"error": "No message provided"}), 400

    print(f"Received message from Spring Boot: {message}")
    
    response_message = f"Flask received your message: '{message}'"
    return jsonify({"response": response_message}), 200

@app.route('/relayToSpringBoot', methods=['POST'])
def relay_to_springboot():
    data = request.json

    import requests

    try:
        spring_url = "http://localhost:8081/receiveParentOrder"
        headers = {"Content-Type": "application/json"}
        spring_response = requests.post(spring_url, json=data, headers=headers)

        if spring_response.status_code != 200:
            return jsonify({"error": f"Failed to notify Spring Boot: {spring_response.text}"}), 500

        return jsonify({"status": "success", "spring_response": spring_response.json()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/orderMatchedFromSpring', methods=['POST'])
def order_completed_from_spring():
    data = request.json
    print("✅ Flask received order completion notice:", data)

    order_id = data.get("order_id")
    username = data.get("username")
    amount_action = data.get("amountAction")  # match key exactly

    if not order_id or not username or amount_action is None:
        return jsonify({"error": "Missing required fields"}), 400

    try:

        # Call Supabase RPC to mark parent order completed
        print('hi, below is the order id')
        print(order_id)
        response = supabase.rpc("complete_parent_order", {
            "in_porderid": int(order_id)
        }).execute()
        print(response)

        # STEP 1: Fetch current balance from your own Flask route
        balance_response = requests.get(f"http://127.0.0.1:5000/users/{username}/balance")
        balance_data = balance_response.json()

        if "balance" not in balance_data:
            return jsonify({"error": "Could not retrieve current balance"}), 500

        current_balance = float(balance_data["balance"])

        # STEP 2: Calculate new balance
        new_balance = current_balance + (float(amount_action) * 2)

        # STEP 3: Update balance using the existing PUT route
        update_response = requests.put(
            f"http://127.0.0.1:5000/users/{username}/balance",
            json={"balance": new_balance},
            headers={"Content-Type": "application/json"}
        )

        if update_response.status_code != 200:
            return jsonify({"error": "Failed to update balance"}), 500

        return jsonify({
            "status": "✅ Parent order marked as completed and balance updated.",
            "username": username,
            "old_balance": current_balance,
            "amount_added": amount_action,
            "new_balance": new_balance
        }), 200
    except Exception as e:
        print("❌ Failed to update status or balance:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
