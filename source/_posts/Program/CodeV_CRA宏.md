---
title: CodeV CRA宏程序设计
author: CloudWu
avatar: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog/Avatars/178440.jpg
authorLink: 
authorAbout: 傻傻的Cloud
authorDesc: 
categories: 程序
comments: false
date: 2021-07-21 20:48:12
tags:
keywords: CodeV CRA 宏
description:
photos: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog/Post/Program/ZemaxAut/Header.jpg
---

## 引言
CRA全称Chief Ray Angle，一般指的是主光线入射到像面(传感器)的角度。CRA在光学设计中是一个非常重要的概念，有兴趣的游客可以到知乎看看这篇介绍CRA的文章(https://zhuanlan.zhihu.com/p/37331624).
本文主要分享在Codev中使用的CRA宏，该程序是在相对照度宏(https://www.cybernet.co.jp/codev/lecture/macro/macro02.html) 的基础上进行修改，略显臃肿，欢迎大神斧正，邮件联系方式：779581219@qq.com.

## 程序
<pre>
  <code class="CRA.seq">
    rfd n

    lcl num ^CRA(21,25) ^maxfov(21) ^Height(21,25) ^maxCRA

    out #1
    ver all #1

    for ^z 1 (num z) !计算各像高对应的主光线入射角
      if (pos z^z)
          ^maxfov(^z) == sqrtf((xob z^z fL)**2 + (yob z^z fL)**2)
          if ^maxfov(^z) = 0
             out y
             wri
             wri "  WARNING: The last field in all active zoom positions"
             wri "           cannot be on-axis.  Macro aborted."
             wri
             rtn
          end if
          ^CRA(^z,1) == (aoi r1 sI w2 f1 z^z)
          ^Height(^z,1) == sqrtf((xob z^z f1)**2 + (yob z^z f1)**2)/^maxfov(^z)
           for ^f 2 (num f)
             ^CRA(^z,^f) == (aoi r1 sI w2 f^f z^z) !像面对应像高主光线入射角角度
             ^Height(^z,^f) == sqrtf((xob z^z f^f)**2 + (yob z^z f^f)**2)/^maxfov(^z) !对像高作归一化处理
             ^reldiff == ^Height(^z,^f)-^Height(^z,^f-1)
                if ^reldiff <= 0
                  out y
                  wri
                  wri  "  WARNING: This macro works best for monotonically increasing"
                  wri  "           field points (i.e., f1 < f2 < ... < fL)."
                  wri  "           This condition is not true for zoom position =>" ^z
                  wri
                  out n
                end if
          end for 
      end if
    end for

    ^format == "     'dd.ddd'                       'ddd.dd'" 
    out y !打印像高以及对应的CRA大小
    wri 
    wri 
    wri "                  CHIEF RAY EXIT ANGLE"
    wri "                ---------------------------------------"
    wri "                  Date:"  (dat)  "    Time:" (tim)
    wri
    wri " Lens File  =>" (fil)
    wri
    for ^z 1 (num z)
       if (pos z^z)
          wri " Lens Title =>" (tit z^z)    
          wri " Zoom #     =>"  ^z
          wri
          wri "  Field of View    Chief Ray Exit Angle"
          wri "                                    (бу)"
          wri " -----------------------------------------------"
          wri
          for ^f 1 (num f)
              wri q^format ^Height(^z,^f) ^CRA(^z,^f) 
          end for
          wri
        end if
    end for

    ^maxCRA==0
    for ^z 1 (num z)
        for ^f 1 (num f)
            ^maxCRA==maxf(^maxCRA,^CRA(^z,^f))
        end for
    end for
    ^maxCRA==roundf(^maxCRA)+1

    out #1
    ugr !打印像高以及对应CRA的2D图像
    tit "CHIEF RAY EXIT ANGLE VERSUS    FIELD HEIGHT"
    xla "Field Height"
    yla "Chief Ray Angle"
    xmi 0;xma 1;xde .1;xfo f 1
    ymi 0;yma ^maxCRA;yde ^maxCRA*.1;yfo f 1

    ^dataset == 0
    for ^z 1 (num z)
      if (pos z^z)
           ^dataset == ^dataset + 1
           if ^dataset < 21
             ^tit == (tit z^z)
             dpo ^tit
             spl pnt
             for ^f 1 (num f)
                ^Height(^z,^f) ^CRA(^z,^f)
             end for
             end
           else
             out y
             wri
             wri "   WARNING: Only 20 datasets are allowed per UGR plot"
             wri "            Data for last zoom position is not plotted"
             wri
             out n
           end if
       end if
    end for
    go

    out y
  </code>
</pre>