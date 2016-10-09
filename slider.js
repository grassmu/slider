/**
 * @desc 图片轮播组件，根据设定的参数实现自动轮播，自动加载图片，状态点跟随
 * @author kardelchen
 * @version 0.0.2
 * @example var scroll = new Slide(option);
 * @change  0.0.2
 *          增加onLeft、onRight手势支持
 *          增加手指跟随参数判断，false的时候不元素不跟随手指滑动
 *          增加轮播极限参数判断，适用于需要动态添加内容的场景
 *          修改了动画过度方式
 *          修复自动轮播时多个定时器可能触发导致白屏的问题
 *          修复连续触发动画导致白屏的bug，保证一次动画执行完毕才可以执行下一次动画
 * ***********************************************************************************************
 * @method 对外提供几个方法供调用
 *          scroll.getCurrentIndex()    获取当前显示的轮播元素序号，从0开始，0,1,2,3,4,5....
 *          scroll.stopAuto()           暂时停止自动轮播图片，手指触摸后会再次恢复
 *          scroll.stopAutoThorough()   彻底停止自动轮播
 *          scroll.destroy()            销毁轮播滚动事件
 *          scroll.reverse()            恢复轮播，即重新绑定touch事件
 *          scroll.updateEL()           更新轮播元素，重新绑定事件
 *          scroll.toNext()             滚动到指定的元素
 *          其他的均是内部方法，不建议调用
 **************************************************************************************************
 * dom结构参考：
 *  <section class="mod-banner-scroll" id="index-banner">
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
 **************************************************************************************************
 css内容参考：
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
 */

define(function (require, exports, module) {
    function empty() {}

    function Slide(config) {
        this.width = window.innerWidth;
        this.option = {
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
        };
        $.extend(this.option, config);
        if (!this.option.domWrap) {
            throw new Error("轮播容器不能为空");
            return;
        }
        this._initEL();
    }

    Slide.prototype = {
        _initEL: function () {
            var _this = this, opt = _this.option;
            // 添加动画的dom元素
            this.animateNode = opt.domWrap.find(opt.animateNode);
            this.domList = opt.domWrap.find(opt.element);
            this.scrollLength = opt.rightLimit ? opt.rightLimit / opt.width : this.domList.length;
            // 是否要循环轮播元素，条件是设置了需要循环，并且轮播元素数量大于2个
            this.isLoop = opt.loop && this.scrollLength > 2;
            // 设置轮播元素的宽度，绝对定位所有元素
            this.domList.each(function (index, item) {
                item.style.cssText = "left:" + (_this.isLoop && index == _this.scrollLength - 1 ? -opt.width : index * opt.width) + "px;width:" + opt.width + "px";
            });
            // 用于记录位置信息
            this.position = {};
            // 记录初始的位置
            this.currentPosition = opt.width * opt.initIndex;
            // 当前滑动的次数
            this.currentIndex = opt.initIndex;
            // 上次滑动的次数
            this.lastIndex = 0;
            // 记录当前处于第几张轮播图
            this.nextIndex = 0;
            // 移动指定距离
            this._doAnimate(this.currentPosition, true)._animateEnd();
            this.option.onInit.call(this, this.domWrap, this.currentIndex);
            // 事件绑定
            this._initEvent();
            return this;
        },
        _initEvent: function () {
            // 自动轮播图
            if (this.option.auto) {
                this._startAuto();
            }
            // 绑定touch事件
            this._bindEvent();
        },
        // 设置轮播元素的位置
        _setELPosition: function () {
            if (this.lastIndex == this.currentIndex) {
                return;
            }
            var isLeft = this.lastIndex > this.currentIndex;
            var index = this.currentIndex, length = this.scrollLength;
            if (isLeft) {
                if (index <= 0) {
                    if (this.nextIndex == 0) {
                        this.nextIndex = this.scrollLength - 1;
                    }
                    if (index % length == 0) {
                        this.nextIndex = length - 1;
                    } else {
                        this.nextIndex = Math.abs(this.nextIndex - 1);
                    }
                } else {
                    if (index % length == 0) {
                        this.nextIndex = 0;
                    }
                    if ((index - 1) % length == 0) {
                        this.nextIndex = 0;
                    } else {
                        if (index == 0) {
                            this.nextIndex = length - 1;
                        } else {
                            this.nextIndex = Math.abs((index - 1) % length);
                        }
                    }
                }
                // 左滑
                var target = this.domList.eq(this.nextIndex);
                target.css({
                    left: (index - 1) * this.width
                });
            } else {
                // 右滑
                if ((index + 1) % length == 0) {
                    this.nextIndex = 0;
                } else {
                    this.nextIndex = (index + 1) % length;
                }
                var target = this.domList.eq(this.nextIndex);
                target.css({
                    left: (index + 1) * this.width
                });
            }
            this.lastIndex = this.currentIndex;
            return this;
        },
        _bindEvent: function () {
            var wrapNode = this.option.domWrap;
            wrapNode.on("touchstart touchmove touchend", $.proxy(this._handleEvent, this));
            this.animateNode.on("webkitTransitionEnd", $.proxy(this._animateEnd, this));
            return this;
        },
        /**
         * 事件处理
         * @param e
         * @private
         */
        _handleEvent: function (e) {
            switch (e.type) {
                case "touchstart":
                    this._start(e);
                    break;
                case "touchmove":
                    this._move(e);
                    break;
                case "touchend":
                    this._end(e);
                    break;
            }
        },
        /**
         * 动画执行完毕后的回调函数
         * @private
         */
        _animateEnd: function () {
            // 调用回调函数，提供dom对象以及序号
            this.option.onComplete.call(this, this.option.domWrap, this.currentIndex, this.scrollLength);
            this.isLoop && this._setELPosition();
            this.option.auto && this._startAuto();
            if(this.option.lazyLoad) {
                this._loadImage();
                // 多加载下一张
                this.option.preLoad && this._loadImage(this.getCurrentIndex() + 1);
            }
            this.scrollLock = false;
            return this;
        },
        /**
         * 执行动画
         * @param movePx
         * @param fast 指定是否快速到位
         * @private
         */
        _doAnimate: function (movePx, fast) {
            var time = fast ? 0 : this.option.animateTime;
            this.animateNode.css({
                "-webkit-transform": "translate3d(" + (movePx) + "px, 0, 0)",
                "-webkit-transition-duration": time + "ms"
            });
            return this;
        },
        _stopDocument: function (e) {
            e.preventDefault()
        },
        _start: function (e) {
            // 锁定，需要在一次动画执行完毕之后才执行下一次动画
            if(this.scrollLock) {
                return;
            }
            var evt = e.changedTouches[0];
            this.position.sx = evt.pageX;
            this.position.sy = evt.pageY;
            this.scrollLock = true;
            this.stopAuto();
            this.option.topDocMove && document.addEventListener("touchmove", this._stopDocument, false);
        },
        _move: function (e) {
            if(!this.option.fingerFollow || !this.position.sx) {
                return;
            }
            var evt = e.changedTouches[0],
                x = evt.pageX,
                y = evt.pageY;
            var dif = x - this.position.sx;
            if(Math.abs(y - this.position.sy) > 50) {
                return;
            }
            if(Math.abs(dif) > 20) {
                e.preventDefault();
                // 移动容器元素实现动画
                this.animateNode.css({
                    "-webkit-transform": "translate3d(" + (this.currentPosition + dif) + "px, 0, 0);",
                    "-webkit-transition-duration":  "0ms"
                });
            }
        },
        _end: function (e) {
            if(!this.position.sx) {
                return;
            }
            this.option.topDocMove && document.removeEventListener("touchmove", this._stopDocument, false);
            var evt = e.changedTouches[0],
                x = evt.pageX,
                y = evt.pageY;
            // 记录手指放开时的位置
            this.position.ex = x;
            // 计算移动距离
            var dif = this.position.ex - this.position.sx;
            if(dif == 0) {
                this.option.onClick.call(this);
                this.position = {};
                return;
            }
            // 纵向滑动，不做处理
            var difY = this.position.sy - y;
            if (Math.abs(difY) > 50) {
                this._doAnimate(-this.currentIndex * this.width, false);
            } else {
                // 移动距离小，回弹回去
                if (Math.abs(dif) < this.width / 4) {
                    this._doAnimate(-this.currentIndex * this.width);
                } else {
                    this.lastIndex = this.currentIndex;
                    // 判断移动的方向，小于0左滑
                    if (dif < 0) {
                        this.currentIndex++;
                        this.option.onLeft.call(this, this.currentIndex);
                    } else {
                        this.currentIndex--;
                        this.option.onRight.call(this, this.currentIndex);
                    }
                    if (!this.isLoop) {
                        this.currentIndex = this.currentIndex < 0 ? 0 : this.currentIndex >= this.scrollLength - 1 ? this.scrollLength - 1 : this.currentIndex;
                    }
                    this.toNext();
                }
            }
            this.position = {};
        },
        /**
         * 延迟加载图片
         * @private
         */
        _loadImage: function (index) {
            // eq这个方法可以接受负值作为参数，如果未负数，则从后往前提供dom对象
            index = index || this.getCurrentIndex();
            var target = this.domList.eq(index);
            if (target.length > 0 && !target.attr("loaded")) {
                var img = target.find("img"),
                    src = img.attr(this.option.lazyAttr);
                img.attr("src", src).removeAttr(this.option.lazyAttr);
                target.attr("loaded", 1);
            }
        },
        /**
         * 启动自动轮播
         * @private
         */
        _startAuto: function () {
            var _this = this;
            clearTimeout(_this.autoPtr);
            this.autoPtr = setTimeout(function () {
                if(_this.autoLock) {
                    return;
                }
                // 判断是否是循环的
                if (_this.isLoop) {
                    _this.currentIndex++;
                } else {
                    // 到底之后往回走
                    if (_this.currentIndex == _this.scrollLength - 1) {
                        _this.reverse = true;
                    } else if (_this.currentIndex == 0) {
                        _this.reverse = false;
                    }
                    if (_this.reverse) {
                        _this.currentIndex--
                    } else {
                        _this.currentIndex++;
                    }
                }
                _this.toNext()
            }, this.option.autoTime);
        },
        /**
         * 切换到下一个轮播元素
         * @private
         */
        toNext: function (index) {
            if (typeof index != 'undefined') {
                index = index < 0 ? 0 : index >= this.scrollLength - 1 ? this.scrollLength - 1 : index;
                this.lastIndex = this.currentIndex;
                this.currentIndex = index;
            }
            this.currentPosition = -this.currentIndex * this.width;
            this._doAnimate(this.currentPosition);
            return this;
        },
        stopAuto: function () {
            clearTimeout(this.autoPtr);
            this.autoPtr = null;
            this.reverse = false;
        },
        stopAutoThorough: function () {
            clearTimeout(this.autoPtr);
            this.autoPtr = null;
            this.reverse = false;
            this.option.auto = false;
        },
        /**
         * 获取当前轮播元素序号
         * @returns {number}
         */
        getCurrentIndex: function () {
            var current = this.currentIndex,
                mod = Math.ceil(Math.abs(current/this.scrollLength));
            return Math.abs(current < 0 ? (current + mod * this.scrollLength) % this.scrollLength : current % this.scrollLength);
        },
        destroy: function () {
            this.option.domWrap.off("touchstart touchmove touchend", $.proxy(this._handleEvent, this));
            this.animateNode.off("webkitTransitionEnd", $.proxy(this._animateEnd, this));
            this.stopAuto();
            return this;
        },
        updateEL: function () {
            this.destroy()._initEL();
        },
        reverse: function () {
            this._bindEvent()._animateEnd();
        }
    }

    module.exports = Slide;
})