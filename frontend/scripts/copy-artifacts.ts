// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import * as fs from 'fs'
import * as path from 'path'

function copyArtifacts(): void {
  try {
    // Criar diretório de artefatos se não existir
    const artifactsDir = path.join(__dirname, '../src/contracts/artifacts')
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true })
    }

    // Copiar artefatos do diretório raiz
    const rootArtifactsDir = path.join(__dirname, '../../artifacts/contracts')
    if (!fs.existsSync(rootArtifactsDir)) {
      console.error('Diretório de artefatos não encontrado. Execute `npx hardhat compile` primeiro.')
      process.exit(1)
    }

    // Copiar recursivamente
    copyRecursive(rootArtifactsDir, artifactsDir)
    console.log('Artefatos copiados com sucesso!')
  } catch (error) {
    console.error('Erro ao copiar artefatos:', error)
    process.exit(1)
  }
}

function copyRecursive(src: string, dest: string): void {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && typeof stats !== 'boolean' && stats.isDirectory()

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
    }
    fs.readdirSync(src).forEach(function(childItemName: string) {
      const srcPath = path.join(src, childItemName)
      const destPath = path.join(dest, childItemName)
      
      if (fs.statSync(srcPath).isDirectory()) {
        copyRecursive(srcPath, destPath)
      } else if (childItemName.endsWith('.json') && !childItemName.endsWith('.dbg.json')) {
        fs.copyFileSync(srcPath, destPath)
      }
    })
  }
}

copyArtifacts() 