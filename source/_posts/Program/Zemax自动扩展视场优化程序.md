---
title: Zemax自动扩展视场优化程序
author: CloudWu
avatar: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog/Avatars/178440.jpg
authorLink: 
authorAbout: 傻傻的Cloud
authorDesc: 
categories: 程序
comments: false
date: 2021-03-20 14:15:58
tags:
keywords: Zemax 宏
description:
photos: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog@1.1.1/Post/Program/ZemaxAut/Header.jpg
---

## 引言
在光学设计中，初始结构尤为重要，一个越接近设计指标的初始结构能让后续的优化事半功倍。理想很丰满，现实很骨感，总有些时候，相对合适的初始结构与设计指标还是存在一定的差距。这时候就需要自己构建更加合适的初始结构，像我这种缺乏经验的菜鸟，选择一个最接近的初始结构，从中心视场开始优化，一步步扩展到目标视场。这个过程比较漫长且重复性工作略多，所以写了一个自动扩展视场优化程序，减轻工作量，增加划水时间。

## 程序
<pre>
  <code class="Aut.ZPL">
    ftyp(0)                  !选择视场类型(0角度,1物高,2近轴像高,3实际像高)
    Field_Strat = fldy(6)    !读取当前最大视场且不能为0
    ! 设计过程一般取六个视场且默认第六个视场为最大视场
    Field_End =              !输入目标视场
    Step =                   !输入扩展步长
    for i,Field_Strat,Field_End,Step  !将当前最大视场赋予i，以Step步长扩展至目标视场
	    fldy(1) = 0          !第一个视场为中心视场，可不写，如此类推
	    fldy(2) = 0.3*i     
	    fldy(3) = 0.5*i      
	    fldy(4) = 0.7*i       
	    fldy(5) = 0.85*i 
	    fldy(6) = i      
        update               !更新所有视场
        optimize             !自动优化
    next
  </code>
</pre>