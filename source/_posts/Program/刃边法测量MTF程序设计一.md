---
title: 刃边法检测MTF程序设计(一)
author: CloudWu
avatar: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog/Avatars/178440.jpg
authorLink: 
authorAbout: 傻傻的Cloud
authorDesc: 
categories: 程序
comments: false
date: 2021-05-01 15:10:35
tags:
keywords: 刃边法 MTF Matlab
description:
photos: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog@1.1.2/Post/Program/ESF2MTF_1/P2.bmp
---

## 引言
调制传递函数(Modulation Transfer Function)，简称MTF，是衡量镜头成像优劣的重要指标，有多种检测方法，如点光源法、狭缝法以及刃边法等。本文通过研究已知倾斜角度的**理想**刃边图像，简单介绍刃边法检测MTF的步骤及程序设计。

## 刃边法检测MTF步骤

**1)读取倾斜角度为8度的理想刃边图像，得到二维矩阵Image;**

**2)选用二维高斯函数作为退化函数，与矩阵Image作卷积，人工模糊理想刃边图像，如下图所示;**
{% fb_img https://cdn.jsdelivr.net/gh/CloudWuXu/Blog@1.1.2/Post/Program/ESF2MTF_1/P1.jpg %}

**3)几何投影法将二维矩阵Image投影到一维，得到边缘拓展函数(Edeg Spread Function,简称ESF)，如下图所示;**
{% fb_img https://cdn.jsdelivr.net/gh/CloudWuXu/Blog@1.1.2/Post/Program/ESF2MTF_1/P3.jpg %}

**4)边缘拓展函数求导得到线拓展函数(Line Spread Function,简称LSF)，如下图所示;**
{% fb_img https://cdn.jsdelivr.net/gh/CloudWuXu/Blog@1.1.2/Post/Program/ESF2MTF_1/P4.jpg %}

**5)线拓展函数离散傅里叶变换得到MTF，如下图所示。**
{% fb_img https://cdn.jsdelivr.net/gh/CloudWuXu/Blog@1.1.2/Post/Program/ESF2MTF_1/P5.jpg %}

## 程序设计
<pre>
  <code class="ESF2MTF.M">
    clc; clear all; close all;

    Image=im2double(rgb2gray(imread('0.bmp'))); %获取图像矩阵

    x=-5:0.01:5;
    y=-5:0.01:5; 
    sigma=0.1;
    Point_Spr_Function=exp(-(x.^2+y.^2)/(2*sigma)^2); %高斯函数，起模糊作用

    Image=conv2(Image,Point_Spr_Function,'same'); %将获取的矩阵与点扩散函数做卷积
    subplot(2,2,1)
    imshow(Image) %展示模糊后刃边
    axis on

    ESF_Size=floor(max(size(Image))*(cos(2*pi/45)+sin(2*pi/45)));
    Edge_Spr_Function(1,ESF_Size)=0; %初始化参数

    for w=1:size(Image)
        for h=1:size(Image)
            Space_X=(w*cos(2*pi/45)+h*sin(2*pi/45)); %几何投影
            Edge_Spr_Function(floor(Space_X))=(Edge_Spr_Function(floor(Space_X))+Image(h,w))/2;
        end
    end

    Edge_Spr_Function=Edge_Spr_Function(:,floor(0.25*ESF_Size):floor(0.75*ESF_Size)); %取刃边附近的灰度值
    subplot(2,2,2)
    Space_X=1:1:max(size(Edge_Spr_Function));
    plot(Space_X,Edge_Spr_Function,'k.')  %几何投影法将矩阵投影到一维数轴，获取边缘扩散函数

    Space_X=Space_X(:,1:(max(size(Space_X)-1)));
    Linear_Spr_Function=diff(Edge_Spr_Function); %矩阵方式求导
    subplot(2,2,3)
    plot(Space_X,Linear_Spr_Function,'k.') %离散点求导得到线扩散函数

    Max_Fre=5;
    omega=0:0.1:Max_Fre; %初始化参数

    Num=1:(max(size(Space_X)));
    Modul_Tran_Function=Linear_Spr_Function*exp(-i*(2*pi/(max(size(Space_X)))).*Num'*omega);
    Modul_Tran_Function=abs(Modul_Tran_Function);
    Modul_Tran_Function=Modul_Tran_Function./Modul_Tran_Function(1); %线扩散函数离散点作非周期傅里叶变换，得到MTF
    subplot(2,2,4)
    plot(omega,Modul_Tran_Function)
    axis([0 Max_Fre 0 1])
  </code>
</pre>