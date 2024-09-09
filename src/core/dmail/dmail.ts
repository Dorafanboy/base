import { createPublicClient, createWalletClient, http, PrivateKeyAccount, SimulateContractReturnType } from 'viem';
import { base } from 'viem/chains';
import { dmailContractAddress, dmailModuleName, domains } from './dmailData';
import crypto from 'crypto';
import { printError, printInfo, printSuccess } from '../../data/logger/logPrinter';
import { Config, DmailConfig } from '../../config';
import { dmailABI } from '../../abis/dmail';
import { addTextMessage } from '../../data/telegram/telegramBot';
import { IDmailData } from '../../data/utils/interfaces';

export async function sendDmail(account: PrivateKeyAccount, words: string[]) {
    printInfo(`Выполняю модуль ${dmailModuleName}`);

    const client = createPublicClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    printInfo(`Вызываю функцию Send_Mail`);

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const data = getTransactionData(words);

    const nonce = await client.getTransactionCount({ address: account.address });
    const transferRequest = await client
        .simulateContract({
            address: dmailContractAddress,
            abi: dmailABI,
            functionName: 'send_mail',
            account: account,
            args: [data.to, data.amount],
            nonce: nonce,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${dmailModuleName} - ${e}`);
            return { transferRequest: undefined };
        });

    if (transferRequest !== undefined && 'request' in transferRequest) {
        const hash = await walletClient.writeContract(transferRequest!.request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${dmailModuleName} - ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(`✅${dmailModuleName} - Send_Mail <a href='${url}'>link</a>`);
    }

    return true;
}

function getTransactionData(words: string[]): IDmailData {
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const randomName = Math.random().toString(36).substring(2, 10);
    const to = randomName + randomDomain;

    const randomAmount = getRandomSentence(DmailConfig.wordsCount, words);

    const toHashed = crypto.createHash('sha256').update(to).digest('hex');
    const amountHashed = crypto.createHash('sha256').update(randomAmount).digest('hex');

    return {
        to: toHashed,
        amount: amountHashed,
    };
}

function getRandomSentence(wordCount: number[], dictionary: string[]) {
    const minRange = Math.min(...wordCount);
    const maxRange = Math.max(...wordCount);
    const randomNum = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;

    const randomWords = [];
    for (let i = 0; i < randomNum; i++) {
        const randomIndex = Math.floor(Math.random() * dictionary.length);
        randomWords.push(dictionary[randomIndex].trim());
    }

    const sentence = randomWords.join(' ');

    return sentence.trim();
}
