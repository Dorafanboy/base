import { createPublicClient, createWalletClient, http, PrivateKeyAccount, SimulateContractReturnType } from 'viem';
import { base } from 'viem/chains';
import { Config, MintFunConfig } from '../../../config';
import { printError, printInfo, printSuccess } from '../../../data/logger/logPrinter';
import { mintFunModuleName } from './mintFunData';
import { mintFunABI } from '../../../abis/mintFun';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { eeContractAddress } from '../../dexs/xyfinance/xyfinanceData';

export async function mintFun(account: PrivateKeyAccount) {
    printInfo(`Выполняю модуль ${mintFunModuleName}`);

    const client = createPublicClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const contract = MintFunConfig.contracts[Math.floor(Math.random() * MintFunConfig.contracts.length)];

    printInfo(`Буду минтить контракт: ${contract}`);

    const { request } = await client
        .simulateContract({
            address: contract,
            abi: mintFunABI,
            functionName: 'claim',
            args: [account.address, 1, eeContractAddress, 0, [[], 1, 0, eeContractAddress], '0x'],
            account: account,
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${mintFunModuleName} ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${mintFunModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(`✅${mintFunModuleName}: mint ${contract} <a href='${url}'>link</a>`);

        return true;
    }

    return false;
}
