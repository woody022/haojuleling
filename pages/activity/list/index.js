// pages/activity/list/index.js
import { isEmpty } from '../../../src/utils/common';

Page({
  data: {
    // 页面状态
    isLoading: true,
    hasError: false,
    isRefreshing: false,
    loadingMore: false,
    hasMore: true,
    
    // 筛选相关
    searchValue: '',
    activeTab: 'all', // all, ongoing, upcoming, ended
    showClearIcon: false,
    tabs: [
      { id: 'all', name: '全部' },
      { id: 'ongoing', name: '进行中' },
      { id: 'upcoming', name: '即将开始' },
      { id: 'ended', name: '已结束' }
    ],
    
    // 高级筛选
    selectedCategory: '全部',
    startDate: '',
    endDate: '',
    sortOption: '最新发布',
    
    // 弹窗显示状态
    showCategoryPopup: false,
    showDatePopup: false,
    showSortPopup: false,
    
    // 弹窗选项
    categories: ['全部', '运动', '游戏', '音乐', '旅行', '美食', '学习', '其他'],
    dateRanges: ['全部时间', '今天', '明天', '本周', '本月', '自定义'],
    selectedDateRange: '全部时间',
    sortOptions: ['最新发布', '即将开始', '人气最高', '距离最近'],
    
    // 活动数据
    activityList: [],
    totalCount: 0,
    pageNum: 1,
    pageSize: 10
  },

  onLoad(options) {
    // 从分享链接或其他页面跳转时，可能带有查询参数
    if (options.category) {
      this.setData({
        selectedCategory: options.category
      });
    }
    
    // 加载活动列表
    this.loadActivityList();
  },
  
  onShow() {
    // 从其他页面返回时，可能需要刷新列表
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage.data.needRefresh) {
      this.refreshActivityList();
      currentPage.setData({
        needRefresh: false
      });
    }
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.refreshActivityList();
  },
  
  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMoreActivities();
    }
  },
  
  // 加载活动列表
  loadActivityList() {
    this.setData({
      isLoading: true,
      hasError: false
    });
    
    const params = this.buildRequestParams();
    
    // 模拟网络请求
    setTimeout(() => {
      // 这里应该替换为实际的API调用
      const mockData = this.getMockData();
      
      this.setData({
        activityList: mockData.list,
        totalCount: mockData.total,
        isLoading: false,
        hasMore: mockData.list.length < mockData.total
      });
    }, 1000);
  },
  
  // 刷新活动列表
  refreshActivityList() {
    this.setData({
      isRefreshing: true,
      pageNum: 1
    });
    
    const params = this.buildRequestParams();
    
    // 模拟网络请求
    setTimeout(() => {
      // 这里应该替换为实际的API调用
      const mockData = this.getMockData();
      
      this.setData({
        activityList: mockData.list,
        totalCount: mockData.total,
        isRefreshing: false,
        hasMore: mockData.list.length < mockData.total
      });
      
      wx.stopPullDownRefresh();
    }, 1000);
  },
  
  // 加载更多活动
  loadMoreActivities() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    
    this.setData({
      loadingMore: true,
      pageNum: this.data.pageNum + 1
    });
    
    const params = this.buildRequestParams();
    
    // 模拟网络请求
    setTimeout(() => {
      // 这里应该替换为实际的API调用
      const mockMoreData = this.getMockMoreData();
      
      if (mockMoreData.list.length > 0) {
        this.setData({
          activityList: [...this.data.activityList, ...mockMoreData.list],
          loadingMore: false,
          hasMore: this.data.activityList.length + mockMoreData.list.length < mockMoreData.total
        });
      } else {
        this.setData({
          loadingMore: false,
          hasMore: false
        });
      }
    }, 1000);
  },
  
  // 构建请求参数
  buildRequestParams() {
    return {
      keyword: this.data.searchValue,
      status: this.data.activeTab,
      category: this.data.selectedCategory === '全部' ? '' : this.data.selectedCategory,
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      sort: this.data.sortOption,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };
  },
  
  // 搜索框输入
  onSearchInput(e) {
    const value = e.detail.value;
    this.setData({
      searchValue: value,
      showClearIcon: !isEmpty(value)
    });
  },
  
  // 清空搜索框
  clearSearchValue() {
    this.setData({
      searchValue: '',
      showClearIcon: false
    });
    
    // 如果之前有搜索内容，清空后重新加载
    if (this.data.searchValue) {
      this.refreshActivityList();
    }
  },
  
  // 确认搜索
  confirmSearch() {
    this.refreshActivityList();
  },
  
  // 切换标签
  switchTab(e) {
    const tabId = e.currentTarget.dataset.id;
    if (tabId !== this.data.activeTab) {
      this.setData({
        activeTab: tabId
      });
      this.refreshActivityList();
    }
  },
  
  // 点击创建活动按钮
  createActivity() {
    wx.navigateTo({
      url: '/pages/activity/create/index'
    });
  },
  
  // 点击活动项
  onActivityTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/activity/detail/index?id=' + id
    });
  },
  
  // 打开分类筛选弹窗
  openCategoryPopup() {
    this.setData({
      showCategoryPopup: true
    });
  },
  
  // 关闭分类筛选弹窗
  closeCategoryPopup() {
    this.setData({
      showCategoryPopup: false
    });
  },
  
  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.value;
    this.setData({
      showCategoryPopup: false,
      selectedCategory: category
    });
    this.refreshActivityList();
  },
  
  // 打开日期范围弹窗
  openDatePopup() {
    this.setData({
      showDatePopup: true
    });
  },
  
  // 关闭日期范围弹窗
  closeDatePopup() {
    this.setData({
      showDatePopup: false
    });
  },
  
  // 选择日期范围
  selectDateRange(e) {
    const range = e.currentTarget.dataset.value;
    this.setData({
      selectedDateRange: range
    });
    
    if (range !== '自定义') {
      const dates = this.calculateDateRange(range);
      this.setData({
        startDate: dates.startDate,
        endDate: dates.endDate
      });
    }
  },
  
  // 根据日期范围计算具体日期
  calculateDateRange(range) {
    const now = new Date();
    let startDate = '';
    let endDate = '';
    
    switch (range) {
      case '今天':
        startDate = this.formatDate(now);
        endDate = this.formatDate(now);
        break;
      case '明天':
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        startDate = this.formatDate(tomorrow);
        endDate = this.formatDate(tomorrow);
        break;
      case '本周':
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay() || 7;
        startOfWeek.setDate(now.getDate() - day + 1);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        startDate = this.formatDate(startOfWeek);
        endDate = this.formatDate(endOfWeek);
        break;
      case '本月':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        startDate = this.formatDate(startOfMonth);
        endDate = this.formatDate(endOfMonth);
        break;
      default:
        // 全部时间，不设置日期范围
        startDate = '';
        endDate = '';
    }
    
    return { startDate, endDate };
  },
  
  // 日期格式化为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 选择开始日期
  bindStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    });
  },
  
  // 选择结束日期
  bindEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    });
  },
  
  // 重置日期筛选
  resetDateFilter() {
    this.setData({
      selectedDateRange: '全部时间',
      startDate: '',
      endDate: ''
    });
  },
  
  // 确认日期筛选
  confirmDateFilter() {
    this.setData({
      showDatePopup: false
    });
    this.refreshActivityList();
  },
  
  // 打开排序弹窗
  openSortPopup() {
    this.setData({
      showSortPopup: true
    });
  },
  
  // 关闭排序弹窗
  closeSortPopup() {
    this.setData({
      showSortPopup: false
    });
  },
  
  // 选择排序方式
  selectSortOption(e) {
    const option = e.currentTarget.dataset.value;
    this.setData({
      sortOption: option,
      showSortPopup: false
    });
    this.refreshActivityList();
  },
  
  // 获取模拟数据
  getMockData() {
    const list = [];
    const total = 25;
    
    for (let i = 0; i < 10; i++) {
      list.push({
        id: `activity_${i}`,
        title: `活动示例${i + 1}`,
        category: this.getRandomCategory(),
        status: this.getRandomStatus(),
        startTime: this.getRandomTime(true),
        endTime: this.getRandomTime(false),
        location: '北京市海淀区某地点',
        participantsCount: Math.floor(Math.random() * 50) + 5,
        maxParticipants: 50,
        coverImage: 'https://picsum.photos/300/200?random=' + i
      });
    }
    
    return { list, total };
  },
  
  // 获取更多模拟数据
  getMockMoreData() {
    const list = [];
    const total = 25;
    const baseIndex = this.data.pageNum * 10 - 10;
    
    for (let i = 0; i < 10; i++) {
      if (baseIndex + i < total) {
        list.push({
          id: `activity_${baseIndex + i}`,
          title: `活动示例${baseIndex + i + 1}`,
          category: this.getRandomCategory(),
          status: this.getRandomStatus(),
          startTime: this.getRandomTime(true),
          endTime: this.getRandomTime(false),
          location: '北京市海淀区某地点',
          participantsCount: Math.floor(Math.random() * 50) + 5,
          maxParticipants: 50,
          coverImage: 'https://picsum.photos/300/200?random=' + (baseIndex + i)
        });
      }
    }
    
    return { list, total };
  },
  
  // 获取随机分类
  getRandomCategory() {
    const categories = ['运动', '游戏', '音乐', '旅行', '美食', '学习', '其他'];
    const index = Math.floor(Math.random() * categories.length);
    return categories[index];
  },
  
  // 获取随机状态
  getRandomStatus() {
    const statuses = ['ongoing', 'upcoming', 'ended'];
    const index = Math.floor(Math.random() * statuses.length);
    return statuses[index];
  },
  
  // 获取随机时间
  getRandomTime(isStart) {
    const now = new Date();
    const offset = Math.floor(Math.random() * 14) - 7; // -7 to 7 days
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    
    if (!isStart) {
      // 结束时间比开始时间晚1-3天
      date.setDate(date.getDate() + Math.floor(Math.random() * 3) + 1);
    }
    
    return this.formatDate(date);
  },
  
  // 用户分享
  onShareAppMessage() {
    return {
      title: '活动列表 - 来参加有趣的活动吧',
      path: '/pages/activity/list/index'
    };
  }
});