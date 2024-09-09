import { createWalletClient, formatUnits, http, PrivateKeyAccount } from 'viem';
import { prepareStage } from '../../../data/utils/utils';
import { base } from 'viem/chains';
import { Config } from '../../../config';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { eeContractAddress, xyFinanceModuleName, xyFinanceSlippage } from './xyfinanceData';
import { xyFinanceGetQuote, xyFinanceGetTxData } from './xyfinanceRequester';
import { IXyFinanceBuildTxData } from '../../../data/utils/interfaces';

export async function xyFinanceSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(xyFinanceModuleName, isEth, account);

    if (prepareStageData.swapData?.value == BigInt(-1)) {
        printError(`Не удалось произвести swap ${xyFinanceModuleName}`);
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

    const quoteParams: IXyFinanceBuildTxData = {
        srcChainId: base.id,
        srcQuoteTokenAddress: <`0x${string}`>newFromContractAddress,
        srcQuoteTokenAmount: prepareStageData.swapData?.value.toString(),
        dstChainId: base.id,
        dstQuoteTokenAddress: <`0x${string}`>newToContractAddress,
        slippage: xyFinanceSlippage,
        commissionRate: 0,
        affiliate: '0x018B1751A6F4Ec773faF8e1a24Ed0C3b271e538c',
    };

    const quote = await xyFinanceGetQuote(quoteParams);

    quoteParams.receiver = account.address;
    quoteParams.srcSwapProvider = quote;

    const txData = await xyFinanceGetTxData(quoteParams);

    console.log(txData);
    const preparedTransaction = await walletClient.prepareTransactionRequest({
        account,
        to: txData.to,
        data: txData.data,
        value: BigInt(txData.value),
    });

    const signature = await walletClient.signTransaction(preparedTransaction).catch((e) => {
        printError(`Произошла ошибка во время выполнения модуля ${xyFinanceModuleName} ${e}`);
        return undefined;
    });

    if (signature !== undefined) {
        const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${xyFinanceModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${xyFinanceModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, prepareStageData.swapData!.srcToken?.decimals!)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
