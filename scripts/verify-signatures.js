#!/usr/bin/env node

/**
 * Script para verificar assinaturas em todos os arquivos do projeto SocialFI Ecosystem.
 * - Verifica se arquivos de texto/código possuem assinatura padrão no topo.
 * - Verifica se arquivos binários/imagens estão corretamente listados no SIGNATURES.txt com hash SHA256 correto.
 * - Retorna erro (process.exit(1)) se encontrar qualquer violação, listando os arquivos problemáticos.
 *
 * Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
 * Criado do zero por mim. Removal of this notice is prohibited for 10 years.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SIGNATURE_LINE = 'Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>';
const MANIFEST = 'SIGNATURES.txt';
const EXCLUDE_DIRS = ['node_modules', '.git', 'cache', 'dist', 'build-info', '.next', 'artifacts', 'storage', 'logs'];
const TEXT_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.sol', '.sh', '.yml', '.yaml', '.css', '.scss', '.html', '.txt', '.env', '.conf', '.config', '.lock', '.d.ts', '.gitignore', '.eslintrc', '.prettierrc', '.babelrc', '.dockerignore', '.npmrc', '.env-dev', '.env-prod', '.env-homolog'];

function isTextFile(file) {
    const ext = path.extname(file).toLowerCase();
    return TEXT_EXTENSIONS.includes(ext) || file.startsWith('.') || file.endsWith('rc') || file.endsWith('ignore');
}

function walk(dir, fileList = []) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file)) {
                walk(filePath, fileList);
            }
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

function hasSignature(content) {
    return content.includes(SIGNATURE_LINE);
}

function hashFile(file) {
    const buffer = fs.readFileSync(file);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return hash;
}

function loadManifest() {
    if (!fs.existsSync(MANIFEST)) return {};
    const lines = fs.readFileSync(MANIFEST, 'utf8').split(/\r?\n/).filter(Boolean);
    const entries = {};
    lines.forEach(line => {
        const [hash, file, ...rest] = line.split(' ');
        entries[file] = { hash, line };
    });
    return entries;
}

function main() {
    const allFiles = walk('.');
    const manifest = loadManifest();
    let ok = true;
    const missingSignature = [];
    const missingManifest = [];
    const wrongHash = [];

    allFiles.forEach(file => {
        if (file === MANIFEST) return;
        if (isTextFile(file)) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                if (!hasSignature(content)) {
                    missingSignature.push(file);
                    ok = false;
                }
            } catch (e) {
                console.warn(`Erro ao ler ${file}: ${e.message}`);
            }
        } else {
            // Binário
            const hash = hashFile(file);
            if (!manifest[file]) {
                missingManifest.push(file);
                ok = false;
            } else if (manifest[file].hash !== hash) {
                wrongHash.push(file);
                ok = false;
            }
        }
    });

    if (missingSignature.length > 0) {
        console.error('Arquivos de texto/código sem assinatura:');
        missingSignature.forEach(f => console.error('  ' + f));
    }
    if (missingManifest.length > 0) {
        console.error('Arquivos binários não listados no manifesto:');
        missingManifest.forEach(f => console.error('  ' + f));
    }
    if (wrongHash.length > 0) {
        console.error('Arquivos binários com hash divergente do manifesto:');
        wrongHash.forEach(f => console.error('  ' + f));
    }

    if (!ok) {
        process.exit(1);
    } else {
        console.log('Todas as assinaturas e manifesto estão corretos!');
    }
}

main();