import axios from 'axios';
import { IBaseSwapQuoteData } from '../../../data/utils/interfaces';
import { baseSwapModuleName, baseSwapSlippage, baseSwapUrls } from './baseSwapData';
import { printError, printSuccess } from '../../../data/logger/logPrinter';
import console from 'console';

export async function baseSwapGetQuote(data: IBaseSwapQuoteData) {
    console.log({
        chainId: data.chainId,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        userAddr: data.userAddr,
        slippageLimitPercent: baseSwapSlippage,
        sourceBlacklist: [],
        sourceWhitelist: ['BaseSwap', 'BaseSwapX', 'Wrapped Ether'],
        pathVizImage: true,
        referralCode: 1190159976,
        pathVizImageConfig: {
            legendTextColor: '#FFFFFF',
        },
    });

    const response = await axios
        .post(baseSwapUrls.quoteUrl, {
            chainId: data.chainId,
            inputTokens: data.inputTokens,
            outputTokens: data.outputTokens,
            userAddr: data.userAddr,
            slippageLimitPercent: baseSwapSlippage,
            sourceBlacklist: [],
            sourceWhitelist: ['BaseSwap', 'BaseSwapX', 'Wrapped Ether'],
            pathVizImage: true,
            referralCode: 1190159976,
            pathVizImageConfig: {
                legendTextColor: '#FFFFFF',
            },
        })
        .then(async (res) => {
            printSuccess(`Успешно получил pathId транзакции(${baseSwapModuleName})`);
            return res;
        })
        .catch((err) => {
            printError(`Произошла ошибка во время получения pathId транзакции(${baseSwapModuleName}) ${err}`);
            console.log(err.response);
            return null;
        });

    console.log(response!.data.pathId);

    return response!.data.pathId;
}
