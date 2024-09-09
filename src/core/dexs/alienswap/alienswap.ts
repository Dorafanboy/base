import { createWalletClient, formatUnits, http, PrivateKeyAccount, SimulateContractReturnType } from 'viem';
import { prepareStage } from '../../../data/utils/utils';
import { base } from 'viem/chains';
import { Config } from '../../../config';
import { alienSwapContractAddress, alienSwapModuleName, alienSwapSlippage } from './alienswapData';
import { alienswapABI } from '../../../abis/alienswap';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { addTextMessage } from '../../../data/telegram/telegramBot';
import { inchModuleName } from '../1inch/inchData';

export async function alienSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(alienSwapModuleName, isEth, account);

    if (prepareStageData.swapData?.value == BigInt(-1)) {
        printError(`Не удалось произвести swap ${alienSwapModuleName}`);
        return false;
    }

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const minAmountOut = (await prepareStageData.client.readContract({
        address: alienSwapContractAddress,
        abi: alienswapABI,
        functionName: 'getAmountsOut',
        args: [
            prepareStageData.swapData?.value.toString(),
            [
                prepareStageData.swapData?.srcToken?.contractAddress,
                prepareStageData.swapData?.dstToken?.contractAddress,
            ],
        ],
    })) as bigint[];

    const amountOut = minAmountOut[1] - minAmountOut[1] / BigInt(100 * alienSwapSlippage);

    const block = await prepareStageData.client.getBlock();
    const deadline = block.timestamp + BigInt(1000000);

    const { request } = isEth
        ? await prepareStageData.client
              .simulateContract({
                  address: alienSwapContractAddress,
                  abi: alienswapABI,
                  functionName: 'swapExactETHForTokens',
                  args: [
                      amountOut,
                      [
                          prepareStageData.swapData?.srcToken?.contractAddress,
                          prepareStageData.swapData?.dstToken?.contractAddress,
                      ],
                      account.address,
                      deadline,
                  ],
                  account: account,
                  value: BigInt(prepareStageData.swapData!.value),
              })
              .then((result) => result as SimulateContractReturnType)
              .catch((e) => {
                  printError(`Произошла ошибка во время выполнения модуля ${alienSwapModuleName} ${e}`);
                  return { request: undefined };
              })
        : await prepareStageData.client
              .simulateContract({
                  address: alienSwapContractAddress,
                  abi: alienswapABI,
                  functionName: 'swapExactTokensForETH',
                  args: [
                      BigInt(prepareStageData.swapData!.value),
                      amountOut,
                      [
                          prepareStageData.swapData?.srcToken?.contractAddress,
                          prepareStageData.swapData?.dstToken?.contractAddress,
                      ],
                      account.address,
                      deadline,
                  ],
                  account: account,
              })
              .then((result) => result as SimulateContractReturnType)
              .catch((e) => {
                  printError(`Произошла ошибка во время выполнения модуля ${alienSwapModuleName} ${e}`);
                  return { request: undefined };
              });

    if (request !== undefined) {
        const hash = await walletClient.writeContract(request).catch((e) => {
            printError(`Произошла ошибка во время выполнения модуля ${alienSwapModuleName} ${e}`);
            return false;
        });

        if (hash == false) {
            return false;
        }

        const url = `${base.blockExplorers?.default.url + '/tx/' + hash}`;

        printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

        await addTextMessage(
            `✅${alienSwapModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, prepareStageData.swapData!.srcToken?.decimals!)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
        );

        return true;
    }

    return false;
}
