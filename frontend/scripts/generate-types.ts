// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')

const execAsync = promisify(exec)

async function generateTypes() {
  try {
    // Criar diretório de tipos se não existir
    const typesDir = path.join(__dirname, '../src/contracts/types')
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true })
    }

    // Gerar tipos com TypeChain
    console.log('Gerando tipos...')
    await execAsync('npx typechain --target ethers-v6 --out-dir src/contracts/types "src/contracts/artifacts/**/*.json" --show-stack-traces')

    console.log('Tipos gerados com sucesso!')
  } catch (error) {
    console.error('Erro ao gerar tipos:', error)
    process.exit(1)
  }
}

generateTypes() 