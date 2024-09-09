import { createWalletClient, formatUnits, http, PrivateKeyAccount } from 'viem';
import { prepareStage } from '../../../data/utils/utils';
import { base } from 'viem/chains';
import { Config } from '../../../config';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { openOceanContractAddress, openOceanModuleName, openOceanSlippage } from './openOceanData';
import { eeContractAddress } from '../xyfinance/xyfinanceData';
import { IOpenOceanData } from '../../../data/utils/interfaces';
import { openOceanGetTransactionData } from './openOceanRequester';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { alienSwapModuleName } from '../alienswap/alienswapData';

export async function openOceanSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(openOceanModuleName, isEth, account);

    if (prepareStageData.swapData?.value == BigInt(-1)) {
        printError(`Не удалось произвести swap ${openOceanModuleName}`);
        return false;
    }

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const inTokenName =
        prepareStageData.swapData?.srcToken?.name == 'USDbC' ? 'USDBC' : prepareStageData.swapData?.srcToken?.name;

    const outTokenName =
        prepareStageData.swapData?.dstToken?.name == 'USDbC' ? 'USDBC' : prepareStageData.swapData?.dstToken?.name;

    const newFromContractAddress =
        prepareStageData.swapData?.srcToken?.name == 'wETH'
            ? eeContractAddress
            : prepareStageData.swapData?.srcToken?.contractAddress;

    const newToContractAddress =
        prepareStageData.swapData?.dstToken?.name == 'wETH'
            ? eeContractAddress
            : prepareStageData.swapData?.dstToken?.contractAddress;

    const gasPrice = await prepareStageData.client.getGasPrice();

    const quoteParams: IOpenOceanData = {
        inTokenSymbol: inTokenName,
        inTokenAddress: newFromContractAddress,
        outTokenSymbol: outTokenName,
        outTokenAddress: newToContractAddress,
        amount: prepareStageData.swapData?.value.toString(),
        gasPrice: gasPrice,
        disabledDexIds: '',
        slippage: openOceanSlippage,
        account: account.address,
    };

    const txData = await openOceanGetTransactionData(quoteParams);

    const preparedTransaction = await walletClient.prepareTransactionRequest({
        account,
        to: openOceanContractAddress,
        data: txData,
        value:
            prepareStageData.swapData!.srcToken!.name == 'wETH' ? BigInt(prepareStageData.swapData!.value) : BigInt(0),
    });

    const signature = await walletClient.signTransaction(preparedTransaction).catch((e) => {
        printError(`Произошла ошибка во время выполнения модуля ${openOceanModuleName} ${e}`);
        return undefined;
    });

    if (signature !== undefined) {
        const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${openOceanModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${openOceanModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, prepareStageData.swapData!.srcToken?.decimals!)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
