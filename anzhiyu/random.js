var posts=["2021/04/25/Optics/1D_PTSTSCTOWNs/","2021/10/09/Optics/Zemax常用操作数/","2021/06/11/Optics/5X红外变焦镜头初始结构搭建/","2021/03/03/Optics/20-120mm可见光变焦镜头设计/","2021/08/25/Optics/目镜设计心得/","2021/07/21/Program/CodeV_CRA宏/","2021/12/17/Program/Zemax二元面环带宏/","2021/03/20/Program/Zemax自动扩展视场优化程序/","2021/05/01/Program/刃边法测量MTF程序设计一/","2021/02/07/Think/Introduction/","2021/11/17/Think/审判系列游戏简评/","2021/11/17/Think/烟鬼/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };