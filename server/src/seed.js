const db = require('./db/database');

const vendors = [
  { id: 'V001', name: 'TechCorp Solutions', usual: 5000 },
  { id: 'V002', name: 'Global Shipping Ltd', usual: 15000 },
  { id: 'V003', name: 'Office Supplies Inc', usual: 2000 },
  { id: 'V004', name: 'Cloud Services Pro', usual: 8000 },
  { id: 'V005', name: 'Marketing Agency X', usual: 12000 },
  { id: 'VENDOR_BLOCKED_1', name: 'Suspicious Vendor', usual: 50000 },
  { id: 'V007', name: 'Legal Services LLC', usual: 25000 },
  { id: 'V008', name: 'Data Analytics Co', usual: 7000 }
];

const categories = ['OPERATIONAL', 'MARKETING', 'SALARY', 'INFRASTRUCTURE', 'SERVICES'];
const currencies = ['USD', 'EUR', 'GBP'];

function generateTransactions(count = 50) {
  const transactions = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    let amount;

    if (Math.random() < 0.1) {
      amount = vendor.usual * (3 + Math.random() * 2);
    } else if (Math.random() < 0.05) {
      amount = -Math.abs(vendor.usual * 0.5);
    } else {
      amount = vendor.usual * (0.5 + Math.random());
    }

    transactions.push({
      id: `TX${String(i + 1).padStart(4, '0')}`,
      amount: Math.round(amount * 100) / 100,
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      vendor: vendor.name,
      timestamp: new Date(now - Math.random() * 30 * day).toISOString(),
      category: categories[Math.floor(Math.random() * categories.length)],
      counterparty_id: vendor.id
    });
  }

  return transactions;
}

function seed() {
  const transactions = generateTransactions(50);
  const insert = db.prepare('INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?,?)');
  const insertAlert = db.prepare('INSERT OR IGNORE INTO alerts (type, severity, message, transaction_id, timestamp, status) VALUES (?,?,?,?,?,?)');

  const transaction = db.transaction((txs) => {
    for (const tx of txs) {
      insert.run(tx.id, tx.amount, tx.currency, tx.vendor, tx.timestamp, tx.category, tx.counterparty_id);
      if (tx.amount > 10000) {
        insertAlert.run('HIGH_AMOUNT', 'HIGH', `Large transaction $${tx.amount} from ${tx.vendor}`, tx.id, new Date().toISOString(), 'active');
      }
    }
  });

  transaction(transactions);
  console.log(`✓ Seeded ${transactions.length} transactions`);
}

module.exports = seed;
