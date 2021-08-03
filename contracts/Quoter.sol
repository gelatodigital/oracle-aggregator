// SPDX-License-Identifier: UNLICENSED
// solhint-disable-next-line compiler-version
pragma solidity 0.7.6;

import { IQuoter } from "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

contract Quoter {
  IQuoter public immutable quoter;

  constructor(address _quoter) {
    quoter = IQuoter(_quoter);
  }

  function getAmountOut(
    uint256 amountIn,
    address[] calldata _path,
    uint24[] calldata _fee
  ) external returns (uint256 amountOut) {
    bytes memory path = encodePath(_path, _fee);
    amountOut = quoter.quoteExactInput(path, amountIn);
  }

  function encodePath(address[] calldata _path, uint24[] calldata _fee)
    public
    pure
    returns (bytes memory)
  {
    bytes memory _encodedPath = abi.encodePacked(_path[0], _fee[0], _path[1]);

    uint256 length = _fee.length;

    if (length > 1) {
      for (uint256 x = 1; x < length; x++) {
        _encodedPath = abi.encodePacked(_encodedPath, _fee[x], _path[x + 1]);
      }
    }

    return _encodedPath;
  }
}
