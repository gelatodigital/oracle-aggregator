pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";



contract GelatoOracleAggregator is Ownable{
    using SafeMath for uint;
   
    mapping (string => mapping(string => uint)) public tokenPairPrice;
    mapping (string => mapping(string => uint)) public tokenPairDecimals;

    // mapping (string => mapping(string => AggregatorV3Interface)) internal tokenAggregator;
    mapping (string => mapping(string => address)) public tokenPairAddress;

    AggregatorV3Interface internal priceFeed;

    constructor()public{
       
        tokenPairAddress["AAVE"]["ETH"] = 0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012;
        tokenPairAddress["ADA"]["USD"] = 0xAE48c91dF1fE419994FFDa27da09D5aC69c30f55;
        tokenPairAddress["ADX"]["USD"] = 0x231e764B44b2C1b7Ca171fa8021A24ed520Cde10;
        tokenPairAddress["AUD"]["USD"] = 0x77F9710E7d0A19669A13c055F62cd80d313dF022;

       
        tokenPairAddress["BAT"]["ETH"] = 0x0d16d4528239e9ee52fa531af613AcdB23D88c94;
        tokenPairAddress["BCH"]["USD"] = 0x9F0F69428F923D6c95B781F89E165C9b2df9789D;
        tokenPairAddress["BNB"]["USD"] = 0x14e613AC84a31f709eadbdF89C6CC390fDc9540A;
        tokenPairAddress["BNT"]["ETH"] = 0xCf61d1841B178fe82C8895fe60c2EDDa08314416;
        tokenPairAddress["BTC"]["ARS"] = 0xA912dd6b62B1C978e205B86994E057B1b494D73a;
        tokenPairAddress["BTC"]["ETH"] = 0xdeb288F737066589598e9214E782fa5A8eD689e8;
        tokenPairAddress["BTC"]["USD"] = 0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c;
        tokenPairAddress["BUSD"]["ETH"] = 0x614715d2Af89E6EC99A233818275142cE88d1Cfd;
        tokenPairAddress["BZRX"]["ETH"] = 0x8f7C7181Ed1a2BA41cfC3f5d064eF91b67daef66;

        tokenPairAddress["CHF"]["USD"] = 0x449d117117838fFA61263B61dA6301AA2a88B13A;
        tokenPairAddress["COMP"]["ETH"] = 0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699;
        tokenPairAddress["COMP"]["USD"] = 0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5;
        tokenPairAddress["CRO"]["ETH"] = 0xcA696a9Eb93b81ADFE6435759A29aB4cf2991A96;
        
        tokenPairAddress["DAI"]["ETH"] = 0x773616E4d11A78F511299002da57A0a94577F1f4;
        tokenPairAddress["DAI"]["USD"] = 0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9;
        tokenPairAddress["DASH"]["ETH"] = 0xFb0cADFEa136E9E343cfb55B863a6Df8348ab912;
        tokenPairAddress["DMG"]["ETH"] = 0xD010e899f7ab723AC93f825cDC5Aa057669557c2;
    
        tokenPairAddress["ENJ"]["ETH"] = 0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B;
        tokenPairAddress["EOS"]["USD"] = 0x10a43289895eAff840E8d45995BBa89f9115ECEe;
        tokenPairAddress["ETC"]["USD"] = 0xaEA2808407B7319A31A383B6F8B60f04BCa23cE2;
        tokenPairAddress["ETH"]["USD"] = 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419;
        tokenPairAddress["ETH"]["XDR"] = 0xb022E2970b3501d8d83eD07912330d178543C1eB;
        tokenPairAddress["EUR"]["USD"] = 0xb49f677943BC038e9857d61E7d053CaA2C1734C1;

        tokenPairAddress["FNX"]["USD"] = 0x80070f7151BdDbbB1361937ad4839317af99AE6c;
        tokenPairAddress["FTSE"]["GBP"] = 0xE23FA0e8dd05D6f66a6e8c98cab2d9AE82A7550c;

        tokenPairAddress["GBP"]["USD"] = 0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5;

        tokenPairAddress["JPY"]["USD"] = 0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3;

        tokenPairAddress["KNC"]["ETH"] = 0x656c0544eF4C98A6a98491833A89204Abb045d6b;
        tokenPairAddress["KNC"]["USD"] = 0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc;
        
        tokenPairAddress["LINK"]["ETH"] = 0xDC530D9457755926550b59e8ECcdaE7624181557;
        tokenPairAddress["LINK"]["USD"] = 0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c;
        tokenPairAddress["LRC"]["ETH"] = 0x160AC928A16C93eD4895C2De6f81ECcE9a7eB7b4;
        tokenPairAddress["LTC"]["USD"] = 0x6AF09DF7563C363B5763b9102712EbeD3b9e859B;
        
        
        tokenPairAddress["MANA"]["ETH"] = 0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9;
        tokenPairAddress["MKR"]["ETH"] = 0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2;
        
        tokenPairAddress["NMR"]["ETH"] = 0x9cB2A01A7E64992d32A34db7cEea4c919C391f6A;
        
        tokenPairAddress["RCN"]["BTC"] = 0xEa0b3DCa635f4a4E77D9654C5c18836EE771566e;   
        tokenPairAddress["REN"]["ETH"] = 0x3147D7203354Dc06D9fd350c7a2437bcA92387a4;
        tokenPairAddress["REN"]["USD"] = 0x0f59666EDE214281e956cb3b2D0d69415AfF4A01;
        tokenPairAddress["REP"]["ETH"] = 0xD4CE430C3b67b3E2F7026D86E7128588629e2455;
       
        tokenPairAddress["SNX"]["ETH"] = 0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c;
        tokenPairAddress["SNX"]["USD"] = 0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699;
        tokenPairAddress["SUSD"]["ETH"] = 0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757;
        tokenPairAddress["SXP"]["USD"] = 0xFb0CfD6c19e25DB4a08D8a204a387cEa48Cc138f;
        
        
        tokenPairAddress["TRX"]["USD"] = 0xacD0D1A29759CC01E8D925371B72cb2b5610EA25;
        tokenPairAddress["TUSD"]["ETH"] = 0x3886BA987236181D98F2401c507Fb8BeA7871dF2;
        
        tokenPairAddress["UNI"]["ETH"] = 0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e;
        tokenPairAddress["USDC"]["ETH"] = 0x986b5E1e1755e3C2440e960477f25201B0a8bbD4;
        tokenPairAddress["USDT"]["ETH"] = 0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46;
        
        // tokenPairAddress["WOM"]["ETH"] = 0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46;

        tokenPairAddress["XAG"]["USD"] = 0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46;
        tokenPairAddress["XAU"]["USD"] = 0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46;
        tokenPairAddress["XHV"]["USD"] = 0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46;
        tokenPairAddress["XMR"]["USD"] = 0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46;
        tokenPairAddress["XRP"]["USD"] = 0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46;
        tokenPairAddress["XTZ"]["USD"] = 0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46;

        tokenPairAddress["YFI"]["ETH"] = 0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc;
        
        tokenPairAddress["ZRX"]["ETH"] = 0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc;

    }
    
    function addTokenPair(string memory _tokenTicker_a, string memory _tokenTicker_b, address _tokenPairAddress) onlyOwner public {
        tokenPairAddress[_tokenTicker_a][_tokenTicker_b] = _tokenPairAddress;
    }
    
    
    function updateTokenPairPrice(string memory _tokenTicker_a, string memory _tokenTicker_b) public {
        priceFeed = AggregatorV3Interface(tokenPairAddress[_tokenTicker_a][_tokenTicker_b]);

        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        tokenPairDecimals[_tokenTicker_a][_tokenTicker_b] = priceFeed.decimals();

        tokenPairPrice[_tokenTicker_a][_tokenTicker_b] = uint(price);
    }
    
    function getExpectedReturnRate(uint _amount, string memory _tokenTicker_a, string memory _tokenTicker_b) public view returns(uint,uint){
        uint returnRate;
        uint nrOfDecimals;

        returnRate = _amount.mul( tokenPairPrice[_tokenTicker_a][_tokenTicker_b] );
        nrOfDecimals = tokenPairDecimals[_tokenTicker_a][_tokenTicker_b];
        return(returnRate, nrOfDecimals);
    }
    
    
   
}