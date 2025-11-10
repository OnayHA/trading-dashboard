#!/bin/bash

# Script to fix user sync issues
# This will show you what's in localStorage vs database

echo "🔍 Verificando sincronización de usuario..."
echo ""

cd backend
source venv/bin/activate

python3 << 'EOF'
import sqlite3

conn = sqlite3.connect("data/trades_data/trading.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("SELECT username, email, phone FROM users")
users = cursor.fetchall()

print("📊 Usuarios en la base de datos:")
for user in users:
    print(f"   Username: {user['username']}")
    print(f"   Email: {user['email']}")
    print(f"   Phone: {user['phone']}")
    print("")

conn.close()
EOF

echo ""
echo "💡 Para arreglar la sincronización:"
echo "   1. Abre el navegador"
echo "   2. Abre las DevTools (F12)"
echo "   3. Ve a la pestaña 'Console'"
echo "   4. Ejecuta: localStorage.clear()"
echo "   5. Recarga la página (F5)"
echo "   6. Login con: Onay / [tu nueva contraseña]"
echo ""
