import { IBridgeRange, IDelayRange, IFixedRange, IOkx, IToken } from './data/utils/interfaces';
import { Hex } from 'viem';

export class OkxAuth {
    public static readonly okxApiKey: string = ''; // ясно что это
    public static readonly okxApiSecret: string = ''; // ясно что это
    public static readonly okxApiPassword: string = ''; // ясно что это из env подтягивтаь потом
}

export class TelegramData {
    public static readonly telegramBotId: string = ''; // айди телеграм бота, которому будут отправляться логи
    public static readonly telegramId: string = ''; // телеграм айди @my_id_bot у него можно получить id
}

export class OkxData {
    public static readonly isUse: boolean = false; // использовать ли Okx в софте
    public static readonly bridgeData: IOkx[] = [
        {
            okxFee: '0.00004',
            chainName: 'ETH-Base',
            networkName: 'Base',
            tokenName: 'ETH',
            withdraw: { minRange: 0.002, maxRange: 0.004 },
            randomFixed: { minRange: 5, maxRange: 7 },
            withdrawStart: '0.5',
        },
    ];

    public static readonly delayAfterWithdraw: IBridgeRange = { minRange: 3, maxRange: 4 }; // сколько ожидать времени (в минутах) после вывода с окекса
}

export class Config {
    public static readonly isShuffleWallets: boolean = true; // перемешивать ли строки в текстовом файле для приватных ключей
    public static readonly isShuffleSubaccs: boolean = false; // перемешивать ли субсчета в текстовом файле
    public static readonly isUseSubaccs: boolean = true; // если использовать субакки, то бабки будут выводиться на субакки после прогона(англбридж)
    public static readonly isLoadState: boolean = false; // загружать ли текущее состояние работы из базы данных
    public static readonly modulesCount: IBridgeRange = { minRange: 6, maxRange: 13 }; // сколько будет модулей выполнено на аккаунте
    public static readonly retryCount: number = 15; // сколько попыток будет, чтобы получить новую сеть, значение для бриджа
    public static readonly delayBetweenAction: IDelayRange = { minRange: 2.2, maxRange: 4 }; // задержка между действиями (в секундах) в случае ошибки
    public static readonly delayBetweenAccounts: IDelayRange = { minRange: 30, maxRange: 45 }; // задержка между аккаунтами (в минутах)
    public static readonly delayBetweenModules: IDelayRange = { minRange: 1.5, maxRange: 3.5 }; // задержка между модулями (в минутах)
    public static readonly rpc = 'https://rpc.ankr.com/base'; // rpc
}

export const tokensPool: IToken[] = [
    {
        name: 'wETH',
        contractAddress: '0x4200000000000000000000000000000000000006',
        decimals: 18,
    },
    {
        name: 'USDbC',
        contractAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
        decimals: 6,
    },
    {
        name: 'USDC',
        contractAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        decimals: 6,
    },
    {
        name: 'DAI',
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
        decimals: 18,
    },
];

export class InchConfig {
    public static readonly isUse: boolean = true; // использовать ли 1inch swap
    public static readonly apiKey: string = 'Kz9BSwixnRRxislFmb45Ewyd0tvu9iEj'; // https://portal.1inch.dev/ api key
    public static readonly ethSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.0004, maxRange: 0.0007 },
        fixed: { minRange: 4, maxRange: 6 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
    public static readonly stableSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.6, maxRange: 1.2 },
        fixed: { minRange: 2, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
}

export class SushiConfig {
    public static readonly isUse: boolean = true; // использовать ли sushi swap
    public static readonly ethSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.0004, maxRange: 0.0007 },
        fixed: { minRange: 4, maxRange: 6 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
    public static readonly stableSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.6, maxRange: 1.2 },
        fixed: { minRange: 2, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
}

export class MaverickConfig {
    public static readonly isUse: boolean = true; // использовать ли sushi swap
    public static readonly ethSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.0004, maxRange: 0.0007 },
        fixed: { minRange: 4, maxRange: 6 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
    public static readonly stableSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.6, maxRange: 1.2 },
        fixed: { minRange: 2, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
}

export class PancakeConfig {
    public static readonly isUse: boolean = true; // использовать ли sushi swap
    public static readonly ethSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.0004, maxRange: 0.0007 },
        fixed: { minRange: 4, maxRange: 6 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
    public static readonly stableSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.6, maxRange: 1.2 },
        fixed: { minRange: 2, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
}

export class AlienSwapConfig {
    public static readonly isUse: boolean = true; // использовать ли sushi swap
    public static readonly ethSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.0004, maxRange: 0.0007 },
        fixed: { minRange: 4, maxRange: 6 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
    public static readonly stableSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.6, maxRange: 1.2 },
        fixed: { minRange: 2, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
}

export class XyFinanceConfig {
    public static readonly isUse: boolean = false; // использовать ли sushi swap
    public static readonly ethSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.0004, maxRange: 0.0007 },
        fixed: { minRange: 4, maxRange: 6 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
    public static readonly stableSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.6, maxRange: 1.2 },
        fixed: { minRange: 2, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
}

export class OpenOceanConfig {
    public static readonly isUse: boolean = true; // использовать ли sushi swap
    public static readonly ethSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.0004, maxRange: 0.0007 },
        fixed: { minRange: 4, maxRange: 6 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
    public static readonly stableSwapRange: { range: IBridgeRange; fixed: IFixedRange } = {
        range: { minRange: 0.6, maxRange: 1.2 },
        fixed: { minRange: 2, maxRange: 5 },
    }; // сколько usdc/usdt будет забриджено(будет поиск баланса в usdt и usdc
}

export class DmailConfig {
    public static readonly isUse: boolean = true;
    public static readonly wordsCount: number[] = [5, 11]; // количество слов в сообщении
}

export class CoinEarningsMint {
    public static readonly isUse: boolean = true;
}

export class PennyConfig {
    public static readonly isUse: boolean = true;
}

export class MintFunConfig {
    public static readonly isUse: boolean = true;
    public static readonly contracts: Hex[] = [
        '0x5b51Cf49Cb48617084eF35e7c7d7A21914769ff1',
        '0xC5c37d8286fd07FDa1eFfd0E2fbC8849E1cFd27b',
        '0x3aD1a7C0569A78BFCF3B49274bAb872a10070AD8',
        '0x0B7D6491A44bc47259D8918fBbBD08609E942967',
        '0xB3Da098a7251A647892203e0C256b4398d131a54',
        '0xc07a47493b5421E5EAb172e59E9f145b61bDCE9A',
        '0xBCDAdD5780c5c80Ec53544AE96b3c8Af9F9550cf',
        '0xc649989246FAa59bBefA7c65551cc4461E823320',
    ]; // адреса для минта, только с функцией claim
}
