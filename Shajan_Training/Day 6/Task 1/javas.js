let calculator = document.querySelector("form");
let interest = document.querySelector(".interest");
let total = document.querySelector(".total");
let addInfo = document.querySelector(".add-info");
let result = 0;

let principal = document.querySelector("#p");
let time = document.querySelector("#n");
let rate = document.querySelector("#r");
let alertMsg = document.querySelector("#alert");

principal.addEventListener("blur", function() {
  let p = parseFloat(this.value);
  if (isNaN(p) || p < 500 || p > 10000) {
    alertMsg.textContent = "Enter principal amount from $500 to $10000";
    alertMsg.style.color = "red";
    this.value = "";
  } else {
    alertMsg.textContent = "";
  }
});

calculator.addEventListener("submit", (e) => {
  e.preventDefault();

  var p = parseFloat(principal.value);
  var n = parseFloat(time.value);
  var r = parseFloat(rate.value);

  if (isNaN(p) || isNaN(n) || isNaN(r)) {
    alertMsg.textContent = "Please enter valid numbers for all fields.";
    alertMsg.style.color = "red";
    return;
  }

  alertMsg.textContent = "";

  let addedBonus = 0;
  if (n > 5) {
    r += 2;
    addedBonus = (p / 100) * r;
  }
  else if (p < 1000 && r < 5) r = 5;
  else if ((p >= 1000 && p < 5000) && n < 7) r = 7;
  else if (p > 5000 && n < 10) r = 10;

  result = (p * n * r) / 100;
  interest.textContent = result.toFixed(2);
  total.textContent = (result + p).toFixed(2);
  addInfo.textContent = addedBonus.toFixed(2);
});
