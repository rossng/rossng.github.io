---
layout: post
title: 'Free Trade: Composable Smart Contracts'
date: 2018-08-10 12:00:00 +0000
categories: projects

---
**Quick link:** [Free Trade: Composable Smart Contracts](https://www.researchgate.net/publication/326693413_Free_Trade_Composable_Smart_Contracts)

### Talking about contracts

In 2000, Simon Peyton Jones et al. proposed a [new combinator language](https://www.microsoft.com/en-us/research/publication/composing-contracts-an-adventure-in-financial-engineering/) for describing financial contracts. In fact, they appear to have thought this was such a good idea that Peyton Jones and Eber went on to redesign the language and write a [book chapter](https://www.microsoft.com/en-us/research/wp-content/uploads/2000/09/pj-eber.pdf) about it.

This expressive domain-specific language was designed to improve on the cumbersome representations of financial contracts used in traditional IT systems. The ultimate goal? It should be possible for financial domain experts to author and analyse contracts without waiting for custom implementation by programmers. For example, you can write a European:

    european :: Date -> Contract -> Contract
    european t u = when (at t) (u ` or ` zero )

Or an American option:

    american :: (Date, Date) -> Contract -> Contract
    american (t1,t2) u = anytime (between t1 t2) u

In just a line or two of code - and these constructs can themselves be embedded and reused in other contracts. More excitingly, we can have contracts that dynamically change over time in response to outside stimuli. Here's one that simply scales up and down with respect to some observable _volatilityIndex_.

    c7 :: Currency -> Contract
    c7 k = scale volatilityIndex (one k)

### Smart contracts

In July 2015, the Ethereum network was launched. Inspired by Bitcoin's distributed 'blockchain' ledger, Ethereum introduced a critical new feature: smart contracts. In addition to currency transfers, Ethereum allowed network participants to author and deploy actual programs to the blockchain. These smart contracts are now being experimentally applied in a number of areas: [prediction markets](https://gnosis.pm/), [stable currencies](https://makerdao.com/) and so on. Here's a trivial example: a contract which stores an unsigned integer. Any network participant can set or get the number.

    pragma solidity ^0.4.23;
    
    contract SimpleStorage {
      uint storedData;
      
      function set( uint x) public {
        storedData = x;
      }
      
      function get() public constant returns ( uint ) {
        return storedData;
      }
    }

More complex contracts can be used for transferring ETH, the Ethereum currency, and representing structures such as auctions, voting systems and ownership ledgers.

### Implementing Merchant

I was interested to see if the two technologies - a declarative contract language and smart contracts - could be combined in a useful way. It turned out that there had been some work in this area by the authors of [Findel](http://publications.uni.lu/bitstream/10993/30975/1/Findel_2017-03-08-CR.pdf), but I wanted to prototype an implementation with more advanced features.

I re-implemented the composing contracts language as a free monadic deep embedding in Haskell, then wrote a [compiler from the contract language to the Solidity smart contract language](https://github.com/rossng/merchant/). A user can write a contract that looks like the Haskell examples above and compile it directly to Solidity or to a deployable smart contract package.

Of course, that isn't quite enough: we need some way of deploying and managing these contracts on an Ethereum network. I also prototyped a [Đapp for deploying, proposing and accepting contracts](https://github.com/rossng/merchant-client). Users can upload a JSON contract description, deploy it to the network and then activate it by proposing it to another user.

![](/assets/dapp-screenshot.png)

### Evaluation

Is this a viable method for writing Ethereum financial contracts? Well, not today. Ethereum has a few key limitations that make financial contracts quite hard to replicate. 

First, it cannot trigger execution of a contract autonomously. That means that contracts cannot perform an action in response to some event. A user must trigger them, at which point the contract can verify that the event has occurred and execute.

Second, there is no widely accepted mechanism for debt enforcement. My prototype implementation simply uses a signed integer balance, not an ERC-20 token

I hope someone finds this useful! Head over and read the full thesis at [ResearchGate ](https://www.researchgate.net/publication/326693413_Free_Trade_Composable_Smart_Contracts)or [Internet Archive](https://archive.org/details/free-trade-composable-smart-contracts). [Get in touch](http://www.rossng.eu/about/) or create a GitHub issue if you have any questions.