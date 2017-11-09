'use strict';

import util from '../../utils/index';
import config from '../../utils/config';

let app = getApp();
let isDev = config.isDev;

let handler = {
  formatArticleData (data) {
    let formatData = undefined;
    if (data && data.length) {
      formatData = data.map((group) => {
        group.formatData = this.dateConvert(group.date);
        if (group && group.articles) {
          let formatArticleItems = group.articles.map((item) => {
            item.hasVisited = this.isVisited(item.contentId);
            return item;
          }) || [];
          group.articles = formatArticleItems;
        }
        return group;
      })
    }
    return formatData;
  },

  dateConvert (dateStr) {
    if (!dateStr) {
      return '';
    }

    let today = new Date(),
    todayYear = today.getFullYear(),
    todayMonth = ('0' + (today.getMonth() + 1)).slice(-2),
        todayDay = ('0' + today.getDate()).slice(-2);
    let convertStr = '';
    let originYear = +dateStr.slice(0,4);
    let todayFormat = `${todayYear}-${todayMonth}-${todayDay}`;
    if (dateStr === todayFormat) {
        convertStr = '今日';
    } else if (originYear < todayYear) {
        let splitStr = dateStr.split('-');
        convertStr = `${splitStr[0]}年${splitStr[1]}月${splitStr[2]}日`;
    } else {
        convertStr = dateStr.slice(5).replace('-', '月') + '日'
    }
    return convertStr;
  },
  isVisited (contentId) {
    let visitedArticles = app.globalData && app.globalData.visitedArticles || '';
    return visitedArticles.indexOf(`${contentId}`) > -1;
  },

  renderArticle (data) {
    if (data && data.length) {
      let newList = this.data.articleList.concat(data);
      this.setData({
        articleList: newList
      })
    }
  },

  data: {
    page: 1,
    days: 3,
    pageSize: 4,
    totalSize: 0,
    hasMore: true,
    articleList: [],
    defaultImg: config.defaultImg
  },

  onLoad (options) {
    this.requestArticle();
  },

  requestArticle () {
    util.request({
      url: 'list',
      mock: true,
      data: {
        tag: '微信热门',
        start: this.data.page || 1,
        days: this.data.days || 3,
        pageSize: this.data.pageSize,
        langs: config.appLang || 'en'
      }
    })
    .then(res => {
      // console.log(res);
      if (res && res.status === 0 && res.data.length) {
        console.log(res);
        let articleData = res.data;
        let formatData = this.formatArticleData(articleData);
        this.renderArticle(formatData);
      } else if (this.data.page === 1 && res.data && res.data.length === 0) {
        util.alert();
        this.setData({
          hasMore: false
        })
      } else if (this.data.page !== 1 && res.data && res.data.length === 0) {
        this.setData({
          hasMore: false
        });
      } else {
        util.alert('提示', res);
        this.setData({
          hasMore: false
        });
        return null;
      }
    })
  }
}

Page(handler)