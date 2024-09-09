import { IBridgeRange, IFixedRange, IPreparedStageData, ISwapData, IToken } from './interfaces';
import {
    createPublicClient,
    createWalletClient,
    formatUnits,
    Hex,
    http,
    parseEther,
    parseUnits,
    PrivateKeyAccount,
    PublicClient,
    SimulateContractReturnType,
    WalletClient,
} from 'viem';
import { Config, tokensPool } from '../../config';
import { delay } from '../helpers/delayer';
import { printError, printInfo, printSuccess } from '../logger/logPrinter';
import { erc20ABI } from '../../abis/erc20';
import { base } from 'viem/chains';
import { stagesData } from './utilsData';

export async function getValue(
    client: PublicClient,
    address: Hex,
    bridgeRange: IBridgeRange,
    fixedRange: IFixedRange,
    decimals: number,
    tokenBalance: bigint = BigInt(-1),
): Promise<bigint> {
    const balance = tokenBalance == BigInt(-1) ? await getBridgeBalance(client, address) : tokenBalance;

    let value = 0,
        fixed,
        currentTry = 0;
    let weiValue: bigint = parseEther('0');

    if (balance == parseEther('0')) {
        return BigInt(-1);
    }

    while (weiValue > balance || weiValue == parseEther('0')) {
        if (currentTry < Config.retryCount) {
            value = Math.random() * (bridgeRange.maxRange - bridgeRange.minRange) + bridgeRange.minRange;
            fixed = Math.floor(Math.random() * (fixedRange.maxRange - fixedRange.minRange) + fixedRange.minRange);

            weiValue = parseUnits(value.toFixed(fixed), decimals);

            if (weiValue > balance) {
                printInfo(
                    `Полученное значение для свапа ${value.toFixed(
                        fixed,
                    )} больше чем баланс ${Number(formatUnits(balance, decimals)).toFixed(fixed)}`,
                );

                currentTry++;
                await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
            } else {
                return weiValue;
            }
        } else {
            printInfo(`Не было найдено необходимого кол-во средств для свапа в сети ${client.chain?.name}\n`);

            return BigInt(-1);
        }
    }

    return weiValue;
}

export async function getBridgeBalance(client: PublicClient, address: Hex) {
    const balance = await client.getBalance({
        address: address,
    });

    await checkZeroBalance(client, balance);

    return balance;
}

async function checkZeroBalance(client: PublicClient, balance: bigint, tokenName: string = '') {
    if (balance == parseEther('0')) {
        printInfo(`Баланс аккаунта в токене ${tokenName} сети ${client.chain?.name} равен нулю\n`);

        await delay(1, 2, false);

        return parseEther('0');
    }
}

export async function giveApprove(
    client: PublicClient,
    walletClient: WalletClient,
    account: PrivateKeyAccount,
    token: IToken,
    spender: Hex,
    value: bigint,
) {
    const allowance = await client.readContract({
        address: token.contractAddress,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [account.address, spender],
    });

    if (allowance < BigInt(value!)) {
        printInfo(`Произвожу approve ${formatUnits(value!, token.decimals)} ${token.name}`);

        const { request } = await client
            .simulateContract({
                address: token.contractAddress,
                abi: erc20ABI,
                functionName: 'approve',
                args: [spender, value!],
                account: account,
            })
            .then((request) => request as unknown as SimulateContractReturnType)
            .catch((e) => {
                printError(`Произошла ошибка во время выполнения approve ${token.name} - ${e}`);
                return { request: undefined };
            });

        if (request !== undefined && request.account !== undefined) {
            const approveHash = await walletClient.writeContract(request).catch((e) => {
                printError(`Произошла ошибка во время выполнения approve ${token.name} - ${e}`);
                return false;
            });

            if (approveHash === false) {
                return false;
            }

            const url = `${base.blockExplorers?.default.url + '/tx/' + approveHash}`;

            printSuccess(`Транзакция успешно отправлена. Хэш транзакции: ${url}\n`);

            await delay(Config.delayBetweenModules.minRange, Config.delayBetweenModules.maxRange, true);
        }
    }
}

export async function getSwapBalance(client: PublicClient, address: Hex, tokenAddress: Hex, tokenName: string = '') {
    const balance = await client.readContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [address],
    });

    await checkZeroBalance(client, parseUnits(balance.toString(), 0), tokenName);

    return balance;
}

export async function getSwapData(
    isEth: boolean,
    client: PublicClient,
    address: Hex,
    moduleName: string,
    range: IBridgeRange,
    fixed: IFixedRange,
    ethMinRange?: string,
    stableMinRange?: string,
): Promise<ISwapData> {
    let currentTry: number = 0,
        value;

    while (currentTry <= Config.retryCount) {
        if (currentTry == Config.retryCount) {
            printError(
                `Не нашел баланс для свапа в ${moduleName}. Превышено количество попыток - [${currentTry}/${Config.retryCount}]\n`,
            );
            return {
                value: BigInt(-1),
                srcToken: null,
                dstToken: null,
            };
        }

        const srcToken = await findTokenWithBalance(client, address, isEth, ethMinRange!, stableMinRange!);
        if (srcToken == null) {
            printError(`Не нашел баланс для свапа в ${moduleName}.`);
            return {
                value: BigInt(-1),
                srcToken: null,
                dstToken: null,
            };
        }

        const dstToken = await getRandomToken(srcToken.name);

        const balance =
            srcToken.name == 'wETH' ? BigInt(-1) : await getSwapBalance(client, address, srcToken.contractAddress);

        value = await getValue(client, address, range, fixed, srcToken.decimals, balance);

        printInfo(
            `Пытаюсь произвести свап в сети ${client.chain?.name} на сумму ${formatUnits(value, srcToken.decimals)} ${srcToken.name} -> ${dstToken.name}`,
        );

        currentTry++;

        if (value != BigInt(-1)) {
            return {
                value: value,
                srcToken: srcToken,
                dstToken: dstToken,
            };
        } else {
            await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
        }
    }

    return {
        value: BigInt(-1),
        srcToken: null,
        dstToken: null,
    };
}

async function findTokenWithBalance(
    client: PublicClient,
    address: string,
    isEth: boolean,
    ethMinRange: string,
    stableMinRange: string,
): Promise<IToken | null> {
    tokensPool.sort(() => Math.random() - 0.5);

    if (isEth) {
        const token = tokensPool.find((token) => token.name === 'wETH')!;

        const balance = await getBridgeBalance(client, <`0x${string}`>address);

        printInfo(`Пытаюсь найти баланс в токене ${token.name}`);

        if (balance > parseEther(ethMinRange)) {
            return token;
        }
    } else {
        const filteredTokens = tokensPool.filter((token) => token.name !== 'wETH');

        for (let i = 0; i < filteredTokens.length; i++) {
            const token = filteredTokens[i];

            const balance = await getSwapBalance(client, <`0x${string}`>address, token.contractAddress, token.name);

            printInfo(`Пытаюсь найти баланс в токене ${token.name}`);

            if (balance > parseUnits(stableMinRange, 6)) {
                return token;
            }
        }
    }

    return null;
}

function getRandomToken(excludeTokenName: string): IToken {
    const filteredTokens = tokensPool.filter((token) => token.name !== excludeTokenName);

    filteredTokens.sort(() => Math.random() - 0.5);

    const randomIndex = Math.floor(Math.random() * filteredTokens.length);
    return filteredTokens[randomIndex];
}

export async function prepareStage(
    moduleName: string,
    isEth: boolean,
    account: PrivateKeyAccount,
): Promise<IPreparedStageData> {
    printInfo(`Выполняю модуль ${moduleName} from ${isEth ? 'ETH' : 'STABLE'}`);

    // @ts-ignore
    const client: PublicClient = createPublicClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const walletClient = createWalletClient({
        chain: base,
        transport: Config.rpc == null ? http() : http(Config.rpc),
    });

    const stageData = stagesData.find((data) => data.moduleName === moduleName);
    if (stageData == undefined) {
        printError(`Ошибка в поиске даты`);
        return {
            client: client,
            swapData: null,
        };
    }

    const range = isEth ? stageData?.ethValue.range : stageData?.stableValue.range;
    const fixed = isEth ? stageData?.ethValue.fixed : stageData?.stableValue.fixed;

    const swapData = await getSwapData(
        isEth,
        client,
        account.address,
        moduleName,
        range,
        fixed,
        range?.minRange.toString(),
        range?.minRange.toString(),
    );

    if (swapData.value == BigInt(-1)) {
        printError(`Не нашел баланс для свапа в ${moduleName}.`);
        return {
            client: client,
            swapData: swapData,
        };
    }

    if (swapData.srcToken!.name != 'wETH') {
        await giveApprove(
            client!,
            walletClient,
            account,
            swapData.srcToken!,
            stageData.spenderContractAddress,
            swapData.value!,
        );
    }

    printInfo(
        `Произвожу свап в сети ${client!.chain?.name} на сумму ${formatUnits(swapData.value!, swapData!.srcToken?.decimals!)} ${swapData.srcToken!.name} -> ${swapData.dstToken!.name}`,
    );

    return {
        client: client,
        swapData: swapData,
    };
}
