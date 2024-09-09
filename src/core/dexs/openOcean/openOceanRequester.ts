import { IOpenOceanData } from '../../../data/utils/interfaces';
import axios from 'axios';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import console from 'console';
import { openOceanModuleName, openOceanUrl } from './openOceanData';
import { Hex } from 'viem';

export async function openOceanGetTransactionData(data: IOpenOceanData): Promise<Hex> {
    const response = await axios
        .get(openOceanUrl, {
            params: {
                inTokenSymbol: data.inTokenSymbol,
                inTokenAddress: data.inTokenAddress,
                outTokenSymbol: data.outTokenSymbol,
                outTokenAddress: data.outTokenAddress,
                amount: data.amount,
                gasPrice: data.gasPrice,
                disabledDexIds: '',
                slippage: data.slippage,
                account: data.account,
            },
        })
        .then(async (res) => {
            printSuccess(`Успешно получил данные транзакции(${openOceanModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения данных транзакции(${openOceanModuleName}) ${err}`);
            console.log(err.response);
            return null;
        });

    return response!.data.data;
}
