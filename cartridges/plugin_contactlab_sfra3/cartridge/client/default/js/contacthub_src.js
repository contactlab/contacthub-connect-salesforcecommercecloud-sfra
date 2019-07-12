
'use strict';

/**
 * Listners
 */
$(document).ready(function () {
  // Add Product to Cart
  if ($('#cl_hub').data('event-add')) {
    $('body').on('product:afterAddToCart', function (e, data) {
      console.log("Add to Cart: Data: ", data);
      // Search Added Item
      let item = data.cart.items.find(function (pli) {
        return pli.UUID == data.pliUUID;
      });
      // Build CH Product
      var itemCategories = collectCategoriesFromBreadcrumb();

      let chProduct = new CHEvent("addedProduct", item.id, item.productName, item.quantity, item.priceTotal.price, itemCategories);
      CHAjax.sendEvent(chProduct);
    });
  }

  // View Product Page
  if ($('#cl_hub').data('event-view')) {
    if ($('div.page').data('action') === 'Product-Show') {
      console.log("Product Page");
      let productPid = $('div.product-detail').data('pid')
      let productName = $('h1.product-name').first().text()
      let productPrice = $('div.price span span.sales span.value').text().trim()
      let categories = collectCategoriesFromBreadcrumb();

      let chProduct = new CHEvent("viewedProduct", productPid, productName, null, productPrice, categories);
      CHAjax.sendEvent(chProduct);
    }
  }
  // Remove Product from Cart
  if ($('#cl_hub').data('event-remove')) {
    $('body').on('click', '.cart-delete-confirmation-btn', function (e) {
      e.preventDefault();
      // TODO
      var productID = $(this).data('pid');
      var productName = $(this).data('name') || productID;

      let chProduct = new CHEvent("removedProduct", productID, productName);
      CHAjax.sendEvent(chProduct);
    });
  }

});



/**
 * CH Communcation
 */
function CHEvent(eventType, pId, pName, pQuantity, pPrice, pCategories) {
  let data = {};
  data.bringBackProperties = {
    "type": "SESSION_ID",
    "value": CHUtils.getCustomerID(),
    "nodeId": CHUtils.getNodeId()
  };
  data.context = 'ECOMMERCE';
  data.type=eventType;
  data.properties = {
    "id": pId,
    "sku": pId,
    "name": pName || undefined,
    "quantity": pQuantity || undefined,
    "price": pPrice ? parseFloat(pPrice.match(/[+-]?\d+(\.\d+)?/g)[0]) : undefined,
    "category": pCategories || undefined
  }
  return data;
};


function collectCategoriesFromBreadcrumb() {
	let a = [];
  let $breadcrumbs = $('li.breadcrumb-item a');
	$breadcrumbs.map(function(i,e) {
		a.push($(e).text().trim())
  });
  let uniq = a.filter(function(value, index, self) {
    return self.indexOf(value) === index;
  })
	return uniq;
};

/**
 * Configs
 */
const CHUtils = {
  getCustomerID: function () {
    return $('#cl_hub').data('customer');
  },
  getNodeId: function () {
    return $('#cl_hub').data('node');
  },
  getToken : function() {
    return $('#cl_hub').data('token');
  },
  getEventsUrl : function() {
    return $('#cl_hub').data('url') + '/events';
  },
  setAuth : function(request) {
    request.setRequestHeader('Authorization', 'Bearer ' + CHUtils.getToken());
  }
}

/**
 * Ajax
 */
const CHAjax = {
  sendEvent : function (eventData) {
    let eventType = eventData.type;
    console.log("Send Event: ", eventType, " Payload: ", eventData);
    let eventDataJson = JSON.stringify(eventData);
    $.ajax(CHAjax.buildEventAjax({
      method: 'POST',
      data: eventDataJson
    })).done(function (xhr) {
      console.log(eventType, ' done. Response: ', xhr.responseText);
    }).fail(function () {
      console.log(eventType, ' fail. Response: ', xhr.responseText);
    });
  },


  buildEventAjax : function(settings) {
    settings.url = CHUtils.getEventsUrl();
    return CHAjax.setAjaxSettings(settings);
  },

  setAjaxSettings: function (settings) {
    settings.contentType = 'application/json';
      settings.beforeSend = function (request) {
        CHUtils.setAuth(request);
      };
      return settings;
  }
}
