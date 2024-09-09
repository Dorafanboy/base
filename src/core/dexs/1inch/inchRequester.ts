import axios from 'axios';
import { inchModuleName, inchRequestUrl, inchSlippage } from './inchData';
import { IInchData, IInchDataDto } from '../../../data/utils/interfaces';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import { InchConfig } from '../../../config';
import console from 'console';

export async function getTransactionData(data: IInchData): Promise<IInchDataDto> {
    const response = await axios
        .get(`${inchRequestUrl}${data.chainId}/swap`, {
            params: {
                src: data.srcToken.toLowerCase(),
                dst: data.dstToken.toLowerCase(),
                amount: data.amount.toString(),
                from: data.fromAddress.toLowerCase(),
                slippage: inchSlippage,
            },
            headers: {
                Authorization: `Bearer ${InchConfig.apiKey}`,
            },
        })
        .then(async (res) => {
            printSuccess(`Успешно получил данные транзакции(${inchModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения данных транзакции(${inchModuleName}) ${err}`);
            console.log(err.response);
            return null;
        });

    return {
        to: response!.data.tx.to,
        data: response!.data.tx.data,
        value: response!.data.tx.value,
    };
}
