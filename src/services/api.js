import { jsonp } from '@ifeng/ui_base';
import md5 from 'md5';

// apiUrl为webpack注入的全局变量
/* eslint-disable no-undef */
let apiBaseUrl = apiUrl;
/* eslint-enable no-undef */

if (typeof window !== 'undefined' && /\.shank\.ifeng\.com/.test(window.location.hostname)) {
    apiBaseUrl = '/api';
}

// jsonp 接口请求示例 ---- start (开发时请删除示例代码)
// jsonp 接口请求示例 ---- start (开发时请删除示例代码)
// jsonp 接口请求示例 ---- start (开发时请删除示例代码)
const getWeatherData = async city => {
    return await jsonp(`https://api.iclient.ifeng.com/newH5Weather?key=weather&value=${city}`);
};

const createJsonpCallbackName = (str, num) => {
    num = num ? num : 0;
    let jsonpCallbackName = `_${md5(`${str}_${num}`)}`;

    /* eslint-disable */
    while (typeof window === 'object' && window[jsonpCallbackName]) {
        /* eslint-enable */
        num++;
        jsonpCallbackName = `_${md5(`${str}_${num}`)}`;
    }

    return jsonpCallbackName;
};

const getMyStockData = async num => {
    return await jsonp('//apiapp.finance.ifeng.com/mystock/get', {
        data: { num },
        jsonpCallback: createJsonpCallbackName('getMyStockData'),
        cache: false,
    });
};

// jsonp 接口请求示例 ---- end  (开发时请删除示例代码)
// jsonp 接口请求示例 ---- end  (开发时请删除示例代码)
// jsonp 接口请求示例 ---- end  (开发时请删除示例代码)

export {
    getMyStockData,
    getWeatherData,
};
