import { createPublicClient, createWalletClient, http, PrivateKeyAccount, SimulateContractReturnType } from 'viem';
import { base } from 'viem/chains';
import { Config } from '../../../config';
import { printError, printInfo, printSuccess } from '../../../data/logger/logPrinter';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { pennyContractAddress, pennyModuleName } from './pennyData';
import { pennyABI } from '../../../abis/penny';

export async function pennyMint(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль ${pennyModuleName}`);

    const client = createPublicClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    printInfo(`Буду минтить ${pennyModuleName} контракт: ${pennyContractAddress}`);

    const { request } = await client
        .simulateContract({
            address: pennyContractAddress,
            abi: pennyABI,
            functionName: 'mint',
            account: account,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${pennyModuleName} ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${pennyModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(`✅${pennyModuleName}: mint ${pennyContractAddress} <a href='${url}'>link</a>`);

        return true;
    }

    return false;
}
