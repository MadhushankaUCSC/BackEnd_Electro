var commonResponseService = require('../../service/responseService');
var addDeviceModel = require('../../model/monthlyBill/addDevicesModel');
var unitChargesModel = require('../../model/cebengineer/unitChargesModel');

function CalculateUnits(power, minutes) {

    var numOfUnits = power * minutes * 60 / 3600000;
    return numOfUnits;

}

function CalculateNumberOfMinutes(hors, minutes) {

    var numOfMinutes = (hors * 60) + minutes;
    return numOfMinutes;

}

function CalculateCost(uPrice, Units) {

    var cost = uPrice * Units;
    return cost;

}

/**
 * add device data to main bill plan
 */
async function AddDeviceDataMain(request, response) {

    try {

        var Device_details = request.body.data;
        console.log(Device_details);

        var UnitPrice = await unitChargesModel.getUnitChargesDataFun("tou");
        console.log(UnitPrice.data[0].Unit_charge);
        console.log(UnitPrice.data[1].Unit_charge);
        console.log(UnitPrice.data[2].Unit_charge);

        var DayUnitCost = UnitPrice.data[0].Unit_charge;
        var OffPeakUnitCost = UnitPrice.data[1].Unit_charge;
        var PeakUnitCost = UnitPrice.data[2].Unit_charge;




        Device_details.using_minutes_peak_time = await CalculateNumberOfMinutes(Device_details.hPeak, Device_details.mPeak);
        Device_details.using_minutes_off_peak_time = await CalculateNumberOfMinutes(Device_details.hOffPeak, Device_details.mOffPeak);
        Device_details.using_minutes_day_time = await CalculateNumberOfMinutes(Device_details.hDay, Device_details.mDay);
        Device_details.units_peak_time = await CalculateUnits(Device_details.power, Device_details.using_minutes_peak_time);
        Device_details.units_off_peak_time = await CalculateUnits(Device_details.power, Device_details.using_minutes_off_peak_time);
        Device_details.units_day_time = await CalculateUnits(Device_details.power, Device_details.using_minutes_day_time);
        Device_details.cost_peak_time = await CalculateCost(PeakUnitCost, Device_details.units_peak_time);
        Device_details.cost_off_peak_time = await CalculateCost(OffPeakUnitCost, Device_details.units_off_peak_time);
        Device_details.cost_day_time = await CalculateCost(DayUnitCost, Device_details.units_day_time);
        Device_details.total_units_fixed = Device_details.units_peak_time + Device_details.units_off_peak_time + Device_details.units_day_time;
        Device_details.total_cost_TOU = Device_details.cost_peak_time + Device_details.cost_off_peak_time + Device_details.cost_day_time;


        console.log("inside addDeviceDataMain Controller");
        // console.log(request.params.id);
        var DeviceData = await addDeviceModel.AddDeviceMailBill(Device_details);
        // console.log(profileData.data);

        commonResponseService.responseWithData(response, DeviceData.mesg);





    } catch (error) {
        console.log(error);
        commonResponseService.errorWithMessage(response, "something went wrong");
    }
}


async function getBillId(request, response) {

    try {

        console.log("inside getDeviceDataMain Controller");
        var DeviceData = await addDeviceModel.getDeviceMailBill();
        commonResponseService.responseWithData(response, DeviceData.data);
        // if (DeviceData.data.length != 0) {
            
        //     console.log("1jedefhb")
        // } else {
        //     console.log("jedefhb")
        //     commonResponseService.errorWithMessage(response, "something went wrong");

        // }

    } catch (error) {
        console.log(error);
        commonResponseService.errorWithMessage(response, "something went wrong");
    }
}


/**
 * add device data to main bill plan
 */
async function getDeviceDataMain(request, response) {

    try {

        console.log("inside getDeviceDataMain Controller");
        var DeviceData = await addDeviceModel.getDeviceMailBill();
        commonResponseService.responseWithData(response, DeviceData.data);
        // if (DeviceData.data.length != 0) {
            
        //     console.log("1jedefhb")
        // } else {
        //     console.log("jedefhb")
        //     commonResponseService.errorWithMessage(response, "something went wrong");

        // }

    } catch (error) {
        console.log(error);
        commonResponseService.errorWithMessage(response, "something went wrong");
    }
}

module.exports = { AddDeviceDataMain, getDeviceDataMain, getBillId };