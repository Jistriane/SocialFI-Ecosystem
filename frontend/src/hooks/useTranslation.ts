// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { useLocale } from '../contexts/LocaleContext';

// Importar todos os arquivos de tradução
import commonPtBR from '../locales/pt-BR/common.json';
import trustchainPtBR from '../locales/pt-BR/trustchain.json';
import tradeconnectPtBR from '../locales/pt-BR/tradeconnect.json';
import govgamePtBR from '../locales/pt-BR/govgame.json';

import commonEn from '../locales/en/common.json';
import trustchainEn from '../locales/en/trustchain.json';
import tradeconnectEn from '../locales/en/tradeconnect.json';
import govgameEn from '../locales/en/govgame.json';

// Definir tipos
type TranslationKey = string;
type TranslationValue = string;
type TranslationNamespace = 'common' | 'trustchain' | 'tradeconnect' | 'govgame';

interface TranslationResult {
    t: (key: TranslationKey, variables?: Record<string, string>) => TranslationValue;
}

// Mapa de traduções
const translations = {
    'pt-BR': {
        common: commonPtBR,
        trustchain: trustchainPtBR,
        tradeconnect: tradeconnectPtBR,
        govgame: govgamePtBR,
    },
    'en': {
        common: commonEn,
        trustchain: trustchainEn,
        tradeconnect: tradeconnectEn,
        govgame: govgameEn,
    },
};

export function useTranslation(namespace: TranslationNamespace): TranslationResult {
    const { locale, t: contextT } = useLocale();

    const getTranslation = (key: TranslationKey, variables?: Record<string, string>): TranslationValue => {
        try {
            let translation = contextT(key, namespace);
            
            // Substituir variáveis se fornecidas
            if (variables && typeof translation === 'string') {
                Object.entries(variables).forEach(([varKey, varValue]) => {
                    translation = translation.replace(`{{${varKey}}}`, varValue);
                });
            }
            
            return translation;
        } catch (error) {
            console.error(`Error getting translation for ${key}:`, error);
            return key;
        }
    };

    return {
        t: getTranslation,
    };
} 