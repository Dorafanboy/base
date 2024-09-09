import { createWalletClient, encodeFunctionData, formatUnits, http, PrivateKeyAccount, zeroAddress } from 'viem';
import { prepareStage } from '../../../data/utils/utils';
import { base } from 'viem/chains';
import { Config } from '../../../config';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { pancakeFactory, pancakeModuleName, pancakeQuoter, pancakeRouter, pancakeSlippage } from './pancakeData';
import { pancakeRouterABI } from '../../../abis/pancake/pancakeRouter';
import { pancakeFactoryABI } from '../../../abis/pancake/pancakeFactory';
import { pancakeQuoterABI } from '../../../abis/pancake/pancakeQuoter';
import console from 'console';
import { openOceanModuleName } from '../openOcean/openOceanData';

export async function pancakeSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(pancakeModuleName, isEth, account);

    if (prepareStageData.swapData?.value == BigInt(-1)) {
        printError(`Не удалось произвести swap ${pancakeModuleName}`);
        return false;
    }

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const pool = await prepareStageData.client.readContract({
        address: pancakeFactory,
        abi: pancakeFactoryABI,
        functionName: 'getPool',
        args: [
            prepareStageData.swapData?.srcToken?.contractAddress,
            prepareStageData.swapData?.dstToken?.contractAddress,
            500,
        ],
    });

    if (pool == zeroAddress) {
        printError(
            `Не найден путь ${prepareStageData.swapData?.srcToken?.name} -> ${prepareStageData.swapData?.dstToken?.name}`,
        );
        return false;
    }

    const minAmountOut = (await prepareStageData.client.readContract({
        address: pancakeQuoter,
        abi: pancakeQuoterABI,
        functionName: 'quoteExactInputSingle',
        args: [
            [
                prepareStageData.swapData?.srcToken?.contractAddress,
                prepareStageData.swapData?.dstToken?.contractAddress,
                prepareStageData.swapData?.value.toString(),
                500,
                0,
            ],
        ],
    })) as bigint[];

    const amountOut = minAmountOut[0] - minAmountOut[0] / BigInt(100 * pancakeSlippage);

    const block = await prepareStageData.client.getBlock();
    const deadline = block.timestamp + BigInt(1200);

    const inputSingleData = encodeFunctionData({
        abi: pancakeRouterABI,
        functionName: 'exactInputSingle',
        args: [
            [
                prepareStageData.swapData?.srcToken?.contractAddress,
                prepareStageData.swapData?.dstToken?.contractAddress,
                500,
                prepareStageData.swapData?.srcToken?.name == 'wETH'
                    ? account.address
                    : '0x0000000000000000000000000000000000000002',
                prepareStageData.swapData?.value.toString(),
                amountOut,
                0,
            ],
        ],
    });

    let unwrapData = '0x';

    if (prepareStageData.swapData?.dstToken?.name == 'wETH') {
        unwrapData = encodeFunctionData({
            abi: pancakeRouterABI,
            functionName: 'unwrapWETH9',
            args: [amountOut, account.address],
        });
    }

    const results =
        (prepareStageData.swapData?.dstToken?.name == 'wETH') == false
            ? encodeFunctionData({
                  abi: pancakeRouterABI,
                  functionName: 'multicall',
                  args: [deadline, [inputSingleData]],
              })
            : encodeFunctionData({
                  abi: pancakeRouterABI,
                  functionName: 'multicall',
                  args: [deadline, [inputSingleData, unwrapData]],
              });

    const preparedTransaction = await walletClient.prepareTransactionRequest({
        account,
        to: pancakeRouter,
        data: results,
        value:
            prepareStageData.swapData!.srcToken!.name == 'wETH' ? BigInt(prepareStageData.swapData!.value) : BigInt(0),
    });

    const signature = await walletClient.signTransaction(preparedTransaction).catch((e) => {
        printError(`Произошла ошибка во время выполнения делегирование BGT на STATION - ${e}`);
        return undefined;
    });

    if (signature !== undefined) {
        const hash = await walletClient.sendRawTransaction({ serializedTransaction: signature }).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${pancakeModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${pancakeModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, prepareStageData.swapData!.srcToken?.decimals!)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
        );
    }

    return true;
}
