---
layout: post
title: 'Free Trade: Composable Smart Contracts'
date: 2018-08-10 12:00:00 +0000
categories: projects

---
In 2000, Simon Peyton Jones et al. proposed a [new combinator language](https://www.microsoft.com/en-us/research/publication/composing-contracts-an-adventure-in-financial-engineering/) for describing financial contracts. In fact, they appear to have thought this was such a good idea that Peyton Jones and Eber went on to redesign the language and write a [book chapter](https://www.microsoft.com/en-us/research/wp-content/uploads/2000/09/pj-eber.pdf) about it.

This expressive domain-specific language was designed to improve on the cumbersome representations of financial contracts used in traditional IT systems. The ultimate goal? It should be possible for financial domain experts to author and analyse contracts without waiting for custom implementation by programmers.

In July 2015, the Ethereum network was launched. Inspired by Bitcoin's distributed 'blockchain' ledger, Ethereum introduced a critical new feature: smart contracts. In addition to currency transfers, Ethereum allowed network participants to author and deploy actual programs to the blockchain. These smart contracts are now being experimentally applied in a number of areas: [prediction markets](https://gnosis.pm/), [stable currencies](https://makerdao.com/) and so on.

I was interested to see if the two technologies - a declarative contract language and smart contracts - could be combined in a useful way. It turned out that there had been some work in this area by the authors of [Findel](http://publications.uni.lu/bitstream/10993/30975/1/Findel_2017-03-08-CR.pdf), but I wanted to prototype an implementation with more advanced features.

I re-implemented the composing contracts language as a free monadic deep embedding in Haskell, then wrote a compiler from the contract language to the Solidity smart contract language. Now, you can write a European option:

    european :: Date -> Contract -> Contract
    european t u = when (at t) (u ` or ` zero )

Or an American option:

    american :: (Date, Date) -> Contract -> Contract
    american (t1,t2) u = anytime (between t1 t2) u

And have it compile straight to Solidity!

Of course, that isn't quite enough: we need some way of deploying these contracts to an Ethereum network. I also prototyped a Đapp for deploying, proposing and accepting contracts.