import { createWalletClient, formatUnits, http, PrivateKeyAccount, zeroAddress } from 'viem';
import { prepareStage } from '../../../data/utils/utils';
import { inchModuleName } from '../1inch/inchData';
import { base } from 'viem/chains';
import { Config } from '../../../config';
import { getTransactionData } from '../1inch/inchRequester';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { baseSwapContractAddress } from './baseSwapData';
import { baseSwapABI } from '../../../abis/baseSwap';
import { baseSwapGetQuote } from './baseSwapRequester';

export async function baseSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(inchModuleName, isEth, account);

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const data = await baseSwapGetQuote({
        chainId: base.id,
        inputTokens: [
            {
                tokenAddress:
                    prepareStageData.swapData!.srcToken!.name == 'wETH'
                        ? zeroAddress
                        : prepareStageData.swapData!.srcToken!.contractAddress,
                amount: prepareStageData.swapData!.value!.toString(),
            },
        ],
        outputTokens: [
            {
                tokenAddress: prepareStageData.swapData!.dstToken!.contractAddress,
                proportion: 1,
            },
        ],
        userAddr: account.address,
    });

    console.log(data);

    // const transactionData = await getTransactionData({
    //     chainId: base.id,
    //     srcToken: prepareStageData.swapData!.srcToken!.contractAddress,
    //     dstToken: prepareStageData.swapData!.dstToken!.contractAddress,
    //     amount: prepareStageData.swapData!.value!,
    //     fromAddress: account.address,
    // });
    //
    // const preparedTransaction = await walletClient.prepareTransactionRequest({
    //     account,
    //     to: transactionData.to,
    //     data: transactionData.data,
    //     value: transactionData.value,
    // });
    //
    // const signature = await walletClient.signTransaction(preparedTransaction).catch((e) => {
    //     printError(`Произошла ошибка во время выполнения модуля ${inchModuleName} ${e}`);
    //     return undefined;
    // });
    //
    // if (signature !== undefined) {
    //     const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
    //         printError(`Произошла ошибка во время выполнения модуля ${inchModuleName} ${e}`);
    //         return false;
    //     });
    //
    //     if (hash == false) {
    //         return false;
    //     }
    //
    //     const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;
    //
    //     printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);
    //
    //     await addTextMessage(
    //         `✅${inchModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, isEth ? 18 : 6)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
    //     );
    //
    //     return true;
    // }

    return false;
}
