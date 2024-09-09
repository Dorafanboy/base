import { createPublicClient, createWalletClient, http, PrivateKeyAccount, SimulateContractReturnType } from 'viem';
import { base } from 'viem/chains';
import { Config } from '../../../config';
import { printError, printInfo, printSuccess } from '../../../data/logger/logPrinter';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { eeContractAddress } from '../../dexs/xyfinance/xyfinanceData';
import { coinEarningsContractAddress, coinEarningsModuleName, zeroBytes } from './coinEarningsData';
import { coinEarningsABI } from '../../../abis/coinEarnings';

export async function coinEarningsMint(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль ${coinEarningsModuleName}`);

    const client = createPublicClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    printInfo(`Буду минтить контракт: ${coinEarningsContractAddress}`);

    const { request } = await client
        .simulateContract({
            address: coinEarningsContractAddress,
            abi: coinEarningsABI,
            functionName: 'claim',
            args: [account.address, 0, 1, eeContractAddress, 0, [[zeroBytes], 2, 0, eeContractAddress], '0x'],
            account: account,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${coinEarningsModuleName} ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${coinEarningsModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${coinEarningsModuleName}: mint ${coinEarningsContractAddress} <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
