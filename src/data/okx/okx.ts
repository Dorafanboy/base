import { Config, OkxAuth, OkxData } from '../../config';
import { createPublicClient, Hex, http, parseEther } from 'viem';
import { printInfo, printSuccess } from '../logger/logPrinter';
import { delay } from '../helpers/delayer';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import ccxt, { okx } from 'ccxt';
import { addTextMessage } from '../telegram/telegramBot';
import { IOkx } from '../utils/interfaces';
import { base } from 'viem/chains';

export async function withdrawAmount(address: Hex, bridgeData: IOkx[], isUse: boolean) {
    if (isUse == false) {
        return;
    }

    if (bridgeData.length <= 0) {
        return;
    }

    printInfo(`Выполняю модуль вывода через OKX`);

    const okxOptions = {
        apiKey: OkxAuth.okxApiKey,
        secret: OkxAuth.okxApiSecret,
        password: OkxAuth.okxApiPassword,
        enableRateLimit: true,
    };

    const exchange: okx = new ccxt.okx(okxOptions);

    let client;
    for (let i = 0; i < bridgeData.length; i++) {
        const data = bridgeData[i];

        client = createPublicClient({
            chain: base,
            transport: Config.rpc == null ? http() : http(Config.rpc),
        });

        const balance = await client.getBalance({
            address: address,
        });

        const isLessBalance: boolean = Number(parseEther(data.withdrawStart).toString()) > Number(balance.toString());

        if ((data.withdraw.minRange != 0 && data.withdraw.maxRange != 0) || isLessBalance) {
            printInfo(`Произвожу вывод с OKX в сеть ${data.networkName}`);

            const randomFixed = Math.floor(
                Math.random() * (data.randomFixed.maxRange - data.randomFixed.minRange) + data.randomFixed.minRange,
            );
            const amount = (
                Math.random() *
                    (parseFloat(data.withdraw.maxRange.toString()) - parseFloat(data.withdraw.minRange.toString())) +
                parseFloat(data.withdraw.minRange.toString())
            ).toFixed(randomFixed);

            await exchange.withdraw(data.tokenName, amount, address, {
                toAddress: address,
                chainName: data.chainName,
                dest: 4,
                fee: data.okxFee,
                pwd: '-',
                amt: amount,
                network: data.networkName,
            });

            printSuccess(` Withdraw from okx ${amount} ${data.tokenName} to address ${address}`);
            await addTextMessage(`✅OKX:withdraw ${amount} ${data.tokenName}`);
            await delay(Config.delayBetweenAction.minRange, Config.delayBetweenAction.maxRange, false);
        }
    }

    await delay(OkxData.delayAfterWithdraw.minRange, OkxData.delayAfterWithdraw.maxRange, true);

    return true;
}
