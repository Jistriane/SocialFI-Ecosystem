# Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
# Criado do zero por mim. Removal of this notice is prohibited for 10 years.

#!/bin/bash

echo "🔍 === MONITORAMENTO AUTOMÁTICO METIS ==="
echo "📍 Verificando saldo a cada 1 minuto..."
echo "⏰ Iniciado em: $(date)"
echo "🛑 Para parar: Ctrl+C"
echo ""

contador=1
max_tentativas=20  # 20 minutos máximo

while [ $contador -le $max_tentativas ]; do
    echo "⏱️  Tentativa $contador/$max_tentativas ($(date +%H:%M:%S))"
    
    # Executar verificação
    resultado=$(npx hardhat run scripts/simple-monitor.js --network metis_sepolia 2>&1)
    
    echo "$resultado"
    
    # Verificar se encontrou saldo
    if echo "$resultado" | grep -q "SALDO DETECTADO"; then
        echo ""
        echo "🎉 SUCESSO! Saldo encontrado!"
        echo "🚀 Execute: npm run deploy:metis"
        break
    fi
    
    if [ $contador -eq $max_tentativas ]; then
        echo ""
        echo "⏰ Tempo limite atingido (20 minutos)"
        echo "💡 Verifique manualmente:"
        echo "- https://hyperion-testnet-explorer.metisdevops.link/address/0xFE36288a99141E0C72F67E8116272fA8Aeb66F8A"
        break
    fi
    
    echo "⏳ Aguardando 1 minuto..."
    echo "----------------------------------------"
    sleep 60
    
    contador=$((contador + 1))
done

echo ""
echo "🏁 Monitoramento finalizado em: $(date)" 