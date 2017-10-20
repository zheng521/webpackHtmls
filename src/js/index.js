/* 引入vue和主页 */
import Vue from 'vue';
import Index from '../view/index.vue';


/* 配置index实例化vue */
new Vue({
    el: '#index',
    render: function(h) {
        return h(Index)
    }
})
