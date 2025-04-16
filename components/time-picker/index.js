// components/time-picker/index.js
Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer(newVal) {
        this.setData({ isVisible: newVal });
      }
    },
    title: {
      type: String,
      value: '选择时间'
    },
    // 最小可选日期，格式为 YYYY-MM-DD
    minDate: {
      type: String,
      value: ''
    },
    // 最大可选日期，格式为 YYYY-MM-DD
    maxDate: {
      type: String,
      value: ''
    },
    // 默认选中的日期，格式为 YYYY-MM-DD
    defaultDate: {
      type: String,
      value: ''
    },
    // 默认选中的时间，格式为 HH:mm
    defaultTime: {
      type: String,
      value: ''
    },
    // 是否显示日期选择
    showDate: {
      type: Boolean,
      value: true
    },
    // 是否显示时间选择
    showTime: {
      type: Boolean,
      value: true
    }
  },
  
  data: {
    isVisible: false,
    selectedDate: '',
    selectedTime: '',
    datePickerVisible: false,
    timePickerVisible: false,
    today: '',
    minDateObj: null,
    maxDateObj: null
  },
  
  lifetimes: {
    attached() {
      // 初始化日期
      const today = this.formatDate(new Date());
      let selectedDate = this.properties.defaultDate || today;
      let selectedTime = this.properties.defaultTime || this.formatTime(new Date());
      
      // 处理最小和最大日期限制
      let minDateObj = null;
      let maxDateObj = null;
      
      if (this.properties.minDate) {
        minDateObj = new Date(this.properties.minDate);
      }
      
      if (this.properties.maxDate) {
        maxDateObj = new Date(this.properties.maxDate);
      }
      
      this.setData({
        today,
        selectedDate,
        selectedTime,
        minDateObj,
        maxDateObj
      });
    }
  },
  
  methods: {
    // 显示日期选择器
    showDatePicker() {
      this.setData({
        datePickerVisible: true
      });
    },
    
    // 显示时间选择器
    showTimePicker() {
      this.setData({
        timePickerVisible: true
      });
    },
    
    // 处理日期选择
    onDateChange(e) {
      const date = e.detail.value;
      this.setData({
        selectedDate: date
      });
    },
    
    // 处理时间选择
    onTimeChange(e) {
      const time = e.detail.value;
      this.setData({
        selectedTime: time
      });
    },
    
    // 关闭弹窗
    close() {
      this.setData({
        isVisible: false
      });
      this.triggerEvent('close');
    },
    
    // 点击蒙层关闭
    onMaskClick() {
      this.close();
    },
    
    // 点击取消按钮
    onCancel() {
      this.close();
      this.triggerEvent('cancel');
    },
    
    // 点击确认按钮
    onConfirm() {
      const { selectedDate, selectedTime } = this.data;
      
      // 验证所选日期是否在允许范围内
      if (this.properties.minDate || this.properties.maxDate) {
        const selectedDateObj = new Date(selectedDate);
        
        if (this.data.minDateObj && selectedDateObj < this.data.minDateObj) {
          wx.showToast({
            title: \`日期不能早于 \${this.properties.minDate}\`,
            icon: 'none'
          });
          return;
        }
        
        if (this.data.maxDateObj && selectedDateObj > this.data.maxDateObj) {
          wx.showToast({
            title: \`日期不能晚于 \${this.properties.maxDate}\`,
            icon: 'none'
          });
          return;
        }
      }
      
      const result = {
        date: selectedDate,
        time: selectedTime,
        dateTime: selectedDate + ' ' + selectedTime
      };
      
      this.triggerEvent('confirm', result);
      this.close();
    },
    
    // 防止内容区域的点击事件冒泡
    onContentClick() {
      return false;
    },
    
    // 格式化日期为 YYYY-MM-DD
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return \`\${year}-\${month}-\${day}\`;
    },
    
    // 格式化时间为 HH:mm
    formatTime(date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return \`\${hours}:\${minutes}\`;
    }
  }
});