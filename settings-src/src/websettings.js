'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var WebSettings = /** @class */ (function () {
    function WebSettings(settings) {
        this.internalsettings = settings;
    }
    WebSettings.prototype.getSchedules = function () {
        return this.schedules;
    };
    WebSettings.prototype.readSettings = function () {
        var _this = this;
        //if (this.homeyApp != null) this.homeyApp.log('Reading settings...');
        try {
            var rs = this.internalsettings;
            if (rs == null) {
                //if (this.homeyApp != null) this.homeyApp.log('Settings not found, starting blank')
                return -1;
            }
            var jsonsettings = JSON.parse(rs);
            if (jsonsettings == null) {
                //if (this.homeyApp != null) this.homeyApp.log('Settings not possible to parse, starting blank')
                return -1;
            }
            this.schedules = new Array();
            jsonsettings.settings.schedules.forEach(function (sched) {
                var localschedule = new Schedule(parseInt(sched.id), sched.name, Boolean(sched.active));
                sched.tokens.forEach(function (token) {
                    var localtoken = new Token(parseInt(token.id), token.name, token.type);
                    localschedule.tokens.push(localtoken);
                });
                sched.scheduleitems.forEach(function (si) {
                    var dt;
                    switch (si.daystype) {
                        case 'daysofweek': {
                            dt = DaysType.DaysOfWeek;
                            break;
                        }
                        case 'daysofmonth': {
                            dt = DaysType.DaysOfMonth;
                            break;
                        }
                    }
                    var tt;
                    switch (si.timetype) {
                        case 'timeofday': {
                            tt = TimeType.TimeOfDay;
                            break;
                        }
                        case 'solar': {
                            tt = TimeType.Solar;
                            break;
                        }
                    }
                    var localsi = new ScheduleItem(parseInt(si.id), dt, si.daysarg, tt, si.timearg);
                    si.tokenitems.forEach(function (ti) {
                        var localtoken = localschedule.tokens.find(function (t) { return t.id == ti.id; });
                        var localtokenitem;
                        if (localtoken.type == 'boolean') {
                            localtokenitem = new TokenItem(localtoken, Boolean(ti.value));
                        }
                        else if (localtoken.type == 'string') {
                            localtokenitem = new TokenItem(localtoken, ti.value);
                        }
                        else if (localtoken.type == 'number') {
                            localtokenitem = new TokenItem(localtoken, Number(ti.value));
                        }
                        else {
                            //    if (this.homeyApp != null) this.homeyApp.log('Incorrect type for tokenitem');
                        }
                        localsi.tokenitems.push(localtokenitem);
                    });
                    localschedule.scheduleitems.push(localsi);
                });
                _this.schedules.push(localschedule);
            });
            //if (this.homeyApp != null) this.homeyApp.log('Settings read');
        }
        catch (error) {
            //if (this.homeyApp != null) this.homeyApp.log('Settings NOT read!');
            //if (this.homeyApp != null) this.homeyApp.log('Error: ' + error);
            return -1;
        }
        return this.schedules.length;
    };
    return WebSettings;
}());
exports.WebSettings = WebSettings;
var Schedule = /** @class */ (function () {
    function Schedule(id, name, active) {
        this.id = id;
        this.name = name;
        this.active = active;
        this.tokens = new Array();
        this.scheduleitems = new Array();
    }
    return Schedule;
}());
var Token = /** @class */ (function () {
    function Token(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
    return Token;
}());
var DaysType;
(function (DaysType) {
    DaysType[DaysType["DaysOfWeek"] = 0] = "DaysOfWeek";
    DaysType[DaysType["DaysOfMonth"] = 1] = "DaysOfMonth";
})(DaysType || (DaysType = {}));
var TimeType;
(function (TimeType) {
    TimeType[TimeType["TimeOfDay"] = 0] = "TimeOfDay";
    TimeType[TimeType["Solar"] = 1] = "Solar";
})(TimeType || (TimeType = {}));
var ScheduleItem = /** @class */ (function () {
    function ScheduleItem(id, daytype, daysarg, timetype, timearg) {
        this.id = id;
        this.daystype = daytype;
        this.daysarg = daysarg;
        this.timetype = timetype;
        this.timearg = timearg;
        this.tokenitems = new Array();
    }
    Object.defineProperty(ScheduleItem.prototype, "daysArgText", {
        get: function () {
            if (this.daysarg == 0)
                return "Nothing";
            else if (this.daysarg == 1 + 2 + 4 + 8 + 16)
                return "Weekdays";
            else if (this.daysarg == 32 + 64)
                return "Weekends";
            else if (this.daysarg == 1 + 2 + 4 + 8 + 16 + 32 + 64)
                return "All week";
            else {
                var s = '';
                if (this.daysarg && 1 > 0)
                    s += 'Mo,';
                if (this.daysarg && 2 > 0)
                    s += 'Tu,';
                if (this.daysarg && 4 > 0)
                    s += 'We,';
                if (this.daysarg && 8 > 0)
                    s += 'Th,';
                if (this.daysarg && 16 > 0)
                    s += 'Fr,';
                if (this.daysarg && 32 > 0)
                    s += 'Sa,';
                if (this.daysarg && 64 > 0)
                    s += 'Su,';
                return s;
            }
        },
        enumerable: true,
        configurable: true
    });
    return ScheduleItem;
}());
var TokenItem = /** @class */ (function () {
    function TokenItem(token, value) {
        this.token = token;
        this.value = value;
    }
    return TokenItem;
}());
