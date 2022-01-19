---
title: Zemax二元面环带宏
author: CloudWu
avatar: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog/Avatars/178440.jpg
authorLink: 
authorAbout: 傻傻的Cloud
authorDesc: 
categories: 程序
comments: false
date: 2021-12-17 19:21:32
tags:
keywords: Zemax 二元面 宏
description:
photos: https://cdn.jsdelivr.net/gh/CloudWuXu/Blog/Post/Program/ZemaxAut/Header.jpg
---

## 序
二元面常用于中远红外镜头的设计中,起改善色差和消除热差的作用,从而提升像质.但是二元面的加工比较复杂,而且有时将公式输入单点车机台后还会报错,笔者曾经试过一次,不论怎么调整此终报错,最后只能放弃使用二元面重新设计.至于为什么会报错,具体原因尚未找到.领导给了DOESAG宏,去计算二元面的环带位置,并且与Zemax自带的phase宏做对比,结果二者的结果不一致,二元面的数量以及位置都相差较大,以此判定二元面有问题,机台无法加工.

## 程序
<pre>
  <code class="DOESAG.zpl">
    !Sag Table for a Kinoform Lens
    !
    !This macro generates sag table for a kinoform lens and plots the phase.
    !
    !Assumptions:
    !1-)Lens is assumed to be rotationally symmetric.(Binary 2 type surfaces)
    !2-)Harmonic diffractive order is assumed to be 1.
    !3-)Zone radius are found iteratively. Stop criteria for error is entered as 10e-12.
    !
    !User inputs:
    !1-)Surface number
    !2-)Radius step
    !
    !Outputs:
    !1-)Aspheric sag, diffractive sag, phase, waves/mm, mm/waves data for radius iterated by step size.
    !2-)Radius, inner and outer sag, step height, waves/mm data for diffractive zones.
    !3-)Phase,integer part of phase, phase modula 1 wave plot
    !4-)Waves/mm plot
    !
    !
    !Author : Serhat Hasan ASLAN
    !Company: ASELSAN - MGEO
    !Contact: shaslan@aselsan.com.tr
    !Date:    22.08.2013


    !!!!!!!!!!!!User inputs!!!!!!!!!!!!


    input "Enter binary surface number: ", surf_number

    dummy = spro(surf_number,0)
    surf$ = $buffer()

          if surf$ $== "BINARY_2"

          else
              print "Error: Surface is not a kinoform."
              end
          endif

    input "Enter radius step size: ", step

          if (step < 0) | (step > sdia(surf_number))
             print "Error: Invalid step size."
             end
          else
          endif


    !!!!!!!!!!!!Get lens parameters!!!!!!!!!!!!


    pi = acos(-1)
    sdi = sdia(surf_number)
    crvt = curv(surf_number)
    conic_const = coni(surf_number)

    declare asphere_coeff,double,1,8

            for i,1,8,1
                asphere_coeff(i) = parm(i,surf_number)
            next

    index_1 = indx(surf_number-1)
    index_2 = indx(surf_number)
    wave = wavl(pwav())*1e-3

    operand = ocod("xdva")
    max_term = opev(operand,surf_number,1,0,0,0,0)
    norm_rad = opev(operand,surf_number,2,0,0,0,0)

    declare diff_coeff,double,1,max_term
    declare diff_coeff_cv,double,1,max_term

    for i,1,max_term,1
        diff_coeff(i) = opev(operand,surf_number,(2+i),0,0,0,0)
        diff_coeff_cv(i) = diff_coeff(i) * wave /(2*pi*powr(norm_rad,2*i))
    next


    !!!!!!!!!!!!Phase data!!!!!!!!!!!!


    iter_num = sdi / step

    declare phase,double,1,iter_num

    format 16.12
    for i,1,iter_num,1

        for j,1,max_term,1
            phase(i) = phase(i) + (diff_coeff_cv(j) * powr((i*step),2*j))/wave
        next

    next

    !!!!!!!!!!!!periods per mm, mm_per_period data!!!!!!!!!!!!


    declare waves_per_mm,double,1,iter_num
    declare mm_per_waves,double,1,iter_num

    format 16.12
    for i,1,iter_num,1

        for j,1,max_term,1
            waves_per_mm(i) = waves_per_mm(i) - 2*j*(diff_coeff_cv(j) * powr((i*step),2*j-1))/wave
            mm_per_waves(i) = 1 / waves_per_mm(i)
        next
        waves_per_mm(i) = abso(waves_per_mm(i))
        mm_per_waves(i) = abso(mm_per_waves(i))

    next


    !!!!!!!!!!!!Zone_number and zone radius!!!!!!!!!!!!


    zone_num = inte(abso(phase(iter_num)))

    declare zone_rad,double,1,zone_num

    for k,1,zone_num,1

        i=1
        label 1

            if abso(phase(i)) < k
                   !print i
                   i = i+1
            goto 1

            else
            endif

        rad_init = (i-1)*step
        rad_fin = i*step

        label 2

            rad_mid = (rad_init + rad_fin)/2

                phase_t3 = 0
            for j,1,max_term,1
                phase_t3 = phase_t3 + (diff_coeff_cv(j) * powr((rad_mid),2*j))/wave
            next
    
        if abso(phase_t3)<k
           rad_init = rad_mid
        else
           rad_fin = rad_mid
        endif

        if abso((abso(phase_t3) - k)) < 10e-12 then goto 3

           goto 2

        label 3

    zone_rad(k) = rad_mid

    next


    !!!!!!!!!!!!diffractive phase(phase(mod 1 wave))!!!!!!!!!!!!


    declare diff_phase,double,1,iter_num

    for i,1,iter_num,1
        if phase(i) > 0
            diff_phase(i) = phase(i) - inte(phase(i))
        else
            diff_phase(i) = phase(i) - (inte(phase(i))+1)
        endif
    next


    !!!!!!!!!!!!integer part of phase!!!!!!!!!!!!


    declare int_phase,double,1,iter_num

    for i,1,iter_num,1
            int_phase(i) = phase(i) - diff_phase(i)
    next


    !!!!!!!!!!!!manufacturing sag data!!!!!!!!!!!!


    declare radius,double,1,iter_num
    declare total_sag, double, 1, iter_num
    declare asphere_sag, double, 1, iter_num
    declare diff_sag, double, 1, iter_num

    for i,1,iter_num,1
        radius(i)= i * step
    next

    for i,1,iter_num,1

        asphere_sag_dummy = 0

        for j,1,8,1
            asphere_sag_dummy = asphere_sag_dummy + asphere_coeff(j)*powr(radius(i),2*j)
        next

        asphere_sag(i) = crvt * powr(radius(i),2)/(1+ sqrt(1-(1+conic_const)*powr(crvt*radius(i),2)))+ asphere_sag_dummy


        if phase(i)>0
            diff_sag(i) = phase(i)*wave/(index_1-index_2) - wave/(index_1-index_2)*inte(phase(i))
        else
            diff_sag(i) = phase(i)*wave/(index_1-index_2) - wave/(index_1-index_2)*(inte(phase(i))+1)
        endif
        total_sag(i) = asphere_sag(i) + diff_sag(i)

    next


    declare total_sag_zone , double, 2, zone_num,2
    declare asphere_sag_zone, double, 2, zone_num,2
    declare diff_sag_zone, double, 2, zone_num,2
    declare phase_zone, double, 2, zone_num,2
    declare step_height, double, 1, zone_num,2
    eps = 1e-6


    for i,1,zone_num,1

        asphere_sag_zone_dummy_1 = 0
        asphere_sag_zone_dummy_2 = 0

        for j,1,8,1
            asphere_sag_zone_dummy_1 = asphere_sag_zone_dummy_1 + asphere_coeff(j)*powr(zone_rad(i)-eps,2*j)
            asphere_sag_zone_dummy_2 = asphere_sag_zone_dummy_2 + asphere_coeff(j)*powr(zone_rad(i)+eps,2*j)
        next

        asphere_sag_zone(i,1) = crvt*powr((zone_rad(i)-eps),2)/(1+ sqrt(1-(1+conic_const)*powr(crvt*(zone_rad(i)-eps),2))) + asphere_sag_zone_dummy_1
        asphere_sag_zone(i,2) = crvt*powr((zone_rad(i)+eps),2)/(1+ sqrt(1-(1+conic_const)*powr(crvt*(zone_rad(i)+eps),2))) + asphere_sag_zone_dummy_2


        for j,1,max_term,1
            phase_zone(i,1) = phase_zone(i,1) + (diff_coeff_cv(j) * powr((zone_rad(i)-eps),2*j))/wave
            phase_zone(i,2) = phase_zone(i,2) + (diff_coeff_cv(j) * powr((zone_rad(i)+eps),2*j))/wave
        next

        if phase(i)>0
            diff_sag_zone(i,1) = phase_zone(i,1)*wave/(index_1-index_2) - wave/(index_1-index_2)*inte(phase_zone(i,1))
            diff_sag_zone(i,2) = phase_zone(i,2)*wave/(index_1-index_2) - wave/(index_1-index_2)*inte(phase_zone(i,2))
        else
            diff_sag_zone(i,1) = phase_zone(i,1)*wave/(index_1-index_2) - wave/(index_1-index_2)*(inte(phase_zone(i,1))+1)
            diff_sag_zone(i,2) = phase_zone(i,2)*wave/(index_1-index_2) - wave/(index_1-index_2)*(inte(phase_zone(i,2))+1)
        endif
        total_sag_zone(i,1) = asphere_sag_zone(i,1) + diff_sag_zone(i,1)
        total_sag_zone(i,2) = asphere_sag_zone(i,2) + diff_sag_zone(i,2)
        step_height(i) = abso(total_sag_zone(i,2)-total_sag_zone(i,1))
    next



    !!!!!!!!!!!!waves per mm data at zone radius!!!!!!!!!!!!


    declare waves_per_mm_zone,double,1,zone_num

    format 16.12
    for i,1,zone_num,1

        for j,1,max_term,1
            waves_per_mm_zone(i) = waves_per_mm_zone(i) + 2*j*(diff_coeff_cv(j) * powr(zone_rad(i),2*j-1))/wave
        next
        waves_per_mm_zone(i) = abso(waves_per_mm_zone(i))
    next


    !!!!!!!!!!!!text output!!!!!!!!!!!!


    format 2 int
    print ""
    print "Surface number: ", surf_number
    print ""


    format 2 int
    for i,1,max_term,1
        coeff$ = "Binary r^"+ $str(i*2)+" coefficient: "
        format 12.4 exp int
        print coeff$, diff_coeff_cv(i)
        format 2 int
    next


    format 10.6
    print ""
    print "Zone number     ","Zone radius    ","Inner rad. sag  ","outer rad. sag  ","  Step height","      Waves/mm "

    for i,1,zone_num,1

        if i == 1
           print i,"      ",zone_rad(i),"      ","         0","      ",total_sag_zone(i,1),"      ",step_height(i),"      ",waves_per_mm_zone(i)
        else
           print i,"      ",zone_rad(i),"      ",total_sag_zone(i-1,2),"      ",total_sag_zone(i,1),"      ",step_height(i),"      ",waves_per_mm_zone(i)
        endif

    next
        print zone_num+1,"      ",sdi,"      ",total_sag_zone(zone_num,2),"      ",total_sag(iter_num),"      ","   ------   ","    ",waves_per_mm(iter_num)



    format 13.8
    print ""

    print "  Radius             Total_sag        Asphere_sag     Diff_sag          Phase            Waves/mm        Mm/waves         Int_phase"
    for i,1,iter_num,1
          print radius(i),"    ",total_sag(i),"    ",asphere_sag(i),"    ", diff_sag(i),"    ", phase(i),"    ",waves_per_mm(i),"    ",mm_per_waves(i),"    ",int_phase(i)
    next




    !!!!!!!!!!!!plot!!!!!!!!!!!!


    !!!phase,int_phase, mod_phase plot!!!

    declare phase_2SD,double,1,iter_num*2+1

            for i,1,iter_num,1
                phase_2SD(i) = phase(iter_num+1-i)
            next
                phase_2SD(iter_num+1) = 0
            for i,1,iter_num,1
                phase_2SD(iter_num+1+i) = phase(i)
            next

    declare int_phase_2SD,double,1,iter_num*2+1

            for i,1,iter_num,1
                int_phase_2SD(i) = int_phase(iter_num+1-i)
            next
                int_phase_2SD(iter_num+1) = 0
            for i,1,iter_num,1
                int_phase_2SD(iter_num+1+i) = int_phase(i)
            next

    declare diff_phase_2SD,double,1,iter_num*2+1

            for i,1,iter_num,1
                diff_phase_2SD(i) = diff_phase(iter_num+1-i)
            next
                diff_phase_2SD(iter_num+1) = 0
            for i,1,iter_num,1
                diff_phase_2SD(iter_num+1+i) = diff_phase(i)
            next


    declare radius_2SD,double,1,iter_num*2+1

            for i,1,iter_num,1
                radius_2SD(i) = -radius(iter_num+1-i)
            next
                radius_2SD(iter_num+1) = 0
            for i,1,iter_num,1
                radius_2SD(iter_num+1+i) = radius(i)
            next

    declare phase_plt,double,1,2
    declare int_phase_plt,double,1,2
    declare mod_phase_plt,double,1,2
    declare line_plt,double,1,2


    format 2 int
    plot new
    plot title,"Phase of Radial DOE at Surface ", $STR(surf_number)
    plot titlex,"Radial Coordinate (mm)"
    format 2.3
    plot titley,"DOE Phase in Waves at ",$STR(wavl(pwav()))
    plot banner,"Phase Plot for a Kinoform"
    plot rangex,-sdi,sdi

         if phase(iter_num)<0
             y_lim = inte(phase(iter_num))
             plot rangey,y_lim,0
         else
             y_lim = inte(phase(iter_num))+1
             plot rangey,0,y_lim
         endif

    plot data,radius_2SD,phase_2SD,2*iter_num+1,3,0,0
    plot data,radius_2SD,int_phase_2SD,2*iter_num+1,2,0,0
    plot data,radius_2SD,diff_phase_2SD,2*iter_num+1,1,0,0

         for i,1,2,1
             if  y_lim > 0
                 phase_plt(i) = -2/7*y_lim
                 int_phase_plt(i) = -2.5/7*y_lim
                 mod_phase_plt(i) = -3/7*y_lim
             else
                 phase_plt(i) = 9/7*y_lim
                 int_phase_plt(i) = 9.5/7*y_lim
                 mod_phase_plt(i) = 10/7*y_lim
             endif

             line_plt(i) = (i-1)/15.5*sdi*2-sdi

        next

    plot data, line_plt, phase_plt,2,3,0,0
    plot data, line_plt, int_phase_plt,2,2,0,0
    plot data, line_plt, mod_phase_plt,2,1,0,0
    plot label,0.2,0.12,0,1,"Phase"
    plot label,0.2,0.08,0,1,"INT(Phase)"
    plot label,0.2,0.04,0,1,"Phase modulo 1 wave"

    plot go

    !!!waves per mm plot!!!

    declare waves_mm_plt,double,1,2

    format 2 int
    plot new
    plot title,"Waves per mm at Surface ", $STR(surf_number)
    plot titlex,"Radial Coordinate (mm)"
    plot titley,"Waves/mm"
    plot banner,"Waves per mm Plot for a Kinoform"
    format 2.3
    plot rangex,0,sdi
    plot rangey,0,waves_per_mm(iter_num)

    plot data,radius,waves_per_mm,iter_num,3,0,0

         for i,1,2,1
             line_plt(i) = (i-1)/15.5*sdi*2
         next

         for i,1,2,1
                 if  waves_per_mm(iter_num) > 0
                     waves_mm_plt(i) = -2.5/7*waves_per_mm(iter_num)
                 else
                     waves_mm_plt(i) = 9.5/7*waves_per_mm(iter_num)
                 endif
        next

    plot data, line_plt, waves_mm_plt,2,3,0,0
    plot label,0.2,0.08,0,1,"Waves/mm"

         format 10.6
         for i,1,zone_num,1
                x_pos = 0.1 + (0.7/sdi) * zone_rad(i)
                y_pos = 0.298 + (0.6/waves_per_mm(iter_num)) * waves_per_mm_zone(i)
                plot label,x_pos,y_pos,0,1,"X"
         next

    plot go

    print " "
    print "Completed."

    !!!!!!!!!!!!End!!!!!!!!!!!!
  </code>
</pre>