// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.10;
import {IOracle} from "../interfaces/IOracle.sol";

contract MockOracle is IOracle {
    uint256 public immutable constantDecimals;
    int256 public immutable constantAnswer;

    constructor(int256 _answer, uint256 _decimals) public {
        constantAnswer = _answer;
        constantDecimals = _decimals;
    }

    function latestAnswer() external view override returns (int256) {
        return constantAnswer;
    }

    function decimals() external view override returns (uint256) {
        return constantDecimals;
    }
}
