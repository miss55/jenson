---
    layout: null
---

/**
 * 页面ready方法
 */
$(document).ready(function() {

    console.log("你不乖哦，彼此之间留点神秘感不好吗？");

    backToTop();
    // search();
});

/**
 * 回到顶部
 */
function backToTop() {
    $("[data-toggle='tooltip']").tooltip();
    var st = $(".page-scrollTop");
    var $window = $(window);
    var isShow = false
    //滚页面才显示返回顶部
    $window.scroll((function() {
        var timeId = null;
        return function() {
            clearTimeout(timeId);
            timeId = setTimeout(function() {
                var currnetTopOffset = $window.scrollTop();
                if (currnetTopOffset > 200 && !isShow) {
                    isShow = true;
                    st.fadeIn(500);
                    return ;
                }
                if (isShow) {
                    isShow = false;
                    st.fadeOut(500);
                    return ;
                }
            }, 20);
        }
    })());

    //点击回到顶部
    st.click(function() {
        isShow = false;
        $window.scrollTop(0)
    });

}

function search(){
    (function(w,d,t,u,n,s,e){w['SwiftypeObject']=n;w[n]=w[n]||function(){
        (w[n].q=w[n].q||[]).push(arguments);};s=d.createElement(t);
        e=d.getElementsByTagName(t)[0];s.async=1;s.src=u;e.parentNode.appendChild(s);
    })(window,document,'script','//s.swiftypecdn.com/install/v2/st.js','_st');

    _st('install','{{site.swiftype.searchId}}','2.0.0');
}





