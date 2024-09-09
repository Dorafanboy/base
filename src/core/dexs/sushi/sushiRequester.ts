import axios from 'axios';
import { sushiModuleName, sushiUrl } from './sushiData';
import { PublicClient } from 'viem';
import { IInchData, ISushiDataDto } from '../../../data/utils/interfaces';
import { printError, printSuccess } from '../../../data/logger/logPrinter';

export async function sushiGetTransactionData(
    client: PublicClient,
    data: IInchData,
    address: string,
): Promise<ISushiDataDto> {
    const gasPrice = await client.getGasPrice();

    const response = await axios
        .get(
            `${sushiUrl}${data.chainId}?&tokenIn=${
                data.srcToken
            }&tokenOut=${data.dstToken}&amount=${data.amount?.toString()}&maxPriceImpact=0.005&gasPrice=${gasPrice.toString()}&to=${address}&preferSushi=true`,
        )
        .then(async (res) => {
            printSuccess(`Успешно получил данные транзакции(${sushiModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения данных транзакции(${sushiModuleName}) ${err}`);
            return null;
        });

    const amountOutMin = response!.data.routeProcessorArgs.amountOutMin;
    const route = response!.data.routeProcessorArgs.routeCode;

    return {
        amountOutMin: amountOutMin,
        route: route,
    };
}
