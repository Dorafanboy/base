﻿export const maverickPositionABI = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
            },
        ],
        name: 'PRBMathUD60x18__SqrtOverflow',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'prod1',
                type: 'uint256',
            },
        ],
        name: 'PRBMath__MulDivFixedPointOverflow',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'prod1',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'denominator',
                type: 'uint256',
            },
        ],
        name: 'PRBMath__MulDivOverflow',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'contract IPool',
                name: 'pool',
                type: 'address',
            },
        ],
        name: 'activeTickLiquidity',
        outputs: [
            {
                internalType: 'uint256',
                name: 'sqrtPrice',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'liquidity',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'reserveA',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'reserveB',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes',
                name: 'path',
                type: 'bytes',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                internalType: 'bool',
                name: 'exactOutput',
                type: 'bool',
            },
        ],
        name: 'calculateMultihopSwap',
        outputs: [
            {
                internalType: 'uint256',
                name: 'returnAmount',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IPool',
                name: 'pool',
                type: 'address',
            },
            {
                internalType: 'uint128',
                name: 'amount',
                type: 'uint128',
            },
            {
                internalType: 'bool',
                name: 'tokenAIn',
                type: 'bool',
            },
            {
                internalType: 'bool',
                name: 'exactOutput',
                type: 'bool',
            },
            {
                internalType: 'uint256',
                name: 'sqrtPriceLimit',
                type: 'uint256',
            },
        ],
        name: 'calculateSwap',
        outputs: [
            {
                internalType: 'uint256',
                name: 'returnAmount',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IPool',
                name: 'pool',
                type: 'address',
            },
            {
                internalType: 'uint128',
                name: 'amount',
                type: 'uint128',
            },
            {
                internalType: 'bool',
                name: 'tokenAIn',
                type: 'bool',
            },
            {
                internalType: 'bool',
                name: 'exactOutput',
                type: 'bool',
            },
        ],
        name: 'calculateSwap',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IPool',
                name: 'pool',
                type: 'address',
            },
            {
                internalType: 'uint128',
                name: 'startBinIndex',
                type: 'uint128',
            },
            {
                internalType: 'uint128',
                name: 'endBinIndex',
                type: 'uint128',
            },
        ],
        name: 'getActiveBins',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint128',
                        name: 'id',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint8',
                        name: 'kind',
                        type: 'uint8',
                    },
                    {
                        internalType: 'int32',
                        name: 'lowerTick',
                        type: 'int32',
                    },
                    {
                        internalType: 'uint128',
                        name: 'reserveA',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'reserveB',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'mergeId',
                        type: 'uint128',
                    },
                ],
                internalType: 'struct IPoolInformation.BinInfo[]',
                name: 'bins',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IPool',
                name: 'pool',
                type: 'address',
            },
            {
                internalType: 'contract IPoolPositionSlim',
                name: 'poolPosition',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'lpTokenAmount',
                type: 'uint256',
            },
        ],
        name: 'getAddLiquidityParams',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'kind',
                        type: 'uint8',
                    },
                    {
                        internalType: 'int32',
                        name: 'pos',
                        type: 'int32',
                    },
                    {
                        internalType: 'bool',
                        name: 'isDelta',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint128',
                        name: 'deltaA',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'deltaB',
                        type: 'uint128',
                    },
                ],
                internalType: 'struct IPool.AddLiquidityParams[]',
                name: 'addParams',
                type: 'tuple[]',
            },
            {
                internalType: 'uint256',
                name: 'binLpTokenAmount0',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IPool',
                name: 'pool',
                type: 'address',
            },
            {
                internalType: 'uint128',
                name: 'binId',
                type: 'uint128',
            },
        ],
        name: 'getBinDepth',
        outputs: [
            {
                internalType: 'uint256',
                name: 'depth',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IPool',
                name: 'pool',
                type: 'address',
            },
            {
                internalType: 'int32',
                name: 'tick',
                type: 'int32',
            },
        ],
        name: 'getBinsAtTick',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint128',
                        name: 'reserveA',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'reserveB',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'mergeBinBalance',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'mergeId',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint128',
                        name: 'totalSupply',
                        type: 'uint128',
                    },
                    {
                        internalType: 'uint8',
                        name: 'kind',
                        type: 'uint8',
                    },
                    {
                        internalType: 'int32',
                        name: 'lowerTick',
                        type: 'int32',
                    },
                ],
                internalType: 'struct IPool.BinState[]',
                name: 'bins',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IPool',
                name: 'pool',
                type: 'address',
            },
        ],
        name: 'getSqrtPrice',
        outputs: [
            {
                internalType: 'uint256',
                name: 'sqrtPrice',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256',
            },
            {
                internalType: 'bytes',
                name: '_data',
                type: 'bytes',
            },
        ],
        name: 'swapCallback',
        outputs: [],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'contract IPool',
                name: 'pool',
                type: 'address',
            },
            {
                internalType: 'int32',
                name: 'tick',
                type: 'int32',
            },
        ],
        name: 'tickLiquidity',
        outputs: [
            {
                internalType: 'uint256',
                name: 'sqrtPrice',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'liquidity',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'reserveA',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'reserveB',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];
