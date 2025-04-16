/**
 * 增强版表单验证工具函数
 */

// 验证手机号码
function isPhoneNumber(value) {
  if (!value) return false;
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(value);
}

// 验证邮箱
function isEmail(value) {
  if (!value) return false;
  const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  return reg.test(value);
}

// 验证身份证号码
function isIdCard(value) {
  if (!value) return false;
  
  // 15位和18位身份证号码的正则表达式
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if (!reg.test(value)) return false;
  
  // 如果是15位身份证
  if (value.length === 15) {
    return true;
  }
  
  // 如果是18位身份证，校验最后一位校验码
  if (value.length === 18) {
    // 加权因子
    const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    // 校验码对应值
    const parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    // 获取校验位
    let sum = 0;
    let ai = 0;
    let wi = 0;
    for (let i = 0; i < 17; i++) {
      ai = parseInt(value[i]);
      wi = factor[i];
      sum += ai * wi;
    }
    
    // 获取校验位
    const last = parity[sum % 11];
    // 最后一位是校验位
    return last.toUpperCase() === value[17].toUpperCase();
  }
  
  return false;
}

// 验证URL
function isUrl(value) {
  if (!value) return false;
  const reg = /^(https?:\/\/)([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+|(:[0-9]{1,5})?)((\/[-a-zA-Z0-9%_\.~#&=]*)?)(\?[a-zA-Z0-9%_\.~#&=]*)?(#[-a-zA-Z0-9%_\.~#&=]*)?$/;
  return reg.test(value);
}

// 验证IP地址(v4)
function isIpv4(value) {
  if (!value) return false;
  const reg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  return reg.test(value);
}

// 验证是否为正整数
function isPositiveInteger(value) {
  if (value === undefined || value === null || value === '') return false;
  return /^[1-9]\d*$/.test(value.toString());
}

// 验证是否为整数(包括负数)
function isInteger(value) {
  if (value === undefined || value === null || value === '') return false;
  return /^-?[0-9]\d*$/.test(value.toString());
}

// 验证是否为数字(包括小数)
function isNumber(value) {
  if (value === undefined || value === null || value === '') return false;
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// 验证是否为中文
function isChinese(value) {
  if (!value) return false;
  const reg = /^[\u4E00-\u9FA5]+$/;
  return reg.test(value);
}

// 验证是否为英文字母
function isLetter(value) {
  if (!value) return false;
  const reg = /^[a-zA-Z]+$/;
  return reg.test(value);
}

// 验证是否为英文和数字组合
function isAlphaNumeric(value) {
  if (!value) return false;
  const reg = /^[0-9a-zA-Z]+$/;
  return reg.test(value);
}

// 验证密码强度
function isStrongPassword(value) {
  if (!value) return false;
  // 长度8-20位
  if (value.length < 8 || value.length > 20) return false;
  
  // 计算包含的字符类型数量
  let typeCount = 0;
  // 大写字母
  if (/[A-Z]/.test(value)) typeCount++;
  // 小写字母
  if (/[a-z]/.test(value)) typeCount++;
  // 数字
  if (/[0-9]/.test(value)) typeCount++;
  // 特殊字符
  if (/[~!@#$%^&*()_+\`\-={}[\]:";'<>?,.\\/\\|]/.test(value)) typeCount++;
  
  // 至少包含三种字符类型
  return typeCount >= 3;
}

// 验证字符串最小长度
function minLength(value, min) {
  if (!value) return false;
  return String(value).length >= min;
}

// 验证字符串最大长度
function maxLength(value, max) {
  if (!value) return true; // 空值不做最大长度限制
  return String(value).length <= max;
}

// 验证字符串长度范围
function lengthBetween(value, min, max) {
  if (!value) return false;
  const len = String(value).length;
  return len >= min && len <= max;
}

// 验证两个值是否相等
function isEqual(value1, value2) {
  return value1 === value2;
}

// 验证值是否在指定范围内
function isBetween(value, min, max) {
  if (value === undefined || value === null || value === '') return false;
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
}

// 统一表单验证函数
function validateForm(rules, values) {
  const errors = {};
  let isValid = true;
  
  for (const field in rules) {
    if (Object.prototype.hasOwnProperty.call(rules, field)) {
      const fieldRules = rules[field];
      const value = values[field];
      
      // 处理每条验证规则
      for (const rule of fieldRules) {
        let isRuleValid = true;
        
        // 根据规则类型进行验证
        switch (rule.type) {
          case 'required':
            isRuleValid = value !== undefined && value !== null && value !== '';
            break;
          case 'phone':
            isRuleValid = isPhoneNumber(value);
            break;
          case 'email':
            isRuleValid = isEmail(value);
            break;
          case 'idCard':
            isRuleValid = isIdCard(value);
            break;
          case 'url':
            isRuleValid = isUrl(value);
            break;
          case 'number':
            isRuleValid = isNumber(value);
            break;
          case 'integer':
            isRuleValid = isInteger(value);
            break;
          case 'positiveInteger':
            isRuleValid = isPositiveInteger(value);
            break;
          case 'minLength':
            isRuleValid = minLength(value, rule.min);
            break;
          case 'maxLength':
            isRuleValid = maxLength(value, rule.max);
            break;
          case 'lengthBetween':
            isRuleValid = lengthBetween(value, rule.min, rule.max);
            break;
          case 'min':
            isRuleValid = value !== undefined && value !== null && value !== '' 
              ? parseFloat(value) >= rule.min 
              : true;
            break;
          case 'max':
            isRuleValid = value !== undefined && value !== null && value !== '' 
              ? parseFloat(value) <= rule.max 
              : true;
            break;
          case 'between':
            isRuleValid = isBetween(value, rule.min, rule.max);
            break;
          case 'pattern':
            isRuleValid = rule.pattern.test(value);
            break;
          case 'custom':
            isRuleValid = typeof rule.validator === 'function' 
              ? rule.validator(value, values) 
              : true;
            break;
          default:
            isRuleValid = true;
        }
        
        // 如果验证失败，添加错误信息
        if (!isRuleValid) {
          if (!errors[field]) {
            errors[field] = rule.message || `${field}验证失败`;
          }
          isValid = false;
          
          // 如果设置了立即返回，不继续验证该字段的其他规则
          if (rule.immediate) {
            break;
          }
        }
      }
    }
  }
  
  return {
    isValid,
    errors
  };
}

// 导出所有验证函数
module.exports = {
  isPhoneNumber,
  isEmail,
  isIdCard,
  isUrl,
  isIpv4,
  isPositiveInteger,
  isInteger,
  isNumber,
  isChinese,
  isLetter,
  isAlphaNumeric,
  isStrongPassword,
  minLength,
  maxLength,
  lengthBetween,
  isEqual,
  isBetween,
  validateForm
};