---
layout: post
date: 2020-04-11 8:29:51 +0100
title: My first LLVM program
categories: ''

---
Inspired by: [http://www.stephendiehl.com/llvm/](http://www.stephendiehl.com/llvm/ "http://www.stephendiehl.com/llvm/")

    declare i32 @putchar(i32)
    define void @main() { 
        call i32 @putchar(i32 42) 
        ret void
    }