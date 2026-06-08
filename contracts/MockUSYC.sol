// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
}

contract MockUSYC {
    IERC20 public immutable usdcToken;
    uint256 public deployTime;
    uint256 public constant YIELD_RATE_PER_SECOND = 10; // simulates yield in 6 decimals per second

    string public name = "USD Yield Coin";
    string public symbol = "USYC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
        deployTime = block.timestamp;
    }

    function getSharePrice() public view returns (uint256) {
        uint256 elapsed = block.timestamp - deployTime;
        // Simulates rate growing by 10 units of 6 decimals per second (~5% APY simulated)
        return 1e6 + (elapsed * YIELD_RATE_PER_SECOND);
    }

    function mint(uint256 usdcAmount) external returns (uint256) {
        require(usdcAmount > 0, "Amount must be > 0");
        uint256 price = getSharePrice();
        uint256 shares = (usdcAmount * 1e6) / price;
        
        require(usdcToken.transferFrom(msg.sender, address(this), usdcAmount), "Transfer failed");
        
        balanceOf[msg.sender] += shares;
        totalSupply += shares;
        return shares;
    }

    function redeem(uint256 shareAmount) external returns (uint256) {
        require(shareAmount > 0, "Shares must be > 0");
        require(balanceOf[msg.sender] >= shareAmount, "Insufficient shares");
        
        uint256 price = getSharePrice();
        uint256 usdcAmount = (shareAmount * price) / 1e6;
        
        balanceOf[msg.sender] -= shareAmount;
        totalSupply -= shareAmount;
        
        require(usdcToken.transfer(msg.sender, usdcAmount), "Transfer failed");
        return usdcAmount;
    }
}
