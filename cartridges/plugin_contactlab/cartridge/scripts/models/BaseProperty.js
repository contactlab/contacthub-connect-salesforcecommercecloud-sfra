'use strict';

var BaseProperty = function(email, firstName, lastName) {
    var _this = this;
    _this['contacts'] = _this['contacts'] || {};
    _this['contacts'].email = email;
    _this['firstName'] = firstName;
    _this['lastName'] = lastName;
};

BaseProperty.prototype.fillFromProfile = function(cProfile: dw.customer.Profile) {
  if (cProfile.phoneHome != null) {
    this['contacts'].mobilePhone = cProfile.phoneHome
  }
  if (cProfile.gender != null) {
    //this['gender'] = cProfile.gender.getDisplayValue();
    // Use null instead of '0' for Undefined
    this['gender'] = cProfile.gender.getDisplayValue() == '0' ? null : cProfile.gender.getDisplayValue();

  }
  if (cProfile.birthday != null) {
      this['dob'] = dw.util.StringUtils.formatCalendar(new dw.util.Calendar(cProfile.birthday), 'YYYY-MM-dd')
  }
  var addressBook : dw.customer.AddressBook = cProfile.getAddressBook();
  if (addressBook.getPreferredAddress() != null) {
    var address : dw.customer.CustomerAddress = addressBook.getPreferredAddress();
      this['address'] = {
        street: address.getAddress1() + (empty(address.getAddress2()) ? '' : ' ' + address.getAddress2()),
        city: address.getCity(),
        country: address.getCountryCode().displayValue,
        province: address.getStateCode(),
        zip: address.getPostalCode()
      }
  }
}


BaseProperty.prototype['firstName'] = undefined;

BaseProperty.prototype['lastName'] = undefined;

BaseProperty.prototype['gender'] = undefined;

BaseProperty.prototype['contacts'] = undefined;

BaseProperty.prototype['address'] = undefined;

BaseProperty.prototype['credential'] = undefined;

BaseProperty.prototype['educations'] = undefined;

BaseProperty.prototype['likes'] = undefined;

BaseProperty.prototype['socialProfile'] = undefined;

BaseProperty.prototype['jobs'] = undefined;

BaseProperty.prototype['subscriptions'] = undefined;

BaseProperty.prototype['dob'] = undefined;


module.exports = BaseProperty;