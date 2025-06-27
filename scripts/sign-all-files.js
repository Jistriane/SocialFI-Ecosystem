#!/usr/bin/env node

/**
 * Script para assinar todos os arquivos do projeto SocialFI Ecosystem.
 * - Insere assinatura padrão no topo de arquivos de texto/código.
 * - Gera/atualiza SIGNATURES.txt para arquivos binários.
 * - Não duplica assinatura se já existir.
 * - Atualiza manifesto sempre que um arquivo binário for alterado.
 *
 * Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
 * Criado do zero por mim. Removal of this notice is prohibited for 10 years.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SIGNATURE = `Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>\nCriado do zero por mim. Removal of this notice is prohibited for 10 years.`;
const SIGNATURE_LINE = 'Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>';
const MANIFEST = 'SIGNATURES.txt';

const EXCLUDE_DIRS = ['node_modules', '.git', 'cache', 'dist', 'build-info', '.next', 'artifacts', 'storage', 'logs'];
const TEXT_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.sol', '.sh', '.yml', '.yaml', '.css', '.scss', '.html', '.txt', '.env', '.conf', '.config', '.lock', '.d.ts', '.gitignore', '.eslintrc', '.prettierrc', '.babelrc', '.dockerignore', '.npmrc', '.env-dev', '.env-prod', '.env-homolog'];

function isTextFile(file) {
    const ext = path.extname(file).toLowerCase();
    return TEXT_EXTENSIONS.includes(ext) || file.startsWith('.') || file.endsWith('rc') || file.endsWith('ignore');
}

function getCommentBlock(file) {
    const ext = path.extname(file).toLowerCase();
    if ([".js", ".ts", ".tsx", ".jsx", ".sol"].includes(ext)) {
        return `// ${SIGNATURE.replace(/\n/g, '\n// ')}`;
    }
    if ([".sh", ".env", ".conf", ".config"].includes(ext) || file.startsWith('.')) {
        return `# ${SIGNATURE.replace(/\n/g, '\n# ')}`;
    }
    if ([".md", ".html"].includes(ext)) {
        return `<!--\n${SIGNATURE}\n-->`;
    }
    if ([".json", ".yml", ".yaml", ".lock"].includes(ext)) {
        return `/*\n${SIGNATURE}\n*/`;
    }
    // Default fallback
    return `# ${SIGNATURE.replace(/\n/g, '\n# ')}`;
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

function signTextFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    if (!hasSignature(content)) {
        const comment = getCommentBlock(file);
        content = `${comment}\n\n${content}`;
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Assinado: ${file}`);
    }
}

function hashFile(file) {
    const buffer = fs.readFileSync(file);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return hash;
}

function updateManifest(binFiles) {
    let manifest = '';
    if (fs.existsSync(MANIFEST)) {
        manifest = fs.readFileSync(MANIFEST, 'utf8');
    }
    const lines = manifest.split(/\r?\n/).filter(Boolean);
    const entries = {};
    lines.forEach(line => {
        const [hash, file, ...rest] = line.split(' ');
        entries[file] = line;
    });
    binFiles.forEach(file => {
        const hash = hashFile(file);
        const entry = `${hash} ${file} jistriane Brunielli Silva de Oliveira <jistriane@live.com> Criado do zero por mim. Removal of this notice is prohibited for 10 years.`;
        entries[file] = entry;
    });
    const newManifest = Object.values(entries).join('\n') + '\n';
    fs.writeFileSync(MANIFEST, newManifest, 'utf8');
    console.log(`Manifesto atualizado: ${MANIFEST}`);
}

function main() {
    const allFiles = walk('.');
    const binFiles = [];
    allFiles.forEach(file => {
        if (file === MANIFEST) return;
        if (isTextFile(file)) {
            try {
                signTextFile(file);
            } catch (e) {
                console.warn(`Erro ao assinar ${file}: ${e.message}`);
            }
        } else {
            binFiles.push(file);
        }
    });
    if (binFiles.length > 0) {
        updateManifest(binFiles);
    }
}

main();