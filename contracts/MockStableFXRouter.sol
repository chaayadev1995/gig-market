// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
}

contract MockStableFXRouter {
    // 1 USDC = 0.92 EURC (6 decimals)
    uint256 public rate = 920000;
    uint256 public constant RATE_PRECISION = 1000000;

    constructor() {}

    function setRate(uint256 _rate) external {
        rate = _rate;
    }

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external returns (uint256 amountOut) {
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "Transfer tokenIn failed"
        );

        amountOut = (amountIn * rate) / RATE_PRECISION;
        require(amountOut >= minAmountOut, "Slippage limit exceeded");

        // Try transferring tokenOut to recipient.
        // If this contract lacks balance, send what it can or mock it
        uint256 bal = IERC20(tokenOut).balanceOf(address(this));
        if (bal < amountOut) {
            // For a mock in test environments, if there is not enough tokenOut, 
            // we can fallback to transfer whatever balance is present or revert.
            // Let's require it to ensure full compliance with standard router behavior.
            require(
                IERC20(tokenOut).transfer(recipient, amountOut),
                "EURC payout transfer failed"
            );
        } else {
            require(
                IERC20(tokenOut).transfer(recipient, amountOut),
                "EURC payout transfer failed"
            );
        }
    }
}
