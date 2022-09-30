---
title: CodeV赛德尔像差系数宏程序设计
author: CloudWu
avatar: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog/Avatars/178440.jpg
authorLink: 
authorAbout: 傻傻的Cloud
authorDesc: 
categories: 程序
comments: false
date: 2021-07-22 20:34:13
tags:
keywords: 赛德尔像差系数 Codev 宏
description:
photos: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog/Post/Program/ZemaxAut/Header.jpg
---

## 引言
打开CodeV中的分析->3阶像差，便可查看系统的赛德尔像差系数，但是个人习惯了Zemax的以波前的方式表示赛德尔像差系数，故此编写了赛德尔像差系数宏。

## 程序
<pre>
  <code class="SeidelAberration.seq">
    !*************************************************
	! ARG0 "Seidel Aberration Coefficients in Waves"
	!
	! ARG1 NAME    "Primary Wavelength:"
	! ARG1 TYPE    INT
	! ARG1 DEFAULT 2
	! ARG1 HELP    "Primary Wavelength to use (default=2)"
	!**************************************************
	! 设置输入框，输入系统主波长

	rfd 2 
	lcl num ^wal
	^wal==#1 !默认w2为主波长

	out n
	buf del b0 !缓存系统波长信息
	buf y
	wav; go
	buf n
	buf mov i1 j1

	for ^z 1 (num z) !按照多重结构开始循环
		buf fnd "WAVELENGTHS" !找到波长所在得位置
		out y
		wri "Zoom:" (tit z^z) 
		^pos_wal==^wal+1
		wri "Primary Wavelength:" (buf.num ic j^pos_wal) "NM" !打印系统主波长
		wri "          Suf        SPHA          COMA          FCUR          ASTI          AXCL          LCAL"
		for ^s 1 (num s) !计算以波前的方式表示赛德尔像差系数
			^spha==(sa s^s w^wal z^z)*1e6/(8*(buf.num ic j^pos_wal))  !球差
			^coma==(tco s^s w^wal z^z)*1e6/(2*(buf.num ic j^pos_wal)) !彗差
			^fcur==(ptb s^s w^wal z^z)*1e6/(4*(buf.num ic j^pos_wal)) !场曲
			^asti==(tas s^s w^wal z^z)*1e6/(2*(buf.num ic j^pos_wal)) !像散
			^axcl==(ax s^s z^z)*1e6/(2*(buf.num ic j^pos_wal))        !轴向色差
			^lacl==(lat s^s z^z)                                      !垂轴色差
			wri ^s ^spha ^coma ^fcur ^asti ^axcl ^lacl
		end for
		wri	
		out n;
	end for
  </code>
</pre>