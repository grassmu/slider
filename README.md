## 图片轮播组件，根据设定的参数实现自动轮播，自动加载图片，状态点跟随

##用法
```javascript
  var scroll = new Slide(option);
  // 普通图片轮播
  new Slide({
    domWrap: $("#index-banner"),
    auto: true,
    loop: true,
    lazyLoad: true,
    animateTime: 300,
    preLoad: true,
    onComplete: function (dom , index, length) {
        dom.find(".status-bar i").eq(this.getCurrentIndex()).addClass("cur").siblings().removeClass("cur");
    }
  // tab切换的场景下，需要动态append内容到轮播容器的场景
  new Slide({
      domWrap: $(".mod-bn-shop-item-list"),
      animateNode: ".shop-list-wrap",
      topDocMove: false,
      loop: false,
      element: "ul",
      rightLimit: window.innerWidth * 2,
      animateTime: 300,
      onComplete: function () {
          window.scrollTo(0, 0);
          var index = this.currentIndex, last = this.lastIndex,
              opt = this.option, scrollList = opt.domWrap.find(opt.element);
          scrollList.eq(last).height(window.innerHeight - 100);
          scrollList.eq(index).height("auto");
          var tabNode = $(".menu-list li[index='"+ index +"']");
          tabNode.trigger("click");
      }
  });
```

##option说明
```javascript
  domWrap: "",            // 最外层的dom容器
  auto: false,            // 是否自动轮播
  element: "li",          // 轮播元素
  topDocMove: true,       // 手指放上去后是否禁用页面的滑动
  animateNode: "ul",      // 执行动画的元素
  loop: true,             // 循环图片
  rightLimit: "",         // 右边极限位置
  width: window.innerWidth,   // 轮播元素宽度
  preLoad: false,         // 是否需要多加载一张图
  lazyLoad: false,        // 懒加载图片
  animateTime: 500,       // 动画执行事件
  fingerFollow: true,     // 手指跟随动画
  lazyAttr: "data-lazy",  // 懒加载图片属性
  initIndex: 0,           // 初始化加载那一张图
  autoTime: 5000,         // 自动轮播间隔
  onClick: empty,         // 手指点击动作的回调函数
  onInit: empty,
  onLeft: empty,          // 手指点击动作的回调函数
  onRight: empty,
  onComplete: empty
```

## dom结构参考
```html
<section class="mod-banner-scroll" id="index-banner">
     <ul class="scroll-list">
         <li class="needsclick"><img data-lazy="../../static/style/baina/img/baina/banner-2.png"></li>
         <li class="needsclick"><img data-lazy="../../static/style/baina/img/baina/banner-1.png"></li>
         <li class="needsclick"><img data-lazy="../../static/style/baina/img/baina/banner-3.png"></li>
         <li class="needsclick"><img data-lazy="../../static/style/baina/img/baina/banner.png"></li>
     </ul>
     <div class="status-bar">
        <i></i><i></i><i></i><i></i>
     </div>
 </section>
```

## css代码参考
```css
  .mod-banner-scroll {
        width: 16rem;
        height: 5rem;
        position: relative;
        background-color: #fff;
        overflow: hidden;
    }

   .mod-banner-scroll .scroll-list {
        position: relative;
        width: 3000px;
        -webkit-transition-timing-function: ease;
        transition-timing-function: ease;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
    }

   .mod-banner-scroll .scroll-list li {
        width: 16rem;
        height: 5rem;
        position: absolute;
        top: 0;
        left: 0;
    }

   .mod-banner-scroll .scroll-list li img {
        width: 100%;
      }

   .mod-banner-scroll .status-bar {
        position: absolute;
        bottom: .5rem;
        left: 0;
        text-align: center;
        width: 100%;
        height: .3rem;
        font-size: 0;
    }

   .mod-banner-scroll .status-bar i {
        display: inline-block;
        width: .3rem;
        height: .3rem;
        -webkit-border-radius: 20px;
        border-radius: 20px;
        margin-left: .5rem;
        vertical-align: middle;
        background-color: #9d9a98;
    }

   .mod-banner-scroll .status-bar i.cur {
        background-color: #f60;
    }
```
