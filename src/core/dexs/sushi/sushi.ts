import { createWalletClient, formatUnits, http, PrivateKeyAccount, SimulateContractReturnType } from 'viem';
import { prepareStage } from '../../../data/utils/utils';
import { Config } from '../../../config';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { sushiContractAddress, sushiModuleName } from './sushiData';
import { sushiGetTransactionData } from './sushiRequester';
import { base } from 'viem/chains';
import { sushiABI } from '../../../abis/sushi';
import { eeContractAddress } from '../xyfinance/xyfinanceData';
import { pancakeModuleName } from '../pancake/pancakeData';

export async function sushiSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(sushiModuleName, isEth, account);

    if (prepareStageData.swapData?.value == BigInt(-1)) {
        printError(`Не удалось произвести swap ${sushiModuleName}`);
        return false;
    }

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const newFromContractAddress =
        prepareStageData.swapData?.srcToken?.name == 'wETH'
            ? eeContractAddress
            : prepareStageData.swapData?.srcToken?.contractAddress;

    const newToContractAddress =
        prepareStageData.swapData?.dstToken?.name == 'wETH'
            ? eeContractAddress
            : prepareStageData.swapData?.dstToken?.contractAddress;

    const data = await sushiGetTransactionData(
        prepareStageData.client,
        {
            chainId: base.id,
            srcToken: <`0x${string}`>newFromContractAddress,
            dstToken: <`0x${string}`>newToContractAddress,
            amount: prepareStageData.swapData!.value!,
            fromAddress: account.address,
        },
        account.address,
    );

    const { request } = await prepareStageData.client
        .simulateContract({
            address: sushiContractAddress,
            abi: sushiABI,
            functionName: 'processRoute',
            args: [
                <`0x${string}`>newFromContractAddress,
                BigInt(prepareStageData.swapData!.value.toString()),
                <`0x${string}`>newToContractAddress,
                data.amountOutMin,
                account.address,
                data.route,
            ],
            account: account,
            value:
                prepareStageData.swapData!.srcToken!.name == 'wETH'
                    ? BigInt(prepareStageData.swapData!.value)
                    : BigInt(0),
        })
        .then((result) => result as SimulateContractReturnType)
        .catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${sushiModuleName} ${e}`);
            return { request: undefined };
        });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${sushiModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${sushiModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, prepareStageData.swapData!.srcToken?.decimals!)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
