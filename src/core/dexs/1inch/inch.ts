import { createWalletClient, formatUnits, http, PrivateKeyAccount } from 'viem';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { Config } from '../../../config';
import { base } from 'viem/chains';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { inchModuleName } from './inchData';
import { prepareStage } from '../../../data/utils/utils';
import { getTransactionData } from './inchRequester';
import { delay } from '../../../data/helpers/delayer';

export async function inchSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(inchModuleName, isEth, account);

    if (prepareStageData.swapData?.value == BigInt(-1)) {
        printError(`Не удалось произвести swap ${inchModuleName}`);
        return false;
    }

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const newFromContractAddress =
        prepareStageData.swapData?.srcToken?.name == 'wETH'
            ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
            : prepareStageData.swapData?.srcToken?.contractAddress;

    const newToContractAddress =
        prepareStageData.swapData?.dstToken?.name == 'wETH'
            ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
            : prepareStageData.swapData?.dstToken?.contractAddress;

    const transactionData = await getTransactionData({
        chainId: base.id,
        srcToken: <`0x${string}`>newFromContractAddress,
        dstToken: <`0x${string}`>newToContractAddress,
        amount: prepareStageData.swapData!.value!,
        fromAddress: account.address,
    });

    if (transactionData.data.length == 146) {
        printError(`Произошла ошибка во время получения данных транзакции(${inchModuleName})(длинна 146)`);
        await delay(1, 2, false);
        await inchSwap(account, isEth);
        return false;
    }

    const preparedTransaction = await walletClient.prepareTransactionRequest({
        account,
        to: transactionData.to,
        data: transactionData.data,
        value: BigInt(transactionData.value),
    }); // крч вызывать эту функцию опять ну запрос пока не выдаст норм дату и сработает все

    const signature = await walletClient.signTransaction(preparedTransaction).catch((e) => {
        printError(`Произошла ошибка во время выполнения модуля ${inchModuleName} ${e}`);
        return undefined;
    });

    if (signature !== undefined) {
        const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${inchModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${inchModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, prepareStageData.swapData!.srcToken?.decimals!)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
