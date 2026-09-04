import json
import random
from datetime import datetime, timedelta

VENDORS = [
    {"id": "V001", "name": "TechCorp Solutions", "usual_amount": 5000},
    {"id": "V002", "name": "Global Shipping Ltd", "usual_amount": 15000},
    {"id": "V003", "name": "Office Supplies Inc", "usual_amount": 2000},
    {"id": "V004", "name": "Cloud Services Pro", "usual_amount": 8000},
    {"id": "V005", "name": "Marketing Agency X", "usual_amount": 12000},
    {"id": "VENDOR_BLOCKED_1", "name": "Suspicious Vendor", "usual_amount": 50000},
    {"id": "V007", "name": "Legal Services LLC", "usual_amount": 25000},
    {"id": "V008", "name": "Data Analytics Co", "usual_amount": 7000},
]

CATEGORIES = ["OPERATIONAL", "MARKETING", "SALARY", "INFRASTRUCTURE", "SERVICES"]
CURRENCIES = ["USD", "EUR", "GBP"]


def generate_transactions(count: int = 50) -> list:
    transactions = []
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(count):
        vendor = random.choice(VENDORS)
        
        if random.random() < 0.1:
            amount = vendor["usual_amount"] * random.uniform(3, 5)
        elif random.random() < 0.05:
            amount = -abs(vendor["usual_amount"] * 0.5)
        else:
            amount = vendor["usual_amount"] * random.uniform(0.5, 1.5)
        
        tx = {
            "id": f"TX{i+1:04d}",
            "amount": round(amount, 2),
            "currency": random.choice(CURRENCIES),
            "vendor": vendor["name"],
            "timestamp": (base_date + timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))).isoformat(),
            "category": random.choice(CATEGORIES),
            "counterparty_id": vendor["id"]
        }
        transactions.append(tx)
    
    return transactions


if __name__ == "__main__":
    transactions = generate_transactions(100)
    with open("sample_transactions.json", "w") as f:
        json.dump(transactions, f, indent=2)
    print(f"Generated {len(transactions)} transactions")
