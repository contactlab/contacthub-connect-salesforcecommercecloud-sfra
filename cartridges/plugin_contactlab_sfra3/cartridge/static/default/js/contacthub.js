!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";function o(e,t,n,o,r,i){let a={};return a.bringBackProperties={type:"SESSION_ID",value:u.getCustomerID(),nodeId:u.getNodeId()},a.context="ECOMMERCE",a.type=e,a.properties={id:t,sku:t,name:n||void 0,quantity:o||void 0,price:r?parseFloat(r.match(/[+-]?\d+(\.\d+)?/g)[0]):void 0,category:i||void 0},a}function r(){let e=[];return $("li.breadcrumb-item a").map(function(t,n){e.push($(n).text().trim())}),e.filter(function(e,t,n){return n.indexOf(e)===t})}$(document).ready(function(){if($("#cl_hub").data("event-add")&&$("body").on("product:afterAddToCart",function(e,t){console.log("Add to Cart: Data: ",t);let n=t.cart.items.find(function(e){return e.UUID==t.pliUUID});var u=r();let a=new o("addedProduct",n.id,n.productName,n.quantity,n.priceTotal.price,u);i.sendEvent(a)}),$("#cl_hub").data("event-view")&&"Product-Show"===$("div.page").data("action")){console.log("Product Page");let e=new o("viewedProduct",$("div.product-detail").data("pid"),$("h1.product-name").first().text(),null,$("div.price span span.sales span.value").text().trim(),r());i.sendEvent(e)}$("#cl_hub").data("event-remove")&&$("body").on("click",".cart-delete-confirmation-btn",function(e){e.preventDefault();var t=$(this).data("pid");let n=new o("removedProduct",t,$(this).data("name")||t);i.sendEvent(n)})});const u={getCustomerID:function(){return $("#cl_hub").data("customer")},getNodeId:function(){return $("#cl_hub").data("node")},getToken:function(){return $("#cl_hub").data("token")},getEventsUrl:function(){return $("#cl_hub").data("url")+"/events"},setAuth:function(e){e.setRequestHeader("Authorization","Bearer "+u.getToken())}},i={sendEvent:function(e){let t=e.type;console.log("Send Event: ",t," Payload: ",e);let n=JSON.stringify(e);$.ajax(i.buildEventAjax({method:"POST",data:n})).done(function(e){console.log(t," done. Response: ",e.responseText)}).fail(function(){console.log(t," fail. Response: ",xhr.responseText)})},buildEventAjax:function(e){return e.url=u.getEventsUrl(),i.setAjaxSettings(e)},setAjaxSettings:function(e){return e.contentType="application/json",e.beforeSend=function(e){u.setAuth(e)},e}}}]);