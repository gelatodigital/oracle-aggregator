// SPDX-License-Identifier: UNLICENSED
// solhint-disable-next-line compiler-version
pragma solidity 0.7.6;

import { IUniswapV3Pool } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import { OracleLibrary } from "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import { TickMath } from "./vendor/TickMath.sol";
import { OwnableNoContext } from "./vendor/OwnableNoContext.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UniV3Oracle is OwnableNoContext {
  using TickMath for int24;

  uint32 public observationSeconds;

  constructor() {
    observationSeconds = 5 minutes;
  }

  function setObservationSeconds(uint32 _newObservationSeconds)
    external
    onlyOwner
  {
    observationSeconds = _newObservationSeconds;
  }

  function getExpectedReturnAmount(
    address[] calldata route,
    IUniswapV3Pool[] calldata pools,
    uint128 amountIn
  ) public view returns (uint256 returnAmount, uint256 returnDecimals) {
    uint256 length = pools.length;
    uint128 varyingInput = amountIn;
    uint256 quoteAmount;

    for (uint256 x = 0; x < length; x++) {
      IUniswapV3Pool pool = pools[x];
      address inToken = route[x];
      address outToken = route[x + 1];

      require(
        (pool.token0() == inToken && pool.token1() == outToken) ||
          (pool.token0() == outToken && pool.token1() == inToken),
        "UniV3Oracle: getExpectedReturnAmount: Wrong pools or tokens"
      );

      int24 avgTick = OracleLibrary.consult(address(pool), observationSeconds);

      quoteAmount = OracleLibrary.getQuoteAtTick(
        avgTick,
        varyingInput,
        inToken,
        outToken
      );

      varyingInput = uint128(quoteAmount);
    }

    returnAmount = quoteAmount;
    returnDecimals = ERC20(route[length]).decimals();
  }
}
