import { IStageData } from './interfaces';
import {
    AlienSwapConfig,
    InchConfig,
    MaverickConfig,
    OpenOceanConfig,
    PancakeConfig,
    SushiConfig,
    XyFinanceConfig,
} from '../../config';
import { sushiContractAddress, sushiModuleName } from '../../core/dexs/sushi/sushiData';
import { inchContractAddress, inchModuleName } from '../../core/dexs/1inch/inchData';
import { maverickModuleName, maverickRouterContractAddress } from '../../core/dexs/maverick/maverickData';
import { pancakeModuleName, pancakeRouter } from '../../core/dexs/pancake/pancakeData';
import { alienSwapContractAddress, alienSwapModuleName } from '../../core/dexs/alienswap/alienswapData';
import { xyFinanceContractAddress, xyFinanceModuleName } from '../../core/dexs/xyfinance/xyfinanceData';
import { openOceanContractAddress, openOceanModuleName } from '../../core/dexs/openOcean/openOceanData';

export const stagesData: IStageData[] = [
    {
        moduleName: inchModuleName,
        spenderContractAddress: inchContractAddress,
        ethValue: { range: InchConfig.ethSwapRange.range, fixed: InchConfig.ethSwapRange.fixed },
        stableValue: { range: InchConfig.stableSwapRange.range, fixed: InchConfig.stableSwapRange.fixed },
    },
    {
        moduleName: sushiModuleName,
        spenderContractAddress: sushiContractAddress,
        ethValue: { range: SushiConfig.ethSwapRange.range, fixed: SushiConfig.ethSwapRange.fixed },
        stableValue: { range: SushiConfig.stableSwapRange.range, fixed: SushiConfig.stableSwapRange.fixed },
    },
    {
        moduleName: maverickModuleName,
        spenderContractAddress: maverickRouterContractAddress,
        ethValue: { range: MaverickConfig.ethSwapRange.range, fixed: MaverickConfig.ethSwapRange.fixed },
        stableValue: { range: MaverickConfig.stableSwapRange.range, fixed: MaverickConfig.stableSwapRange.fixed },
    },
    {
        moduleName: pancakeModuleName,
        spenderContractAddress: pancakeRouter,
        ethValue: { range: PancakeConfig.ethSwapRange.range, fixed: PancakeConfig.ethSwapRange.fixed },
        stableValue: { range: PancakeConfig.stableSwapRange.range, fixed: PancakeConfig.stableSwapRange.fixed },
    },
    {
        moduleName: alienSwapModuleName,
        spenderContractAddress: alienSwapContractAddress,
        ethValue: { range: AlienSwapConfig.ethSwapRange.range, fixed: AlienSwapConfig.ethSwapRange.fixed },
        stableValue: { range: AlienSwapConfig.stableSwapRange.range, fixed: AlienSwapConfig.stableSwapRange.fixed },
    },
    {
        moduleName: xyFinanceModuleName,
        spenderContractAddress: xyFinanceContractAddress,
        ethValue: { range: XyFinanceConfig.ethSwapRange.range, fixed: XyFinanceConfig.ethSwapRange.fixed },
        stableValue: { range: XyFinanceConfig.stableSwapRange.range, fixed: XyFinanceConfig.stableSwapRange.fixed },
    },
    {
        moduleName: openOceanModuleName,
        spenderContractAddress: openOceanContractAddress,
        ethValue: { range: OpenOceanConfig.ethSwapRange.range, fixed: OpenOceanConfig.ethSwapRange.fixed },
        stableValue: { range: OpenOceanConfig.stableSwapRange.range, fixed: OpenOceanConfig.stableSwapRange.fixed },
    },
];
