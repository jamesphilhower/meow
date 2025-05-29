import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:3000/api"

# Test data
CUSTOMER_IDS = [
    "550e8400-e29b-41d4-a716-446655440001",  # Alice
    "550e8400-e29b-41d4-a716-446655440002",  # Bob
    "550e8400-e29b-41d4-a716-446655440003",  # Charlie
]

created_accounts = []

def log(message, data=None):
    """Simple logging with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")
    if data:
        print(f"         → {json.dumps(data, indent=2)}")
    print()

def test_create_accounts():
    """Test creating accounts with initial deposits"""
    log("🏦 Testing account creation...")
    
    accounts_data = [
        {"customerId": CUSTOMER_IDS[0], "initialDepositAmount": 1000},  # Alice - $1000
        {"customerId": CUSTOMER_IDS[0], "initialDepositAmount": 500},   # Alice - $500 (second account)
        {"customerId": CUSTOMER_IDS[1], "initialDepositAmount": 2000},  # Bob - $2000
        {"customerId": CUSTOMER_IDS[2], "initialDepositAmount": 0},     # Charlie - $0
    ]
    
    for i, account_data in enumerate(accounts_data):
        response = requests.post(f"{BASE_URL}/accounts", json=account_data)
        
        if response.status_code == 201:
            data = response.json()['data']
            created_accounts.append(data)
            log(f"✅ Created account #{i+1}", {
                "accountNumber": data['accountNumber'],
                "customerId": data['customerId'],
                "initialDeposit": account_data['initialDepositAmount']
            })
        else:
            log(f"❌ Failed to create account #{i+1}", response.json())
    
    return created_accounts

def test_get_balances():
    """Test retrieving account balances"""
    log("💰 Testing balance retrieval...")
    
    for account in created_accounts:
        response = requests.get(f"{BASE_URL}/accounts/{account['id']}/balance")
        
        if response.status_code == 200:
            data = response.json()['data']
            log(f"✅ Balance for {account['accountNumber']}", {
                "balance": data['balance'],
                "formatted": data['formatted']
            })
        else:
            log(f"❌ Failed to get balance for {account['accountNumber']}", response.json())

def test_transfers():
    """Test money transfers between accounts"""
    log("💸 Testing transfers...")
    
    if len(created_accounts) < 3:
        log("❌ Not enough accounts to test transfers")
        return
    
    transfers = [
        {
            "from": created_accounts[0],  # Alice's first account
            "to": created_accounts[2],    # Bob's account
            "amount": 250,
            "description": "Payment to Bob"
        },
        {
            "from": created_accounts[2],  # Bob's account
            "to": created_accounts[3],    # Charlie's account
            "amount": 100,
            "description": "Gift to Charlie"
        },
        {
            "from": created_accounts[1],  # Alice's second account
            "to": created_accounts[0],    # Alice's first account
            "amount": 200,
            "description": "Transfer between own accounts"
        }
    ]
    
    for transfer in transfers:
        transfer_data = {
            "fromAccountId": transfer['from']['id'],
            "toAccountId": transfer['to']['id'],
            "amount": transfer['amount'],
            "description": transfer['description']
        }
        
        response = requests.post(f"{BASE_URL}/transfers", json=transfer_data)
        
        if response.status_code == 200:
            log(f"✅ Transfer successful", {
                "from": transfer['from']['accountNumber'],
                "to": transfer['to']['accountNumber'],
                "amount": transfer['amount'],
                "description": transfer['description']
            })
        else:
            log(f"❌ Transfer failed", response.json())
    
    # Test insufficient funds
    log("🚫 Testing insufficient funds...")
    bad_transfer = {
        "fromAccountId": created_accounts[3]['id'],  # Charlie's account (should have $100)
        "toAccountId": created_accounts[0]['id'],
        "amount": 500,  # More than Charlie has
        "description": "This should fail"
    }
    
    response = requests.post(f"{BASE_URL}/transfers", json=bad_transfer)
    if response.status_code == 400:
        log("✅ Correctly rejected transfer with insufficient funds", response.json())
    else:
        log("❌ Should have rejected insufficient funds transfer", response.json())

def test_transaction_history():
    """Test retrieving transaction history"""
    log("📜 Testing transaction history...")
    
    for account in created_accounts[:2]:  # Just test first two accounts
        response = requests.get(f"{BASE_URL}/accounts/{account['id']}/transactions")
        
        if response.status_code == 200:
            data = response.json()['data']
            log(f"✅ Transaction history for {account['accountNumber']}", {
                "transactionCount": data['count'],
                "transactions": len(data['transactions'])
            })
            
            # Show first transaction detail if any
            if data['transactions']:
                first_tx = data['transactions'][0]
                log(f"   Latest transaction", {
                    "type": first_tx['type'],
                    "amount": first_tx['amount'],
                    "direction": first_tx['direction'],
                    "description": first_tx.get('description', 'N/A')
                })
        else:
            log(f"❌ Failed to get transactions for {account['accountNumber']}", response.json())

def test_final_balances():
    """Check final balances after all transfers"""
    log("🏁 Final balance check...")
    
    for account in created_accounts:
        response = requests.get(f"{BASE_URL}/accounts/{account['id']}/balance")
        
        if response.status_code == 200:
            data = response.json()['data']
            log(f"Account {account['accountNumber']}: {data['formatted']}")

def main():
    """Run all tests"""
    print("=" * 60)
    print("🚀 Banking API Test Suite")
    print("=" * 60)
    print()
    
    try:
        # Run tests in sequence
        test_create_accounts()
        time.sleep(0.5)  # Small delay between tests
        
        test_get_balances()
        time.sleep(0.5)
        
        test_transfers()
        time.sleep(0.5)
        
        test_transaction_history()
        time.sleep(0.5)
        
        test_final_balances()
        
        print("=" * 60)
        print("✨ All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        log("❌ Could not connect to API. Is the server running on http://localhost:3000?")
    except Exception as e:
        log(f"❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()