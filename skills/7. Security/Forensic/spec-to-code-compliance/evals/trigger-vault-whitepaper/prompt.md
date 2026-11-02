---
description: A team pastes a whitepaper section and a numbered Solidity vault and asks whether the code does exactly what the paper says. The skill should fire; the reply should map each requirement with a match type and confidence score, flag the 5%-vs-0.5% fee and the missing 1% cap, and call the owner drain function undocumented. The SKILL.md cites IR_EXAMPLES.md, OUTPUT_REQUIREMENTS.md and COMPLETENESS_CHECKLIST.md, which are not in the skill folder; the full 16-section report is not required.
tags: [trigger, value]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

We're about to send our staking vault to an external audit. Before that, check whether the contract does exactly what section 3 of our whitepaper says: where it matches, where it doesn't, and anything the code does that the paper never mentions.

Whitepaper, section 3:

> 3.1 Deposits. Any user may deposit tokens. Each deposit restarts that user's 7-day lock.
>
> 3.2 Withdrawals. A user may withdraw up to their own balance once 7 days have passed since their last deposit. A withdrawal fee of 0.5% (50 basis points) of the withdrawn amount is sent to the treasury; the user receives the rest.
>
> 3.3 Fee governance. Only the owner may change the fee. The fee MUST NEVER exceed 1% (100 basis points).

StakeVault.sol:

```solidity
 1  // SPDX-License-Identifier: MIT
 2  pragma solidity ^0.8.20;
 3
 4  import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 5  import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
 6
 7  contract StakeVault is Ownable {
 8      IERC20 public immutable token;
 9      address public treasury;
10      uint256 public feeBps = 50;
11      mapping(address => uint256) public balances;
12      mapping(address => uint256) public depositTime;
13
14      constructor(IERC20 _token, address _treasury) Ownable(msg.sender) {
15          token = _token;
16          treasury = _treasury;
17      }
18
19      function deposit(uint256 amount) external {
20          require(amount > 0, "zero");
21          token.transferFrom(msg.sender, address(this), amount);
22          balances[msg.sender] += amount;
23          depositTime[msg.sender] = block.timestamp;
24      }
25
26      function withdraw(uint256 amount) external {
27          require(block.timestamp >= depositTime[msg.sender] + 7 days, "locked");
28          balances[msg.sender] -= amount;
29          uint256 fee = amount * feeBps / 1000;
30          token.transfer(treasury, fee);
31          token.transfer(msg.sender, amount - fee);
32      }
33
34      function setFee(uint256 newFeeBps) external onlyOwner {
35          feeBps = newFeeBps;
36      }
37
38      function emergencyWithdrawAll() external onlyOwner {
39          token.transfer(owner(), token.balanceOf(address(this)));
40      }
41  }
```
