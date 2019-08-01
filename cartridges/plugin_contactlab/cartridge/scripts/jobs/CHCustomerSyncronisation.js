'use strict';

const Logger = dw.system.Logger.getLogger("plugin_contactlab", "SyncronizationJob");

/**
 * Utility for easy creation date for query
 * @param {int} offset
 * @param {int} hourToUse
 */
function createDate(offset, hourToUse) {
  result = new dw.util.Calendar(); // Get Now
  if (!empty(hourToUse)) {
    result.set(dw.util.Calendar.HOUR, hourToUse);
  } else {
    result.set(dw.util.Calendar.HOUR, 0);
  }
  result.set(dw.util.Calendar.MINUTE, 0);
  result.set(dw.util.Calendar.SECOND, 0);
  result.set(dw.util.Calendar.MILLISECOND, 0);
  result.add(dw.util.Calendar.DAY_OF_MONTH, offset);
  return result.time;
}

/**
 * @returns {number}
 */
function execute(args : PipelineDictionary) : Number {
      Logger.info("Start Job Customer Synctonization");
      let now = new Date();
      let fromDayslocal;
      let toDayslocal;
      let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let dryRun = false;
      if (args.dryRun) {
        dryRun = args.dryRun.toUpperCase() === 'TRUE';
      }

      if (empty(args.fromDays)) {
        fromDayslocal=new Date();
        fromDayslocal.setYear("1900");
        fromDayslocal.setMonth("01");
        fromDayslocal.setDate("01");
      }
      else{
        fromDayslocal=createDate(-args.fromDays);
      }

      if (empty(args.toDays)) {
        toDayslocal = today;
      }
      else{
        toDayslocal=createDate(-args.toDays);
      }
      const ContactHUBCustomer = require('*/cartridge/scripts/CHCustomers');
      let CustomerMgr : dw.customer.CustomerMgr = require('dw/customer/CustomerMgr');
      Logger.info("Job Customer Syncronization process from {0} to {1} (dryRun: {2})", fromDayslocal, toDayslocal, dryRun);

      let custProfiles = CustomerMgr.queryProfiles("creationDate > {0} AND creationDate < {1}", "creationDate desc", fromDayslocal, toDayslocal);
      Logger.info("Found {0} customers", custProfiles.count);
      while (custProfiles.hasNext()) {
        let currentProfile = custProfiles.next();

        if (! dryRun) {
          if (empty(currentProfile.custom.chId)) {
            Logger.info("  Send Customer No: {0} email {1} created {2}", currentProfile.getCustomerNo(), currentProfile.getEmail(), currentProfile.creationDate.toISOString());
            ContactHUBCustomer.sendCustomer(currentProfile.customer);
          } else {
            Logger.info("  Update Customer No: {0} email {1} created {2}", currentProfile.getCustomerNo(), currentProfile.getEmail(), currentProfile.creationDate.toISOString());
            ContactHUBCustomer.syncProfile(currentProfile);
          }

        } else {

          Logger.warn("Skip Customer No: {0} email {1} created {2} - {3}",
            currentProfile.getCustomerNo(),
            currentProfile.getEmail(),
            currentProfile.creationDate.toISOString(),
            empty(currentProfile.custom.chId)?'Send':'Sync');
        }
      }
      custProfiles.close();

      Logger.info("End Job Customer Syncronization");
      return PIPELET_NEXT;
  }

exports.execute = execute;