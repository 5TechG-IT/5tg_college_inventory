var a = [
  "",
  "one ",
  "two ",
  "three ",
  "four ",
  "five ",
  "six ",
  "seven ",
  "eight ",
  "nine ",
  "ten ",
  "eleven ",
  "twelve ",
  "thirteen ",
  "fourteen ",
  "fifteen ",
  "sixteen ",
  "seventeen ",
  "eighteen ",
  "nineteen ",
];
var b = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

export const inWords = (num) => {
  if ((num = num.toString()).length > 12) return "overflow";
  //console.log("==>>", num, num.split("."));
  let n = "000000000" + num;
  //console.log("==", n);
  n = n.substr(-12);
  //console.log("==", n);
  n = n.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})\.(\d{2})$/);
  //console.log("==", n);
  if (!n) return;
  var str = "";
  var last = n[6] !== "00" ? " and " : " only";
  //console.log("==", last);
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "lakh "
      : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "hundred "
      : "";
  str +=
    n[5] != 0
      ? (str != "" ? "and " : "") +
        (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
      : "";
  str += last;
  str +=
    n[6] != 0
      ? a[Number(n[6])] || b[n[6][0]] + " " + a[n[6][1]] + "paise only"
      : "";
  //console.log("===", last);
  return str;
};
