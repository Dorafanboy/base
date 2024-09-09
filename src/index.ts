import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import readline from 'readline';
import { printError, printInfo, printSuccess } from './data/logger/logPrinter';
import { delay } from './data/helpers/delayer';
import {
    AlienSwapConfig,
    CoinEarningsMint,
    Config,
    DmailConfig,
    InchConfig,
    MintFunConfig,
    OkxData,
    OpenOceanConfig,
    PancakeConfig,
    PennyConfig,
    SushiConfig,
    TelegramData,
    XyFinanceConfig,
} from './config';
import {
    addTextMessage,
    initializeTelegramBot,
    resetTextMessage,
    sendMessage,
    stopTelegramBot,
} from './data/telegram/telegramBot';
import path from 'path';
import { IFunction } from './data/utils/interfaces';
import { withdrawAmount } from './data/okx/okx';
import { inchSwap } from './core/dexs/1inch/inch';
import { alienSwap } from './core/dexs/alienswap/alienswap';
import { openOceanSwap } from './core/dexs/openOcean/openOcean';
import { pancakeSwap } from './core/dexs/pancake/pancake';
import { sushiSwap } from './core/dexs/sushi/sushi';
import { xyFinanceSwap } from './core/dexs/xyfinance/xyfinance';
import { sendDmail } from './core/dmail/dmail';
import { coinEarningsMint } from './core/nfts/coinEarnings/coinEarnings';
import { pennyMint } from './core/nfts/penny/penny';
import { mintFun } from './core/nfts/mintFun/mintFun';

let account;

const privateKeysFilePath = path.join(__dirname, 'assets', 'private_keys.txt');
const privateKeysPath = fs.createReadStream(privateKeysFilePath);

const wordsFilePath = path.join(__dirname, 'assets', 'random_words.txt');
const words = fs.readFileSync(wordsFilePath).toString().split('\n');

const modules: { [key: string]: IFunction } = {
    inchModuleName: {
        func: inchSwap,
        isUse: InchConfig.isUse,
    },
    AlienSwap: {
        func: alienSwap,
        isUse: AlienSwapConfig.isUse,
    },
    OpenOcean: {
        func: openOceanSwap,
        isUse: OpenOceanConfig.isUse,
    },
    PancakeSwap: {
        func: pancakeSwap,
        isUse: PancakeConfig.isUse,
    },
    SushiSwap: {
        func: sushiSwap,
        isUse: SushiConfig.isUse,
    },
    XyFinance: {
        func: xyFinanceSwap,
        isUse: XyFinanceConfig.isUse,
    },
    Dmail: {
        func: (account) => sendDmail(account, words),
        isUse: DmailConfig.isUse,
        words,
    },
    'Coin Earnings Mint': {
        func: (account) => coinEarningsMint(account),
        isUse: CoinEarningsMint.isUse,
    },
    'Penny Mint': {
        func: (account) => pennyMint(account),
        isUse: PennyConfig.isUse,
    },
    'MintFun Mint': {
        func: (account) => mintFun(account),
        isUse: MintFunConfig.isUse,
    },
};

async function main() {
    await questWorkMode();
}

async function questWorkMode() {
    const filteredFunctions = Object.keys(modules)
        .filter((key) => modules[key].isUse)
        .map((key) => modules[key].func)
        .sort(() => Math.random() - 0.5);

    if (filteredFunctions.length == 0) {
        printError(`Нету модулей для запуска(Quest)`);
        throw `No modules`;
    }

    const rl = readline.createInterface({
        input: privateKeysPath,
        crlfDelay: Infinity,
    });

    let index = 0;

    const data = fs.readFileSync(privateKeysFilePath, 'utf8');

    const count = data.split('\n').length;
    await initializeTelegramBot(TelegramData.telegramBotId, TelegramData.telegramId);

    const keys = Object.keys(modules).filter((key) => modules[key].isUse);
    const functionsList = keys.join('\n');

    printInfo(`Были включены следующие модули:\n${functionsList}`);

    for await (const line of rl) {
        try {
            if (line == '') {
                printError(`Ошибка, пустая строка в файле private_keys.txt`);
                return;
            }

            if (Config.isShuffleWallets) {
                printInfo(`Произвожу перемешивание только кошельков.`);
                await shuffleData();

                printSuccess(`Кошельки успешно перемешаны.\n`);
            }

            account = privateKeyToAccount(<`0x${string}`>line);
            printInfo(`Start [${index + 1}/${count} - ${account.address}]\n`);

            await addTextMessage(`${index + 1}/${count} - ${account.address}\n`);

            await withdrawAmount(account.address, OkxData.bridgeData, OkxData.isUse);

            const modulesCount = Math.floor(
                Math.random() * (Config.modulesCount.maxRange - Config.modulesCount.minRange) +
                    Config.modulesCount.minRange,
            );

            printInfo(`Буду выполнять ${modulesCount} модулей на аккаунте\n`);

            printInfo(`Перемешал модули`);

            for (let i = 0; i < modulesCount; i++) {
                const randomFunction = filteredFunctions[Math.floor(Math.random() * filteredFunctions.length)];

                const result = await randomFunction(account, Math.random() < 0.5);

                if (i != modulesCount - 1) {
                    printInfo(`Осталось выполнить ${modulesCount - i - 1} модулей на аккаунте\n`);

                    if (result == true) {
                        await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
                    } else {
                        await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
                    }
                }
            }

            printSuccess(`Ended [${index + 1}/${count} - ${account.address}]\n`);

            await sendMessage();
            await resetTextMessage();

            fs.appendFile('src/assets/completed_accounts.txt', `${line}\n`, 'utf8', (err) => {
                if (err) {
                    printError(`Произошла ошибка при записи в файл: ${err}`);
                }
            });

            index++;

            if (index == count) {
                printSuccess(`Все аккаунты отработаны`);
                rl.close();
                await stopTelegramBot();
                return;
            }

            printInfo(`Ожидаю получение нового аккаунта`);
            await delay(Config.delayBetweenAccounts.minRange, Config.delayBetweenAccounts.maxRange, true);
        } catch (e) {
            printError(`Произошла ошибка при обработке строки: ${e}\n`);

            await addTextMessage(`❌Аккаунт отработал с ошибкой`);
            await sendMessage();
            await resetTextMessage();

            printInfo(`Ожидаю получение нового аккаунта`);
            await delay(Config.delayBetweenAccounts.minRange, Config.delayBetweenAccounts.maxRange, true);
            fs.appendFile('src/assets/uncompleted_accounts.txt', `${line}\n`, 'utf8', (err) => {
                if (err) {
                    printError(`Произошла ошибка при записи в файл: ${err}`);
                }
            });

            index++;
        }
    }
}

async function shuffleData() {
    try {
        const data = fs.readFileSync(privateKeysFilePath, 'utf8');
        const lines = data.split('\n');

        for (let i = lines.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lines[i], lines[j]] = [lines[j], lines[i]];
        }

        await fs.writeFileSync(privateKeysFilePath, lines.join('\n'), 'utf8');
    } catch (error) {
        printError(`Произошла ошибка во время перемешивания данных: ${error}`);
    }
}

main();
