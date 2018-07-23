function get_out_trade_no() {
    var s = [];
    var hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = 0; i <= 30; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    //s[14] = "4";
    s[18] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    //s[4] = s[9] = s[15]  = "-";
    var uuid = s.join("");
    return uuid;
}
module.exports = get_out_trade_no