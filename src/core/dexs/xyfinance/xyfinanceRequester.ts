import { IXyFinanceBuildTxData, IXyFinanceQuoteData, IXyFinanceTxData } from '../../../data/utils/interfaces';
import axios from 'axios';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import console from 'console';
import { xyFinanceModuleName, xyFinanceUrls } from './xyfinanceData';

export async function xyFinanceGetQuote(data: IXyFinanceQuoteData): Promise<string> {
    const response = await axios
        .get(xyFinanceUrls.getQuote, {
            params: {
                src_chain_id: data.srcChainId,
                src_quote_token_address: data.srcQuoteTokenAddress,
                src_quote_token_amount: data.srcQuoteTokenAmount,
                dst_chain_id: data.dstChainId,
                dst_quote_token_address: data.dstQuoteTokenAddress,
                slippage: data.slippage,
                commission_rate: data.commissionRate,
                affiliate: data.affiliate,
            },
        })
        .then(async (res) => {
            printSuccess(`Успешно получил провайдера транзакции(${xyFinanceModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения провайдера транзакции(${xyFinanceModuleName}) ${err}`);
            console.log(err.response);
            return null;
        });

    console.log({
        src_chain_id: data.srcChainId,
        src_quote_token_address: data.srcQuoteTokenAddress,
        src_quote_token_amount: data.srcQuoteTokenAmount,
        dst_chain_id: data.dstChainId,
        dst_quote_token_address: data.dstQuoteTokenAddress,
        slippage: data.slippage,
        commission_rate: data.commissionRate,
    });
    console.log(response!.data);

    return response!.data.routes[0].src_swap_description.provider;
}

export async function xyFinanceGetTxData(data: IXyFinanceBuildTxData): Promise<IXyFinanceTxData> {
    const response = await axios
        .get(xyFinanceUrls.buildTx, {
            params: {
                src_chain_id: data.srcChainId,
                src_quote_token_address: data.srcQuoteTokenAddress,
                src_quote_token_amount: data.srcQuoteTokenAmount,
                dst_chain_id: data.dstChainId,
                dst_quote_token_address: data.dstQuoteTokenAddress,
                slippage: data.slippage,
                receiver: data.receiver,
                src_swap_provider: data.srcSwapProvider,
            },
        })
        .then(async (res) => {
            printSuccess(`Успешно получил данные транзакции(${xyFinanceModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения данных транзакции(${xyFinanceModuleName}) ${err}`);
            console.log(err.response);
            return null;
        });

    return response!.data.tx;
}
