import fmtUnit from '../_util/fmtUnit';

Component({
  props: {
    className: '',
    // tabbar激活的 tab 样式 class
    activeCls: '',
    // tabbar的自定义样式class
    tabBarCls: '',
    // 选中选项卡下划线颜色 & 胶囊选中背景色
    tabBarUnderlineColor: '#1677FF',
    // 选中选项卡字体颜色
    tabBarActiveTextColor: '#1677FF',
    // 胶囊选中选项卡字体颜色
    capsuleTabBarActiveTextColor: '#ffffff',
    // 未选中选项卡字体颜色
    tabBarInactiveTextColor: '#333333',
    // 未选中描述字体颜色
    tabBarSubTextColor: '#999999',
    // 选中描述字体颜色
    tabBarActiveSubTextColor: '#ffffff',
    // 选项卡背景颜色
    tabBarBackgroundColor: '#ffffff',
    // 胶囊选项卡未选中的背景色
    capsuleTabBarBackgroundColor: '#e5e5e5',
    showPlus: false,
    // tabs 内容区是否可拖动，true 可拖动，内容区固定高度 false 不可拖动，内容区自适应高度
    swipeable: true,
    // 当前激活tab id
    activeTab: 0,
    animation: true,
    duration: 500,
    // 是否为胶囊形式 tab
    capsule: false,
    // 是否有副标题
    hasSubTitle: false,
    elevator: false,
    floorNumber: [],
    elevatorTop: '0px',
    showBadge: false,
    // 选中选项卡下划线宽度
    tabBarUnderlineWidth: '',
    // 选中选项卡下划线高度
    tabBarUnderlineHeight: '',
    // 电梯组件 tab-content 距离顶部高度
    elevatorContentTop: 0,
    // 通过接收外部传值，动态控制 tab-content 在 swiper 下的高度
    tabContentHeight: '',
    // plus icon 类型更多的支持
    plusIcon: 'add',
    plusIconSize: 16,
    plusIconColor: '',
    // plus icon 使用 image 的方式
    plusImg: '',
    plusImgWidth: '',
    plusImgHeight: '',
    // tab-bar 是否滚动定位在顶部的判断
    stickyBar: false,
  },
  data: {
    windowWidth: 0,
    tabWidth: 0.25,
    autoplay: false,
    animation: false,
    showLeftShadow: false,
    showRightShadow: true,
    version:'1.10.0',
    viewScrollLeft: 0,
    tabViewNum: 0,
    hideRightShadow: false,
    boxWidth: 0,
    elWidth: 0,
    tabFontSize15: fmtUnit('15px'),
    tabFontSize13: fmtUnit('13px'),
    _showPlus: false,
    tabsWidthArr: [],
  },
  async didMount() {
    const { tabs, animation, hasSubTitle, elevator, showPlus } = this.props;
    if (tabs.length !== 0 || !tabs) {
      this.setData({
        _showPlus: showPlus,
      });
      this.setWindowWidth();

      if (hasSubTitle) {
        this.setData({
          capsule: true,
        });
      }
      this.setData({
        tabWidth: tabs.length > 3 ? 0.25 : 1 / tabs.length,
        animation,
        autoplay: true,
      });
      if (elevator) {
        this.setData({
          swipeable: false,
        });
        // 记录电梯组件总高度，并写入 data
        my.createSelectorQuery()
          .select('#am-tabs-elevator-content')
          .boundingClientRect()
          .exec((ret) => {
            if (ret && ret[0]) {
              this.setData({
                elevatorHeight: ret[0].height,
              });
            }
          });
        // 获取电梯组件每个 pane 的 top 值
        const floorNumber = await this.getElevatorHeight(tabs);
        // 滚动到指定是初始位置
        my.pageScrollTo({
          scrollTop: Math.ceil(floorNumber[this.props.activeTab]),
          duration: 1,
        });
      }

      // 初始状态下，如果 activeTab 数值较大，会将后面的 tab 前移
      let boxWidth = 0;
      let elWidth = 0;
      let elLeft = 0;
      my.createSelectorQuery()
        .select(`#tabs-item-${this.props.tabsName}-${this.props.activeTab}`)
        .boundingClientRect()
        .exec((ret) => {
          if (ret && ret[0]) {
            elWidth = (<my.IBoundingClientRect>ret[0]).width;
            elLeft = (<my.IBoundingClientRect>ret[0]).left;
            this.setData({
              elWidth,
              elLeft,
            });
          }
        });
      my.createSelectorQuery()
        .select(`#am-tabs-bar-${this.props.tabsName}-content`)
        .boundingClientRect()
        .exec((ret) => {
          if (ret && ret[0]) {
            boxWidth = (<my.IBoundingClientRect>ret[0]).width;
            this.setData({
              boxWidth,
            });
            setTimeout(() => {
              this.setData({
                viewScrollLeft: Math.floor(
                  this.data.elWidth + this.data.elLeft - this.data.boxWidth,
                ),
              });
            }, 300);
          }
        });
    }
  },
  didUpdate(prevProps, prevData) {
    const {
      tabs,
      elevator,
      showPlus,
      activeTab: currentActiveTab,
      tabsName,
      swipeable,
    } = this.props;
    this.setData({
      _showPlus: showPlus,
    });
    if (prevProps.tabs.length !== tabs.length) {
      this.setData({
        tabWidth: tabs.length > 3 ? 0.25 : 1 / tabs.length,
      });
    }

    if (elevator) {
      // 当 didUpdate 时判断电梯组件总高度是否发生变化
      my.createSelectorQuery()
        .select('#am-tabs-elevator-content')
        .boundingClientRect()
        .exec((ret) => {
          if (ret && ret[0].height !== this.data.elevatorHeight) {
            // 如高度变化将页面滚动至顶部，重新设置电梯总高度
            my.pageScrollTo({
              scrollTop: 0,
              success: () => {
                this.setData({
                  elevatorHeight: ret[0].height,
                });
                // 总高度变化后，重新获取电梯组件每个 panel 的 top 值
                this.getElevatorHeight(tabs);
              },
            });
          }
        });
      this.$page.data.floorNumber = this.data.floorNumber;
      if (this.$page.data.getFloorNumber >= 0) {
        this.setData({
          tabViewNum: this.$page.data.getFloorNumber,
          prevTabViewNum: prevData.tabViewNum,
        });
      }

      if (currentActiveTab !== prevProps.activeTab) {
        this.setData({
          tabViewNum: currentActiveTab,
          prevTabViewNum: prevData.tabViewNum,
        });

        my.pageScrollTo({
          scrollTop: Math.ceil(this.data.floorNumber[currentActiveTab]),
          duration: 1,
        });
      }
    } else if (currentActiveTab !== prevProps.activeTab) {
      let boxWidth = 0;
      let elWidth = 0;
      let elLeft = 0;
      const className = `am-tabs-bar-tab ${
        !this.props.hasSubTitle && this.props.capsule ? 'am-tabs-bar-tab-capsule' : ''
      } ${this.props.hasSubTitle ? 'am-tabs-bar-tab__hasSubTitle' : ''} ${this.props.tabBarCls}`;

      my.createSelectorQuery()
        .selectAll(`.${className}`)
        .boundingClientRect()
        .exec((ret) => {
          if (ret && ret[0]) {
            this.setData({
              tabsWidthArr: ret[0].map((item) => item.width),
            });
          }
        });

      my.createSelectorQuery()
        .select(`#tabs-item-${tabsName}-${currentActiveTab}`)
        .boundingClientRect()
        .exec((ret) => {
          if (ret && ret[0]) {
            elWidth = (<my.IBoundingClientRect>ret[0]).width;
            elLeft = (<my.IBoundingClientRect>ret[0]).left;
            this.setData({
              elWidth,
              elLeft,
            });
          }
        });

      my.createSelectorQuery()
        .select(`#am-tabs-bar-${tabsName}-content`)
        .boundingClientRect()
        .exec((ret) => {
          if (ret && ret[0]) {
            boxWidth = (<my.IBoundingClientRect>ret[0]).width;
            this.setData({
              boxWidth,
            });

            // mock el.offsetLeft
            const elOffeseLeft = this.data.tabsWidthArr.reduce((prev, cur, index) => {
              if (index < this.props.activeTab) {
                // eslint-disable-next-line no-param-reassign
                prev += cur;
              }
              return prev;
            }, 0);

            if (this.data.elWidth > this.data.boxWidth / 2) {
              setTimeout(() => {
                this.setData({
                  viewScrollLeft: elOffeseLeft - 40,
                });
              }, 300);
            } else {
              setTimeout(() => {
                this.setData({
                  viewScrollLeft: swipeable
                    ? elOffeseLeft
                    : elOffeseLeft - Math.floor(this.data.boxWidth / 2),
                });
              }, 300);
            }
          }
        });
    }
  },
  methods: {
    setWindowWidth() {
      my.getSystemInfo({
        success: (res) => {
          this.setData({
            windowWidth: res.windowWidth,
          });
        },
      });
    },
    getElevatorHeight(tabs) {
      return new Promise((resolve) => {
        for (let i = 0; i < tabs.length; i++) {
          my.createSelectorQuery()
            .select(`#am-tabs-elevator-pane-${i}`)
            .boundingClientRect()
            .select('.am-tabs-bar-sticky')
            .boundingClientRect()
            .exec((ret) => {
              if (ret && ret[0]) {
                const { elevatorTop, elevatorContentTop } = this.props;
                let tabContentDistance = 0;
                if (elevatorTop.match(/\d+px/)) {
                  tabContentDistance = parseInt(elevatorTop, 10);
                } else {
                  tabContentDistance = parseInt(elevatorContentTop, 10);
                }
                this.props.floorNumber[i] =
                  (<my.IBoundingClientRect>ret[0]).top - ret[1].height - tabContentDistance;
                this.setData({
                  floorNumber: this.props.floorNumber,
                });
                if (i === tabs.length - 1) {
                  resolve(this.props.floorNumber);
                }
              }
            });
        }
        setTimeout(() => {
          this.$page.data.floorNumber = this.data.floorNumber;
        }, 100);
      });
    },
    handleSwiperChange(e) {
      const { current } = e.detail;
      const { tabsName } = e.target.dataset;

      this.setData({
        tabViewNum: current,
      });

      if (this.props.onChange) {
        this.props.onChange({ index: current, tabsName });
      }
    },
    handleTabClick(e) {
      const { index, tabsName, floor } = e.target.dataset;
      if (this.props.onTabClick && !this.props.elevator) {
        this.props.onTabClick({ index, tabsName });
      }
      if (this.props.onTabClick && this.props.elevator) {
        this.setData({
          tabViewNum: this.data.prevTabViewNum,
        });
        setTimeout(() => {
          this.props.onTabClick({ index, tabsName });
        }, 300);
        my.pageScrollTo({
          scrollTop: Math.ceil(floor),
          duration: 1,
        });
      }
    },
    handlePlusClick() {
      if (this.props.onPlusClick) {
        this.props.onPlusClick();
      }
    },
    showLeftShadow(e) {
      const { scrollLeft, scrollWidth } = e.detail;
      // 判断是否隐藏左边的阴影
      if (scrollLeft > 0) {
        this.setData({
          showLeftShadow: true,
        });
      } else {
        this.setData({
          showLeftShadow: false,
        });
      }
      // 判断是否隐藏右边的阴影
      if (scrollLeft + this.data.boxWidth >= scrollWidth - 8) {
        this.setData({
          showRightShadow: false,
        });
      } else {
        this.setData({
          showRightShadow: true,
        });
      }
    },
    onTabFirstShow(e) {
      // SDKversion 最低要求 1.9.4
      const { index, tabsName } = e.target.dataset;
      if (this.props.onTabFirstShow) {
        this.props.onTabFirstShow({ index, tabsName });
      }
    },
  },
});
