importClass(dw.svc.Result);


let chConfigs = require('~/cartridge/scripts/utils/CHConfigs');
let CHServicesHelper = require('~/cartridge/scripts/CHServicesHelper');
let paymentMethods : dw.util.Map = new dw.util.HashMap();
const Logger = dw.system.Logger.getLogger("plugin_contactlab", "events")
paymentMethods.put('bml', 'cash');
paymentMethods.put('creditcard', 'creditcard');
//paymentMethods.put('creditcard', 'debitcard');
paymentMethods.put('paypal', 'paypal');


function getPaymentMethod(method : String) {
	let pMethod : String = paymentMethods.get(method.toLowerCase().replace('_', ''));
	if (pMethod == null) {
		pMethod = 'other';
	}
	return pMethod;
}


function sendCompletedOrder(customerId: String, order: dw.order.Order): Result {
    let products: Array = createProductsFromOrder(order);
    let paymentInstrument: dw.order.PaymentInstrument = order.getPaymentInstruments()[0];

    let postEvent = {
        bringBackProperties: {
        	nodeId: chConfigs.getNodeId(),
        	type: 'SESSION_ID',
        	value: session.sessionID
        },
        type: 'completedOrder',

        context: 'ECOMMERCE',
        contextInfo: getContextInfoForEcommerce(order),
        properties: {
            orderId: order.getOrderNo(),
            type: 'sale',
            paymentMethod: getPaymentMethod(paymentInstrument.getPaymentMethod()),
            storeCode: dw.system.Site.getCurrent().getID(),
            amount: {
            	local: {
            		currency: order.getCurrencyCode()
            	},
            	shipping: order.getShippingTotalPrice().getValue(),
              total: order.getTotalGrossPrice().getValue(),
              tax: order.getTotalTax().value
            },
            products: products
        }
    };
    Logger.info("Post Event: {0}", JSON.stringify(postEvent));
    return CHServicesHelper.postEvent(postEvent);
}

function createProductsFromOrder(order: dw.order.Order): Array {
    let products: Array = [];
    let productLineItems = order.getAllProductLineItems();
    let iterator: dw.util.Iterator = productLineItems.iterator();
    while (iterator.hasNext()) {
        let productLineItem: dw.order.ProductLineItem = iterator.next();
        let product = {
            "id": productLineItem.getProductID(),
            "sku": productLineItem.getProductID(),
            "name": productLineItem.getProductName(),
            "quantity": productLineItem.getQuantityValue(),
            "price": productLineItem.getBasePrice().value,
            "subtotal": productLineItem.getPriceValue()
        };
        // if (productLineItem.getManufacturerSKU() != null) {
        // 	product.sku = productLineItem.getManufacturerSKU();
        // }


        // if (productLineItem.getCategory() != null && productLineItem.getCategory().getDisplayName() != null) {
        if (productLineItem.getProduct() !== null && !empty(productLineItem.getProduct().categories)) {
          let categoryList = [];
          productLineItem.getProduct().categories.toArray().forEach(function (currentCategory) {
            let subCategory = currentCategory;
            while (subCategory.parent) {
              categoryList.push(subCategory.displayName);
              subCategory = subCategory.parent;
            }
          })
          product.category = categoryList.reverse();
          // TODO: Loop on Category Path
          // product.category = [productLineItem.getCategory().getDisplayName()];
        }


        if (productLineItem.getProduct() !== null && productLineItem.getProduct().getImage('medium') != null
            && productLineItem.getProduct().getImage('medium').getAbsURL() != null) {
        	product.imageUrl = productLineItem.getProduct().getImage('medium').getAbsURL().toString();
        }
        let linkUrl = dw.web.URLUtils.https('Product-Show', 'pid=' + productLineItem.getProductID());
        if (linkUrl != null && linkUrl.toString()) {
        	product.linkUrl = linkUrl.toString();
        }
        products.push(product);
    }
    return products;
}

function getContextInfoForEcommerce(order: dw.order.Order) : Object {
	let currentSite : dw.system.Site = dw.system.Site.getCurrent();
    return {
        store: {
        	id: currentSite.getID(),
        	name: currentSite.getName(),
        	type: 'ECOMMERCE',
        	country: order.getCustomerLocaleID(),
        	website: currentSite.getHttpsHostName()
        }
    }
}


exports.sendCompletedOrder = sendCompletedOrder;
