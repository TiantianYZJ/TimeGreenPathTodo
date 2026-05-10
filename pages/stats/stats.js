const app = getApp();
// 引入echarts
import * as echarts from '../../miniprogram_npm/ec-canvas/echarts';

Page({
  data: {
    total: 0,
    completed: 0,
    progress: 0,
    avgCompletionTime: '0h',
    categoryStats: [],
    lastUpdated: "",
    locationStats: [],
    locationTotal: 0,
    locationMarkers: [],
    locationPoints: [],
    mapCenter: { latitude: 39.90403, longitude: 116.407526 },
    overviewChart: {
      lazyLoad: true
    },
    trendChart: {
      lazyLoad: true
    },
    timeChart: {
      lazyLoad: true
    },
    timeOfDayStats: []
  },

  onShareAppMessage() {
    return {
      title: '时光绿径待办-您的每日任务足迹管家',
      path: '/pages/todo/todo',
      imageUrl: 'https://pic1.imgdb.cn/item/6814180958cb8da5c8d64852.png'
    }
  },

  onShareTimeline() {
    return {
      title: '时光绿径待办-您的每日任务足迹管家',
      path: '/pages/todo/todo',
      imageUrl: 'https://pic1.imgdb.cn/item/6814180958cb8da5c8d64852.png'
    }
  },

  onShow() {
    const todos = wx.getStorageSync('todos') || [];
    this.updateStats(todos);
  },

  updateStats(todos) {
    const completed = todos.filter(item => item.completed).length;
    const total = todos.length;
    const progress = total ? Math.min((completed / total * 100), 100).toFixed(0) : 0;
    
    // 计算平均完成时间
    const avgCompletionTime = this.calculateAvgCompletionTime(todos);
    
    // 分析位置数据
    const { markers, points, center } = this.analyzeMapMarkers(todos);
    
    // 分类统计
    const categoryStats = this.calculateCategoryStats(todos);
    
    // 最近更新时间
    const lastUpdated = this.getLastUpdatedTime(todos);

    // 位置统计
    const locationStats = this.analyzeLocations(todos);
    const locationTotal = locationStats.reduce((sum, item) => sum + item.count, 0);
    
    // 时间分布统计
    const timeOfDayStats = this.analyzeTimeOfDay(todos);
    
    // 准备图表数据
    this.initOverviewChart(total, completed);
    this.initTrendChart(todos);
    this.initTimeChart(timeOfDayStats);

    this.setData({
      total,
      completed,
      progress,
      avgCompletionTime,
      categoryStats,
      lastUpdated,
      locationStats,
      locationTotal,
      locationMarkers: markers,
      locationPoints: points,
      mapCenter: center,
      timeOfDayStats
    });
  },

  // 计算平均完成时间
  calculateAvgCompletionTime(todos) {
    const completedTodos = todos.filter(item => item.completed && item.time && item.completed);
    if (completedTodos.length === 0) return '0h';
    
    const totalTimeDiff = completedTodos.reduce((sum, todo) => {
      const createTime = new Date(todo.time).getTime();
      const completeTime = new Date(todo.completed).getTime();
      return sum + (completeTime - createTime);
    }, 0);
    
    const avgHours = (totalTimeDiff / (completedTodos.length * 1000 * 60 * 60)).toFixed(1);
    return `${avgHours}h`;
  },

  // 分析每日待办趋势
  analyzeDailyTrend(todos) {
    const dailyMap = {};
    todos.forEach(todo => {
      const date = new Date(todo.time).toISOString().split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { create: 0, complete: 0 };
      }
      dailyMap[date].create++;
      if (todo.completed) {
        dailyMap[date].complete++;
      }
    });
    
    // 按日期排序
    const sortedDates = Object.keys(dailyMap).sort();
    const dates = [];
    const createData = [];
    const completeData = [];
    
    sortedDates.forEach(date => {
      dates.push(date);
      createData.push(dailyMap[date].create);
      completeData.push(dailyMap[date].complete);
    });
    
    return { dates, createData, completeData };
  },

  // 分析一天中的时间分布
  analyzeTimeOfDay(todos) {
    const hourMap = {};
    // 初始化24小时
    for (let i = 0; i < 24; i++) {
      hourMap[i] = 0;
    }
    
    todos.forEach(todo => {
      const hour = new Date(todo.time).getHours();
      hourMap[hour]++;
    });
    
    return Object.keys(hourMap).map(hour => ({
      hour: parseInt(hour),
      count: hourMap[hour]
    }));
  },

  // 初始化概览图表
  initOverviewChart(total, completed) {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          fontSize: 12
        }
      },
      color: ['#00B26A', '#E8F5E9'],
      series: [
        {
          name: '待办完成情况',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: completed, name: '已完成' },
            { value: total - completed, name: '未完成' }
          ]
        }
      ]
    };
    
    // 使用ec-canvas组件的方式初始化图表
    this.selectComponent('#overviewChart').init((canvas, width, height) => {
      // 使用echarts.init方法初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      
      chart.setOption(option);
      return chart;
    });
  },

  // 初始化趋势图表
  initTrendChart(todos) {
    const { dates, createData, completeData } = this.analyzeDailyTrend(todos);
    
    // 使用ec-canvas组件的方式初始化图表
    this.selectComponent('#trendChart').init((canvas, width, height) => {
      // 使用echarts.init方法初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['创建', '完成'],
          bottom: 0,
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLabel: {
            fontSize: 10,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '创建',
            type: 'line',
            data: createData,
            smooth: true,
            lineStyle: {
              color: '#26c6da'
            },
            // 避免使用LinearGradient，直接使用颜色字符串
            areaStyle: {
              color: 'rgba(38, 198, 218, 0.3)'
            }
          },
          {
            name: '完成',
            type: 'line',
            data: completeData,
            smooth: true,
            lineStyle: {
              color: '#00b26a'
            },
            areaStyle: {
              color: 'rgba(0, 178, 106, 0.3)'
            }
          }
        ]
      };
      
      chart.setOption(option);
      return chart;
    });
  },

  // 初始化时间分布图表
  initTimeChart(timeOfDayStats) {
    const hours = timeOfDayStats.map(item => item.hour + ':00');
    const counts = timeOfDayStats.map(item => item.count);
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: hours,
        axisLabel: {
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '待办数量',
          type: 'bar',
          data: counts,
          itemStyle: {
            // 避免使用LinearGradient，直接使用颜色字符串
            color: '#00B26A'
          }
        }
      ]
    };
    
    // 使用ec-canvas组件的方式初始化图表
    this.selectComponent('#timeChart').init((canvas, width, height) => {
      // 使用echarts.init方法初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      
      chart.setOption(option);
      return chart;
    });
  },

  // 分类统计
  calculateCategoryStats(todos) {
    const categoryMap = {};
    todos.forEach(todo => {
      const category = todo.category || '';
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, completed: 0 };
      }
      categoryMap[category].total++;
      if (todo.completed) categoryMap[category].completed++;
    });
    return Object.keys(categoryMap).map(category => ({
      category,
      ...categoryMap[category],
      percent: (categoryMap[category].completed / categoryMap[category].total * 100).toFixed(0) + '%'
    }));
  },

  // 最近更新时间
  getLastUpdatedTime(todos) {
    const lastDate = new Date();
    return `${lastDate.getMonth() + 1}月${lastDate.getDate()}日 ${lastDate.getHours()}:${lastDate.getMinutes().toString().padStart(2, '0')}`;
  },
  
  // 分析一天中的时间分布
  analyzeTimeOfDay(todos) {
    const hourMap = {};
    // 初始化24小时
    for (let i = 0; i < 24; i++) {
      hourMap[i] = 0;
    }
    
    todos.forEach(todo => {
      const hour = new Date(todo.time).getHours();
      hourMap[hour]++;
    });
    
    return Object.keys(hourMap).map(hour => ({
      hour: parseInt(hour),
      count: hourMap[hour]
    }));
  },

  // 分析位置数据
  analyzeLocations(todos) {
    const locations = todos
      .filter(t => t.location)
      .map(t => t.location.name)
      .filter(Boolean);
      
    return Object.entries(
      locations.reduce((acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count }));
  },

  // 分析地图标记
  analyzeMapMarkers(todos) {
    const locations = todos
      .filter(t => t.location?.latitude && t.location?.longitude)
      .map(t => t.location);
  
    // 计算几何中心
    let center = { latitude: 39.90403, longitude: 116.407526 }; // 默认北京
    if (locations.length > 0) {
      const sum = locations.reduce((acc, cur) => ({
        lat: acc.lat + cur.latitude,
        lng: acc.lng + cur.longitude
      }), { lat: 0, lng: 0 });
      
      center = {
        latitude: sum.lat / locations.length,
        longitude: sum.lng / locations.length
      };
    }
  
    // 生成标记点
    const markers = locations.map((loc, index) => ({
      id: index,
      latitude: loc.latitude,
      longitude: loc.longitude,
      title: loc.name,
      iconPath: '/images/marker.png',
      width: 30,
      height: 30
    }));
  
    return { 
      markers,
      points: locations,
      center 
    };
  },

  // 生成分享图片
  generateShareImage() {
    const that = this;
    wx.showLoading({ title: '生成中...' });
    
    // 新版 Canvas API
    wx.createSelectorQuery()
    .select('#shareCanvas')
    .fields({ node: true, size: true })
    .exec(async (res) => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getWindowInfo().pixelRatio;
      
      function drawRoundRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
      }
        
      canvas.width = 750 * dpr;
      canvas.height = 1200 * dpr;
      ctx.scale(dpr, dpr);

      // 绘制逻辑
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 750, 1200);
      
      // 添加渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 750, 0);
      gradient.addColorStop(0, '#f0faf5');
      gradient.addColorStop(1, '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 750, 200);

      // 标题样式优化
      ctx.font = 'bold 36px "PingFang SC"';
      ctx.fillStyle = '#2d3436';
      ctx.fillText('📊 待办统计报告', 50, 100);
      ctx.beginPath();
      ctx.moveTo(50, 120);
      ctx.lineTo(220, 120);
      ctx.strokeStyle = '#00B26A';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 核心指标面板美化
      ctx.beginPath();
      drawRoundRect(40, 140, 670, 120, 16);
      ctx.fillStyle = 'rgba(0,178,106,0.1)';
      ctx.fill();
      
      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#00B26A';
      ctx.fillText('✅ 总待办', 60, 180);
      ctx.fillText('🎯 已完成', 230, 180);
      ctx.fillText('📈 完成率', 400, 180);
      ctx.fillText('⏱️ 平均完成时间', 530, 180);
      
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#2d3436';
      ctx.fillText(this.data.total, 60, 220);
      ctx.fillText(this.data.completed, 230, 220); 
      ctx.fillText(`${this.data.progress}%`, 400, 220);
      ctx.fillText(this.data.avgCompletionTime, 530, 220);

      // 生成图片
      wx.canvasToTempFilePath({
        canvas,
        success: res => {
          wx.hideLoading();
          wx.shareFileMessage({
            filePath: res.tempFilePath,
            fileName: '待办统计报告.png'
          });
          // 弹出分享菜单
          wx.showShareImageMenu({
            path: res.tempFilePath,
            success: () => {
              wx.shareFileMessage({
                filePath: res.tempFilePath,
                fileName: '待办统计报告.png'
              });
            }
          });
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({ title: '生成失败', icon: 'none' });
        }
      });
    });
  },
});
