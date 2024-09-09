import { Chain, Hex, PrivateKeyAccount, PublicClient, WalletClient } from 'viem';

export interface IBridgeRange {
    readonly minRange: number;
    readonly maxRange: number;
}

export interface IFixedRange extends IBridgeRange {}

export interface IDelayRange extends IBridgeRange {}

export interface IOkx {
    readonly okxFee: string;
    readonly chainName: string;
    readonly networkName: string;
    readonly tokenName: string;
    readonly withdraw: IBridgeRange;
    readonly randomFixed: IFixedRange;
    readonly withdrawStart: string;
}

export interface IFunction {
    readonly func: (account: PrivateKeyAccount, isEth: boolean) => Promise<boolean>;
    readonly isUse: boolean;
    readonly words?: string[];
    readonly addressToWithdraw?: Hex;
}

export type TokenName = 'USDT' | 'USDC' | 'USDC.e' | 'USDbC' | 'wETH' | 'DAI';

export interface IToken {
    readonly name: TokenName;
    readonly contractAddress: Hex;
    readonly decimals: number;
}

export interface ISushiToken extends Pick<IToken, 'name' | 'contractAddress'> {
    readonly value: { range: IBridgeRange; fixed: IFixedRange };
}

export interface ISushiData {
    readonly chain: Chain;
    readonly sushiContractAddress: Hex;
    readonly tokens: ISushiToken[];
    readonly limitBuyStg: number;
}

export interface IInchData {
    readonly chainId: number;
    readonly srcToken: Hex;
    readonly dstToken: Hex;
    readonly amount: bigint;
    readonly fromAddress: Hex;
}

export interface IInchDataDto {
    readonly to: Hex;
    readonly data: Hex;
    readonly value: bigint;
}

export interface ISwapData {
    readonly value: bigint;
    readonly srcToken: IToken | null;
    readonly dstToken: IToken | null;
}

export interface ISushiDataDto {
    readonly amountOutMin: bigint;
    readonly route: Hex;
}

export interface IStageData {
    readonly moduleName: string;
    readonly spenderContractAddress: Hex;
    readonly ethValue: { range: IBridgeRange; fixed: IFixedRange };
    readonly stableValue: { range: IBridgeRange; fixed: IFixedRange };
}

export interface IPreparedStageData {
    readonly client: PublicClient;
    readonly swapData: ISwapData | null;
}

export interface IBaseSwapInputToken {
    readonly tokenAddress: Hex;
    readonly amount: string;
}

export interface IBaseSwapOutputToken extends Pick<IBaseSwapInputToken, 'tokenAddress'> {
    readonly proportion: number;
}

export interface IBaseSwapQuoteData {
    readonly chainId: number;
    readonly inputTokens: IBaseSwapInputToken[];
    readonly outputTokens: IBaseSwapOutputToken[];
    readonly userAddr: Hex;
}

export interface IXyFinanceQuoteData {
    readonly srcChainId: number;
    readonly srcQuoteTokenAddress: Hex;
    readonly srcQuoteTokenAmount: string | undefined;
    readonly dstChainId: number;
    readonly dstQuoteTokenAddress: Hex;
    readonly slippage: number;
    readonly commissionRate: number;
    readonly affiliate: string;
}

export interface IXyFinanceBuildTxData extends IXyFinanceQuoteData {
    receiver?: Hex;
    srcSwapProvider?: string;
}

export interface IXyFinanceTxData {
    readonly to: Hex;
    readonly data: Hex;
    readonly value: Hex;
}

export interface IDmailData {
    readonly to: string;
    readonly amount: string;
}

export interface IOpenOceanData {
    readonly inTokenSymbol: string | undefined;
    readonly inTokenAddress: Hex | undefined;
    readonly outTokenSymbol: string | undefined;
    readonly outTokenAddress: Hex | undefined;
    readonly amount: string | undefined;
    readonly gasPrice: bigint;
    readonly disabledDexIds: string;
    readonly slippage: number;
    readonly account: Hex;
}
