
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.10;

import {Ownable} from "@gelatonetwork/core/contracts/external/Ownable.sol";
import {SafeMath} from "@gelatonetwork/core/contracts/external/SafeMath.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IOracle} from "./interfaces/IOracle.sol";

// solhint-disable max-states-count
contract OracleAggregator is Ownable {
    using SafeMath for uint256;

    // solhint-disable var-name-mixedcase
    address private constant _ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    // solhint-disable var-name-mixedcase
    address private constant _USD_ADDRESS = 0x7354C81fbCb229187480c4f497F945C6A312d5C3;

    address public immutable wethAddress;

    mapping(address => mapping(address => address)) private _tokenPairAddress;
    mapping(address => uint256) private _nrOfDecimalsUSD;

    // solhint-disable function-max-lines
    constructor(
        address _weth,
        address[] memory _inTokens,
        address[] memory _outTokens,
        address[] memory _oracles,
        address[] memory _stablecoins,
        uint256[] memory _decimals
    ) public {
        wethAddress = _weth;
        addTokens(_inTokens, _outTokens, _oracles);
        addStablecoins(_stablecoins, _decimals);
    }

    function addTokens (
        address[] memory _inTokens,
        address[] memory _outTokens,
        address[] memory _oracles
    ) public onlyOwner {
        require(_inTokens.length == _outTokens.length && _inTokens.length == _oracles.length);
        for (uint256 i = 0; i < _inTokens.length; i++) {
            _tokenPairAddress[_inTokens[i]][_outTokens[i]] = _oracles[i];
        }
    }

    function addStablecoins (
        address[] memory _stablecoins,
        uint256[] memory _decimals
    ) public onlyOwner {
        require(_stablecoins.length == _decimals.length);
        for (uint256 i = 0; i < _stablecoins.length; i++) {
            _nrOfDecimalsUSD[_stablecoins[i]] = _decimals[i];
        }
    }

    // solhint-disable function-max-lines
    // solhint-disable code-complexity
    /// @dev expected return amount of outToken from amountIn of inToken 
    function getExpectedReturnAmount(
        uint256 amountIn,
        address inToken,
        address outToken
    ) public view returns (uint256 returnAmount, uint256 returnDecimals) {
        // sanity checks
        require(amountIn > 0, "OracleAggregator: amountIn is Zero");
        require(
            inToken != address(0),
            "OracleAggregator: inToken is Zero"
        );
        require(
            outToken != address(0),
            "OracleAggregator: outToken is Zero"
        );

        // convert WETH to ETH
        if (inToken == wethAddress) {
            inToken = _ETH_ADDRESS;
        }
        if (outToken == wethAddress) {
            outToken = _ETH_ADDRESS;
        }

        // decimals of inToken
        uint256 nrOfDecimalsIn;
        if (inToken != _ETH_ADDRESS && inToken != _USD_ADDRESS) {
            try ERC20(inToken).decimals() returns (uint8 _inputDecimals) {
                nrOfDecimalsIn = uint256(_inputDecimals);
            } catch {
                revert("OracleAggregator: ERC20.decimals() revert");
            }
        } else {
            if (inToken != _ETH_ADDRESS) {
                nrOfDecimalsIn = _nrOfDecimalsUSD[_USD_ADDRESS];
            } else {
                nrOfDecimalsIn = 18;
            }
        }

        // decimals of outToken
        if (outToken != _ETH_ADDRESS && outToken != _USD_ADDRESS) {
            try ERC20(outToken).decimals() returns (uint8 _outputDecimals) {
                returnDecimals = uint256(_outputDecimals);
            } catch {
                revert("OracleAggregator: ERC20.decimals() revert");
            }
        } else {
            if (outToken != _ETH_ADDRESS) {
                returnDecimals = _nrOfDecimalsUSD[_USD_ADDRESS];
            } else {
                returnDecimals = 18;
            }
        }

        // store outToken address if it is a stablecoin
        address stableCoinAddress =
            _nrOfDecimalsUSD[outToken] > 0 ? outToken : address(0);

        // convert any stablecoin addresses to USD address
        (inToken, outToken) = _convertUSD(
            inToken,
            outToken
        );

        if (outToken == _ETH_ADDRESS || outToken == _USD_ADDRESS) {
            // when outToken is ETH or USD
            returnAmount = _handleConvertToEthOrUsd(
                amountIn,
                inToken,
                outToken,
                nrOfDecimalsIn,
                stableCoinAddress
            );
        } else {
            // when outToken is not ETH or USD
            returnAmount = _handleConvertToToken(
                amountIn,
                inToken,
                outToken,
                nrOfDecimalsIn
            );
        }

        return (returnAmount, returnDecimals);
    }

    function _handleConvertToEthOrUsd(
        uint256 amountIn,
        address inToken,
        address outToken,
        uint256 nrOfDecimalsIn,
        address stableCoinAddress
    ) 
        private
        view
        returns (uint256 returnAmount)
    {
        // oracle of inToken vs outToken exists
        // e.g. calculating KNC/ETH
        // and KNC/ETH oracle exists
        if (_tokenPairAddress[inToken][outToken] != address(0)) {
            (uint256 price, uint256 nrOfDecimals) =
                _getRate(inToken, outToken);
            returnAmount = stableCoinAddress != address(0)
                ? _matchStableCoinDecimal(
                    stableCoinAddress,
                    amountIn,
                    nrOfDecimals,
                    0,
                    price,
                    1
                )
                : amountIn.mul(price);

            return returnAmount.div(10**nrOfDecimalsIn);
        } else {
            // direct oracle of inToken vs outToken does not exist
            // e.g. calculating UNI/USD
            // UNI/ETH and USD/ETH oracles available
            (address pairA, address pairB) =
                _checkAvailablePair(inToken, outToken);
            if (pairA == address(0) && pairB == address(0)) return (0);
            (uint256 priceA, ) = _getRate(inToken, pairA);
            (uint256 priceB, uint256 nrOfDecimals) =
                _getRate(outToken, pairB);

            nrOfDecimals = stableCoinAddress != address(0)
                ? _nrOfDecimalsUSD[stableCoinAddress]
                : nrOfDecimals;

            returnAmount = amountIn
                .mul(priceA.mul(10**nrOfDecimals))
                .div(priceB);
            if (outToken != _ETH_ADDRESS) {
                return returnAmount.div(10**nrOfDecimalsIn);
            } else {
                return returnAmount.div(10**_nrOfDecimalsUSD[_USD_ADDRESS]);
            }
        }
    }

    function _handleConvertToToken(
        uint256 amountIn,
        address inToken,
        address outToken,
        uint256 nrOfDecimalsIn
    )
        private
        view
        returns (uint256 returnAmount)
    {
        (address pairA, address pairB) =
            _checkAvailablePair(inToken, outToken);
        if (pairA == address(0) && pairB == address(0)) return (0);
        // oracle of inToken/ETH, outToken/ETH || inToken/USD, outToken/USD exists
        // e.g. calculating KNC/UNI where
        // KNC/ETH and UNI/ETH oracles available
        if (pairA == pairB) {
            (uint256 priceA, uint256 nrOfDecimals) =
                _getRate(inToken, pairA);

            (uint256 priceB, ) = _getRate(outToken, pairB);

            returnAmount = amountIn
                .mul(priceA.mul(10**nrOfDecimals))
                .div(priceB);
            if (pairA == _ETH_ADDRESS) {
                return returnAmount.div(10**nrOfDecimalsIn);
            } else {
                return returnAmount.div(10**_nrOfDecimalsUSD[_USD_ADDRESS]);
            }
        } else if (pairA == _ETH_ADDRESS && pairB == _USD_ADDRESS) {
            // oracle of inToken/ETH and outToken/USD exists
            // e.g. calculating UNI/SXP where
            // UNI/ETH and SXP/USD oracles available
            {
                (uint256 priceA, ) = _getRate(inToken, pairA);
                (uint256 priceETHUSD, ) =
                    _getRate(_ETH_ADDRESS, _USD_ADDRESS);
                (uint256 priceB, ) = _getRate(outToken, pairB);

                returnAmount = amountIn
                    .mul(priceA.mul(priceETHUSD))
                    .div(priceB);
            }
            return returnAmount.div(10**nrOfDecimalsIn);
        } else if (pairA == _USD_ADDRESS && pairB == _ETH_ADDRESS) {
            // oracle of inToken/USD and outToken/ETH exists
            // e.g. calculating SXP/UNI where
            // SXP/USD and UNI/ETH oracles available
            uint256 numerator;
            {
                (uint256 priceA, uint256 nrOfDecimals) =
                    _getRate(inToken, pairA);

                (uint256 priceUSDETH, uint256 nrOfDecimalsUSDETH) =
                    _getRate(_USD_ADDRESS, _ETH_ADDRESS);

                numerator = priceUSDETH
                    .mul(10**(nrOfDecimalsUSDETH.sub(nrOfDecimals)))
                    .mul(priceA)
                    .div(10**nrOfDecimalsUSDETH);
            }
            (uint256 priceB, ) = _getRate(outToken, pairB);
            returnAmount = amountIn.mul(numerator).div(priceB);
            return returnAmount;
        }
    }

    /// @dev check the available oracles for token a & b
    /// and choose which oracles to use
    function _checkAvailablePair(address inToken, address outToken)
        private
        view
        returns (address, address)
    {     
        if (
            _tokenPairAddress[inToken][_USD_ADDRESS] != address(0) &&
            _tokenPairAddress[outToken][_USD_ADDRESS] != address(0)
        ) {
            return (_USD_ADDRESS, _USD_ADDRESS);
        } else if (
            _tokenPairAddress[inToken][_ETH_ADDRESS] != address(0) &&
            _tokenPairAddress[outToken][_ETH_ADDRESS] != address(0)
        ) {
            return (_ETH_ADDRESS, _ETH_ADDRESS);
        } else if (
            _tokenPairAddress[inToken][_ETH_ADDRESS] != address(0) &&
            _tokenPairAddress[outToken][_USD_ADDRESS] != address(0)
        ) {
            return (_ETH_ADDRESS, _USD_ADDRESS);
        } else if (
            _tokenPairAddress[inToken][_USD_ADDRESS] != address(0) &&
            _tokenPairAddress[outToken][_ETH_ADDRESS] != address(0)
        ) {
            return (_USD_ADDRESS, _ETH_ADDRESS);
        } else {
            return (address(0), address(0));
        }
    }

    function _getRate(address inToken, address outToken)
        private
        view
        returns (uint256 tokenPrice, uint256 nrOfDecimals)
    {
        if (inToken == outToken) {
            return (1, 0);
        } else {
            IOracle priceFeed =
                IOracle(
                    _tokenPairAddress[inToken][outToken]
                );
            tokenPrice = uint256(priceFeed.latestAnswer());
            nrOfDecimals = priceFeed.decimals();
        }
    }

    /// @dev converting all usd pegged stablecoins to single USD address
    function _convertUSD(address inToken, address outToken)
        private
        view
        returns (address, address)
    {
        if (
            _nrOfDecimalsUSD[inToken] > 0 &&
            _nrOfDecimalsUSD[outToken] > 0
        ) {
            return (_USD_ADDRESS, _USD_ADDRESS);
        } else if (_nrOfDecimalsUSD[inToken] > 0) {
            return (_USD_ADDRESS, outToken);
        } else if (_nrOfDecimalsUSD[outToken] > 0) {
            return (inToken, _USD_ADDRESS);
        } else {
            return (inToken, outToken);
        }
    }

    /// @dev modify nrOfDecimlas and amount to follow stableCoin's nrOfDecimals
    function _matchStableCoinDecimal(
        address stableCoinAddress,
        uint256 amount,
        uint256 nrOfDecimals,
        uint256 padding,
        uint256 returnRateA,
        uint256 returnRateB
    ) private view returns (uint256 returnAmount) {
        uint256 div =
            _nrOfDecimalsUSD[stableCoinAddress] > nrOfDecimals
                ? 10**(_nrOfDecimalsUSD[stableCoinAddress] - nrOfDecimals)
                : 10**(nrOfDecimals - _nrOfDecimalsUSD[stableCoinAddress]);
        returnAmount = _nrOfDecimalsUSD[stableCoinAddress] > nrOfDecimals
            ? amount.mul(returnRateA.mul(10**padding)).div(returnRateB).mul(div)
            : amount.mul(returnRateA.mul(10**padding)).div(returnRateB).div(
                div
            );
    }
}