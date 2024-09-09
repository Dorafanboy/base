import { createWalletClient, getAddress, http, PrivateKeyAccount } from 'viem';
import { prepareStage } from '../../../data/utils/utils';
import { base } from 'viem/chains';
import { Config } from '../../../config';
import { maverickModuleName, maverickPoolContractAddress, poolsAddress } from './maverickData';
import { maverickPositionABI } from '../../../abis/maverick/maverickPosition';

export async function maverickSwap(account: PrivateKeyAccount, isEth: boolean) {
    const prepareStageData = await prepareStage(maverickModuleName, isEth, account);

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const poolPath =
        `${prepareStageData.swapData?.srcToken?.name}-${prepareStageData.swapData?.dstToken?.name}` as keyof typeof poolsAddress;
    const address: string = poolsAddress[poolPath];

    const amount = await prepareStageData.client.simulateContract({
        address: maverickPoolContractAddress,
        abi: maverickPositionABI,
        functionName: 'calculateSwap',
        args: [
            address,
            Number(prepareStageData.swapData!.value),
            prepareStageData.swapData!.srcToken!.name == 'wETH',
            true,
            0,
        ],
    });

    console.log(amount);

    // const data = await sushiGetTransactionData(
    //     prepareStageData.client,
    //     {
    //         chainId: base.id,
    //         srcToken: prepareStageData.swapData!.srcToken!.contractAddress,
    //         dstToken: prepareStageData.swapData!.dstToken!.contractAddress,
    //         amount: prepareStageData.swapData!.value!,
    //         fromAddress: account.address,
    //     },
    //     account.address,
    // );
    //
    // const { request } = await prepareStageData.client
    //     .simulateContract({
    //         address: sushiContractAddress,
    //         abi: sushiABI,
    //         functionName: 'processRoute',
    //         args: [
    //             <`0x${string}`>prepareStageData.swapData!.srcToken!.contractAddress,
    //             BigInt(prepareStageData.swapData!.value.toString()),
    //             prepareStageData.swapData!.dstToken!.contractAddress,
    //             data.amountOutMin,
    //             account.address,
    //             data.route,
    //         ],
    //         account: account,
    //         value:
    //             prepareStageData.swapData!.srcToken!.name == 'wETH'
    //                 ? BigInt(prepareStageData.swapData!.value)
    //                 : BigInt(0),
    //     })
    //     .then((result) => result as SimulateContractReturnType)
    //     .catch((e) => {
    //         printError(`Произошла ошибка во время выполнения модуля ${sushiModuleName} ${e}`);
    //         return { request: undefined };
    //     });
    //
    // if (request !== undefined) {
    //     const hash = await walletClient.writeContract(request).catch((e) => {
    //         printError(`Произошла ошибка во время выполнения модуля ${sushiModuleName} ${e}`);
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
    //         `✅${sushiModuleName}: swap ${formatUnits(prepareStageData.swapData!.value!, isEth ? 18 : 6)} ${prepareStageData.swapData!.srcToken!.name} -> ${prepareStageData.swapData!.dstToken!.name} <a href='${url}'>link</a>`,
    //     );
    //
    //     return true;
    // }

    return false;
}
