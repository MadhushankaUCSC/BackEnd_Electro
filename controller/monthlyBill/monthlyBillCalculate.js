var commonResponseService = require("../../service/responseService");
var addDeviceModel = require("../../model/monthlyBill/addDevicesModel");
var unitChargesModel = require("../../model/cebengineer/unitChargesModel");
var suggestionAlgorithm = require("../monthlyBill/suggestionAlgorithm");
var suggestionModel = require("../../model/monthlyBill/suggestionModel");

/**
 * Calculate the number of units controller
 * @param {*} power
 * @param {*} minutes
 * @param {*} quantity
 * @returns
 */
function CalculateUnits(power, minutes, quantity) {
  var numOfUnits = (quantity * power * minutes * 60 * 30) / 3600000;
  return numOfUnits;
}

/**
 * Calculate Total number of minutes for a device controller
 * @param {*} hors
 * @param {*} minutes
 * @returns
 */
function CalculateNumberOfMinutes(hors, minutes) {
  var numOfMinutes = parseInt(hors * 60) + parseInt(minutes);
  return numOfMinutes;
}

/**
 * Calculate the cost device wise controller
 * @param {*} uPrice
 * @param {*} Units
 * @returns
 */
function CalculateCost(uPrice, Units) {
  var cost = uPrice * Units;
  return cost;
}

/**
 * Add device data to the main bill plan
 * @param {*} request
 * @param {*} response
 */
async function AddDeviceDataMain(request, response) {
  try {
    var Device_details = request.body.data;
    // console.log(Device_details);
    // console.log(request.params.id);

    var UnitPrice = await unitChargesModel.getUnitChargesDataFun("tou");
    // console.log(UnitPrice.data[0].Unit_charge);
    // console.log(UnitPrice.data[1].Unit_charge);
    // console.log(UnitPrice.data[2].Unit_charge);

    var DayUnitCost = UnitPrice.data[0].Unit_charge;
    var OffPeakUnitCost = UnitPrice.data[1].Unit_charge;
    var PeakUnitCost = UnitPrice.data[2].Unit_charge;

    Device_details.using_minutes_peak_time = await CalculateNumberOfMinutes(
      Device_details.hPeak,
      Device_details.mPeak
    );
    Device_details.using_minutes_off_peak_time = await CalculateNumberOfMinutes(
      Device_details.hOffPeak,
      Device_details.mOffPeak
    );
    Device_details.using_minutes_day_time = await CalculateNumberOfMinutes(
      Device_details.hDay,
      Device_details.mDay
    );
    Device_details.units_peak_time = await CalculateUnits(
      Device_details.power,
      Device_details.using_minutes_peak_time,
      Device_details.quantity
    );
    Device_details.units_off_peak_time = await CalculateUnits(
      Device_details.power,
      Device_details.using_minutes_off_peak_time,
      Device_details.quantity
    );
    Device_details.units_day_time = await CalculateUnits(
      Device_details.power,
      Device_details.using_minutes_day_time,
      Device_details.quantity
    );
    Device_details.cost_peak_time = await CalculateCost(
      PeakUnitCost,
      Device_details.units_peak_time
    );
    Device_details.cost_off_peak_time = await CalculateCost(
      OffPeakUnitCost,
      Device_details.units_off_peak_time
    );
    Device_details.cost_day_time = await CalculateCost(
      DayUnitCost,
      Device_details.units_day_time
    );
    Device_details.total_units =
      Device_details.units_peak_time +
      Device_details.units_off_peak_time +
      Device_details.units_day_time;
    Device_details.total_cost_TOU =
      Device_details.cost_peak_time +
      Device_details.cost_off_peak_time +
      Device_details.cost_day_time;

    // console.log(request.params.id);
    var DeviceData = await addDeviceModel.AddDeviceMailBill(
      Device_details,
      request.params.id
    );
    // console.log(profileData.data);
    suggestionAlgorithm.makeSuggestions(Device_details, request.params.id);

    commonResponseService.successWithMessage(response, DeviceData.mesg);
  } catch (error) {
    console.log(error);
    commonResponseService.errorWithMessage(response, "something went wrong");
  }
}

/**
 * Update device data in the main bill plan
 * @param {*} request
 * @param {*} response
 */
async function updateDeviceDataMain(request, response) {
  try {
    var Device_details = request.body.data;

    var UnitPrice = await unitChargesModel.getUnitChargesDataFun("tou");

    var DayUnitCost = UnitPrice.data[0].Unit_charge;
    var OffPeakUnitCost = UnitPrice.data[1].Unit_charge;
    var PeakUnitCost = UnitPrice.data[2].Unit_charge;

    Device_details.using_minutes_peak_time = await CalculateNumberOfMinutes(
      Device_details.hPeak,
      Device_details.mPeak
    );
    Device_details.using_minutes_off_peak_time = await CalculateNumberOfMinutes(
      Device_details.hOffPeak,
      Device_details.mOffPeak
    );
    Device_details.using_minutes_day_time = await CalculateNumberOfMinutes(
      Device_details.hDay,
      Device_details.mDay
    );
    Device_details.units_peak_time = await CalculateUnits(
      Device_details.power,
      Device_details.using_minutes_peak_time,
      Device_details.quantity
    );
    Device_details.units_off_peak_time = await CalculateUnits(
      Device_details.power,
      Device_details.using_minutes_off_peak_time,
      Device_details.quantity
    );
    Device_details.units_day_time = await CalculateUnits(
      Device_details.power,
      Device_details.using_minutes_day_time,
      Device_details.quantity
    );
    Device_details.cost_peak_time = await CalculateCost(
      PeakUnitCost,
      Device_details.units_peak_time
    );
    Device_details.cost_off_peak_time = await CalculateCost(
      OffPeakUnitCost,
      Device_details.units_off_peak_time
    );
    Device_details.cost_day_time = await CalculateCost(
      DayUnitCost,
      Device_details.units_day_time
    );
    Device_details.total_units =
      Device_details.units_peak_time +
      Device_details.units_off_peak_time +
      Device_details.units_day_time;
    Device_details.total_cost_TOU =
      Device_details.cost_peak_time +
      Device_details.cost_off_peak_time +
      Device_details.cost_day_time;

    // console.log("inside addDeviceDataMain Controller");
    // console.log(Device_details);
    var DeviceData = await addDeviceModel.updateDeviceMailBill(
      Device_details,
      request.params.id
    );
    // console.log(profileData.data);

    await suggestionModel.deleteSuggestions(
      Device_details.device_id,
      request.params.id,
      Device_details.bill_id
    );
    await suggestionAlgorithm.makeSuggestions(
      Device_details,
      request.params.id
    );

    commonResponseService.responseWithData(response, DeviceData.mesg);
  } catch (error) {
    console.log(error);
    commonResponseService.errorWithMessage(response, "something went wrong");
  }
}

/**
 * Delete device data in the main bill plan controller
 * @param {*} request
 * @param {*} response
 */
async function deleteDeviceDataMain(request, response) {
  try {
    // console.log("inside deleteDeviceDataMain Controller");
    var Cust_id = request.params.id;
    var device_delete = await addDeviceModel.deleteDeviceFunc(
      Cust_id,
      request.body
    );

    commonResponseService.successWithMessage(response, device_delete.mesg);
  } catch (error) {
    console.log(error);
    commonResponseService.errorWithMessage(response, "something went wrong");
  }
}

/**
 * Create Bill ID
 * @param {*} request
 * @param {*} response
 */
async function getBillId(request, response) {
  try {
    // console.log("inside getBillId Controller");
    var Cust_id = request.params.id;
    var bill_id = await addDeviceModel.getBillIdFunc(Cust_id);

    if (bill_id.data != null) {
      commonResponseService.responseWithData(response, bill_id.data);
    } else {
      bill_id.data = 0;
      commonResponseService.responseWithData(response, bill_id.data);
    }
  } catch (error) {
    console.log(error);
    commonResponseService.errorWithMessage(response, "something went wrong");
  }
}

/**
 * Get device data from the main bill plan
 * @param {*} request
 * @param {*} response
 */
async function getDeviceDataMain(request, response) {
  try {
    // console.log("inside getDeviceDataMain Controller");
    // console.log(request.params.id)
    // console.log(request.body.newBillId)
    var DeviceData = await addDeviceModel.getDeviceMailBill(
      request.body.newBillId,
      request.params.id
    );

    if (DeviceData.data.length != 0) {
      commonResponseService.responseWithData(response, DeviceData.data);
    } else {
      commonResponseService.errorWithMessage(response, "No data");
    }
  } catch (error) {
    console.log(error);
    commonResponseService.errorWithMessage(response, "something went wrong");
  }
}

/**
 * Update the Device details after applying suggestions
 * @param {*} device_data
 * @param {*} Cust_id
 */
async function updateDeviceWithApplySugestion(device_data, Cust_id) {
  try {
    var Device_details = device_data;

    var UnitPrice = await unitChargesModel.getUnitChargesDataFun("tou");

    var DayUnitCost = UnitPrice.data[0].Unit_charge;
    var OffPeakUnitCost = UnitPrice.data[1].Unit_charge;
    var PeakUnitCost = UnitPrice.data[2].Unit_charge;

    Device_details.using_minutes_peak_time = await CalculateNumberOfMinutes(
      Device_details.hPeak,
      Device_details.mPeak
    );
    Device_details.using_minutes_off_peak_time = await CalculateNumberOfMinutes(
      Device_details.hOffPeak,
      Device_details.mOffPeak
    );
    Device_details.using_minutes_day_time = await CalculateNumberOfMinutes(
      Device_details.hDay,
      Device_details.mDay
    );
    Device_details.units_peak_time = await CalculateUnits(
      Device_details.power,
      Device_details.using_minutes_peak_time,
      Device_details.quantity
    );
    Device_details.units_off_peak_time = await CalculateUnits(
      Device_details.power,
      Device_details.using_minutes_off_peak_time,
      Device_details.quantity
    );
    Device_details.units_day_time = await CalculateUnits(
      Device_details.power,
      Device_details.using_minutes_day_time,
      Device_details.quantity
    );
    Device_details.cost_peak_time = await CalculateCost(
      PeakUnitCost,
      Device_details.units_peak_time
    );
    Device_details.cost_off_peak_time = await CalculateCost(
      OffPeakUnitCost,
      Device_details.units_off_peak_time
    );
    Device_details.cost_day_time = await CalculateCost(
      DayUnitCost,
      Device_details.units_day_time
    );
    Device_details.total_units =
      Device_details.units_peak_time +
      Device_details.units_off_peak_time +
      Device_details.units_day_time;
    Device_details.total_cost_TOU =
      Device_details.cost_peak_time +
      Device_details.cost_off_peak_time +
      Device_details.cost_day_time;

    // console.log("inside addDeviceDataMain Controller");
    // console.log(Device_details);
    var DeviceData = await addDeviceModel.updateDeviceMailBill(
      Device_details,
      Cust_id
    );
    // console.log(profileData.data);

    await suggestionModel.deleteSuggestions(
      Device_details.device_id,
      Cust_id,
      Device_details.bill_id
    );
    await suggestionAlgorithm.makeSuggestions(Device_details, Cust_id);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  AddDeviceDataMain,
  getDeviceDataMain,
  getBillId,
  updateDeviceDataMain,
  deleteDeviceDataMain,
  updateDeviceWithApplySugestion,
};
