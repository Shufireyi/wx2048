//index.js
import directions from "./direction";
//获取应用实例
const app = getApp();
//滑动方向

Page({
  data: {
    grids: [],
    rows: 4,
    cols: 4,
    Mapping: {
      "2": {
        // text: "一",
        image: "./img/2.png"
      },
      "4": {
        // text: "二",
        image: "./img/4.png"
      },
      "8": {
        // text: "三",
        image: "./img/8.png"
      },
      "16": {
        // text: "四",
        image: "./img/16.png"
      },
      "32": {
        // text: "五",
        image: "./img/32.png"
      },
      "64": {
        // text: "六",
        image: "./img/64.png"
      },
      "128": {
        // text: "七",
        image: "./img/128.png"
      },
      "256": {
        // text: "八",
        image: "./img/256.png"
      },
      "512": {
        // text: "九",
        image: "./img/512.png"
      },
      "1024": {
        // text: "十",
        image: "./img/1024.png"
      },
      "2048": {
        // text: "十一",
        image: "./img/2048.png"
      }
    },
    userInfo: {},
    hasUserInfo: false
  },
  onLoad: function() {
    this.setData({
      grids: this.initGridsData()
    });
    this.generateNumber();
    this.generateNumber();
    // this.zuobi();
    wx.getUserInfo({
      success: res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      }
    });
  },
  onReady: function() {
    // let gameBox = selectorQuery.select("#game_box");
    wx.hideLoading();
  },

  // 作弊～ 测试获得2048的情况
  zuobi: function() {
    let grids = [...this.data.grids];
    grids[0][0] = grids[0][1] = 1024;
    this.setData({
      grids
    });
  },

  /**
   *
   * 初始化二维数组
   * @returns 初始化后的二维数组
   */
  initGridsData: function() {
    let grids = new Array();
    for (let i = 0; i < this.data.rows; i++) {
      grids[i] = new Array();
      for (let j = 0; j < this.data.cols; j++) {
        grids[i][j] = 0;
      }
    }
    return grids;
  },

  /**
   * 在随机位置生成新的数字 2/4
   */
  generateNumber: function() {
    if (!this.hasSpace()) {
      return;
    }
    let randx = Math.floor(Math.random() * 4);
    let randy = Math.floor(Math.random() * 4);
    while (true) {
      if (this.data.grids[randx][randy] === 0) {
        break;
      }
      randx = Math.floor(Math.random() * 4);
      randy = Math.floor(Math.random() * 4);
    }
    let randv = Math.random() < 0.5 ? 2 : 4;
    let grids = [...this.data.grids];
    grids[randx][randy] = randv;
    this.setData({
      grids: grids
    });
  },

  /**
   * 判断是否有空余空间产生新的数字
   *
   * @returns 布尔值
   */
  hasSpace: function() {
    let flag = false;
    for (let i = 0; i < this.data.rows; i++) {
      for (let j = 0; j < this.data.cols; j++) {
        if (this.data.grids[i][j] === 0) {
          flag = true;
          break;
        }
      }
      if (flag === true) {
        break;
      }
    }
    return flag;
  },

  /**
   * 重新开始游戏
   * 初始化数据
   */
  restart: function() {
    this.setData({
      grids: this.initGridsData()
    });
    this.generateNumber();
    this.generateNumber();
  },

  /**
   * 判断是否出现2048
   *
   * @returns 返回布尔值 true 代表成功
   */
  isSuccess: function() {
    for (let i = 0; i < this.data.grids.length; i++) {
      for (let j = 0; j < this.data.grids[i].length; j++) {
        if (this.data.grids[i][j] && this.data.grids[i][j] === 2048) {
          return true;
        }
      }
    }
    return false;
  },

  // 滑动事件的监听处理
  touchStart: function(events) {
    // 多指操作
    this.isMultiple = events.touches.length > 1;
    if (this.isMultiple) {
      return;
    }
    let touch = events.touches[0];
    this.touchStartClientX = touch.clientX;
    this.touchStartClientY = touch.clientY;
  },

  touchMove: function(events) {
    let touch = events.touches[0];
    this.touchEndClientX = touch.clientX;
    this.touchEndClientY = touch.clientY;
  },
  touchEnd: function(events) {
    if (this.isMultiple) {
      return;
    }

    let dx = this.touchEndClientX - this.touchStartClientX;
    let absDx = Math.abs(dx);
    let dy = this.touchEndClientY - this.touchStartClientY;
    let absDy = Math.abs(dy);

    //  单个方向滑动距离足够远
    if (Math.max(absDx, absDy) > 20) {
      let direction =
        absDx > absDy
          ? dx > 0 ? directions.RIGTH : directions.LEFT
          : dy > 0 ? directions.DOWN : directions.UP;
      this.dealMoveAction(direction);
    }
  },

  // 滑动后的主逻辑 调用 dealEmptyCell，merageSameNum
  dealMoveAction: function(direction) {
    let grids = [...this.data.grids];
    // 消除空格
    grids = this.dealEmptyCell(grids, direction);

    // 合并相同数字
    grids = this.merageSameNum(grids, direction);
    // 合并数字后，同方向可能出现空格 重新合并
    grids = this.dealEmptyCell(grids, direction);

    // 设置数据到视图中
    this.setData({
      grids
    });

    // 成功获得2048
    if (this.isSuccess()) {
      wx.showToast({
        title: "congratulations！",
        duration: 1500
      });
    } else {
      // 生成新的2/4
      this.generateNumber();
      // 判断游戏是否结束
      if (!this.hasSpace()) {
        wx.showToast({
          title: "game over !",
          duration: 1500
        });
      }
    }
  },

  /**
   * 滑动后消除格子之间的空白格å
   * @param {any} arr 二维数组
   * @returns 删除空白格的二维数组
   */
  dealEmptyCell: function(arr, direction) {
    let rv = arr;
    switch (direction) {
      case directions.UP:
        for (let i = 0; i < rv.length - 1; i++) {
          for (let j = 0; j < rv[i].length; j++) {
            let temp = i;
            if (rv[i][j] === 0) {
              while (++temp < rv.length && !rv[temp][j]);
              if (temp < rv.length) {
                rv[i][j] = rv[temp][j];
                rv[temp][j] = 0;
              }
            }
          }
        }
        break;
      case directions.DOWN:
        for (let i = rv.length - 1; i > 0; i--) {
          for (let j = 0; j < rv[i].length; j++) {
            let temp = i;
            if (rv[i][j] === 0) {
              while (--temp >= 0 && !rv[temp][j]);
              if (temp >= 0) {
                rv[i][j] = rv[temp][j];
                rv[temp][j] = 0;
              }
            }
          }
        }
        break;
      case directions.RIGTH:
        for (let i = 0; i < rv.length; i++) {
          for (let j = rv[i].length - 1; j >= 0; j--) {
            let temp = j;
            if (rv[i][j] === 0) {
              while (--temp >= 0 && !rv[i][temp]);
              if (temp >= 0) {
                rv[i][j] = rv[i][temp];
                rv[i][temp] = 0;
              }
            }
          }
        }
        break;
      case directions.LEFT:
        for (let i = 0; i < rv.length; i++) {
          for (let j = 0; j < rv[i].length - 1; j++) {
            let temp = j;
            if (rv[i][j] === 0) {
              while (++temp < rv[i].length && !rv[i][temp]);
              if (temp < rv[i].length) {
                rv[i][j] = rv[i][temp];
                rv[i][temp] = 0;
              }
            }
          }
        }
        break;
    }
    // console.log("删除空格后", rv);
    return rv;
  },

  /**
   * 删除空格后 合并相同数字
   * @param {any} arr 维护的二维数组
   * @param {any} direction 滑动方向
   * @returns 返回合并后的二维数组
   */
  merageSameNum: function(arr, direction) {
    let rv = arr;
    switch (direction) {
      case directions.UP:
        for (let i = 0; i < rv.length - 1; i++) {
          for (let j = 0; j < rv[i].length; j++) {
            let temp = i;
            while (temp < rv.length - 1) {
              if (rv[temp][j] && rv[temp][j] === rv[temp + 1][j]) {
                rv[temp][j] += rv[temp + 1][j];
                rv[temp + 1][j] = 0;
              }
              temp++;
            }
          }
        }
        break;
      case directions.DOWN:
        for (let i = rv.length - 1; i > 0; i--) {
          for (let j = 0; j < rv[i].length; j++) {
            let temp = i;
            while (temp > 0) {
              if (rv[temp][j] && rv[temp][j] === rv[temp - 1][j]) {
                rv[temp][j] += rv[temp - 1][j];
                rv[temp - 1][j] = 0;
              }
              temp--;
            }
          }
        }
        break;
      case directions.RIGTH:
        for (let i = 0; i < rv.length; i++) {
          for (let j = rv[i].length - 1; j > 0; j--) {
            let temp = j;
            while (temp > 0) {
              if (rv[i][temp] && rv[i][temp] === rv[i][temp - 1]) {
                rv[i][temp] += rv[i][temp - 1];
                rv[i][temp - 1] = 0;
              }
              temp--;
            }
          }
        }
        break;
      case directions.LEFT:
        for (let i = 0; i < rv.length; i++) {
          for (let j = 0; j < rv[i].length - 1; j++) {
            let temp = j;
            while (temp < rv[i].length - 1) {
              if (rv[i][temp] && rv[i][temp] === rv[i][temp + 1]) {
                rv[i][temp] += rv[i][temp + 1];
                rv[i][temp + 1] = 0;
              }
              temp++;
            }
          }
        }
        break;
    }
    // console.log("合并相同数字后", rv);
    return rv;
  },

  /**
   * 分享
   *
   * @param {any} res
   * @returns
   */
  onShareAppMessage: function(res) {
    return {
      title: "wx2048的分享",
      path: "/pages/index",
      success: () => {
        console.log("分享成功");
      }
    };
  }
});
