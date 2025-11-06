"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countWorkingDays = countWorkingDays;
const date_fns_1 = require("date-fns");
function countWorkingDays(startDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = (0, date_fns_1.add)(startDate, { months: 1 });
    let count = 0;
    for (let d = new Date(startDate); (0, date_fns_1.isBefore)(d, endDate); d.setDate(d.getDate() + 1)) {
        const day = (0, date_fns_1.getDay)(d);
        if (day !== 0 && day !== 6) {
            count++;
        }
    }
    return {
        startDate: startDate,
        endDate: endDate,
        workingDays: count
    };
}
