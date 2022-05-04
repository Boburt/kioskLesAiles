let preferences = api.getPreferences();
var m = 6; //m kolichestvo gotovih zakazov
var pos = setInterval(loadDoc, 1000);
function mana(a) {
  if (a.length == 0) {
    console.log(a.length);
    document.getElementById("gotov").innerHTML = "";
    tozala(1);
  }
  if (a.length > 0) {
    document.getElementById("zakaz").innerHTML = "Заказ №";
    document.getElementById("ready").innerHTML = "Готов !!!";
    var order = a.split("\n");
    if (
      document.getElementById("gotov").innerHTML.trim() !=
      order[0].toString().trim()
    ) {
      //console.log(document.getElementById("gotov").innerHTML.trim()==order[0].toString().trim());
      document.getElementById("gotov").innerHTML = order[0];
      for (var x = 1; x < order.length; x++) {
        if (x > m) break;

        test = document.getElementById(x);
        // (Math.floor(Math.random()*4)+1)
        test.style.backgroundImage =
          "url('img/" + ((parseInt(order[x]) % 4) + 1) + ".png')";
        document.getElementById(x).innerHTML = order[x];
        console.log(test);
      }
      //tozala(order.length);
    }
  }
}

function tozala(n = 1) {
  document.getElementById("zakaz").innerHTML = "";
  document.getElementById("ready").innerHTML = "";
  for (var x = n; x <= m; x++) {
    test = document.getElementById(x);
    test.style.backgroundImage = "";
    document.getElementById(x).innerHTML = " ";
  }
}

function loadDoc() {
  if (
    preferences.main.file_path &&
    preferences.main.file_path.indexOf(".txt") > -1
  ) {
    let data = api.readFileData(preferences.main.file_path);
    mana(data);
  }
}

// Fetch the preferences object
// const preferences = ipcRenderer.sendSync("getPreferences");

keymage("ctrl-e", function () {
  // Display the preferences window
  api.showPreferences();
});
api.onPreferencesChanged((preferences) => {
  preferences = preferences;
  console.log("Preferences were updated", preferences);
});
