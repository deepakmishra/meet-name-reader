const meetTabsMessages = document.getElementById("meet_tabs_messages");
const lastMessages = document.getElementById("last_messages");

var activateMeet = function(tab) {
  chrome.tabs.sendMessage(tab.id, {type: "activate"}, function (response) {
    if (response && response.status == "active")
      meetTabsMessages.innerText = "Activated";
    else 
      meetTabsMessages.innerText = "Something has failed";
  });
}

var deactivateMeet = function(tab) {
  chrome.tabs.sendMessage(tab.id, {type: "deactivate"}, function (response) {
    if (response && response.status == "inactive")
      meetTabsMessages.innerText = "Deactivated";
    else 
      meetTabsMessages.innerText = "Something has failed";
  });
}

var checkActiveMeet = function(tab, btn) {
  response = chrome.tabs.sendMessage(tab.id, {type: "isActive"}, function (response) {
    if (response.status == "active") {
      btn.innerHTML = "Deactivate";
      btn.onclick = function(){
       deactivateMeet(tab);
      };
    } else {
      btn.innerHTML = "Activate";
      btn.onclick = function(){
       activateMeet(tab);
      };
    }
  });
}

var singleTabAction = function(tab) {
  btn = document.createElement("button");
  btn.innerHTML = "Checking Status";
  meetTabsMessages.innerText = "Meet Found"
  meetTabsMessages.appendChild(btn);
  checkActiveMeet(tab, btn);
}

var tabsAction = function(tabs) {
    switch(tabs.length) {
      case 0:
        meetTabsMessages.innerText = "No Meet Found";
        break;
      case 1:
        meetTabsMessages.innerText = "One Meet Found.";
        singleTabAction(tabs[0]);
        break;
      default:
        meetTabsMessages.innerText = "Multiple Meets Found.";
        break;
    }
}

let currentMeetTabQueryOptions = {"url": "https://meet.google.com/*", active: true, currentWindow: true};

let allMeetQueryOptions = {"url": "https://meet.google.com/*"};

var currentMeetTabAction = function(tabs) {
  if (tabs.length == 1)
    singleTabAction(tabs[0]);
  else
    chrome.tabs.query(allMeetQueryOptions, tabsAction);
}

chrome.tabs.query(currentMeetTabQueryOptions, currentMeetTabAction);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        lastMessages.innerText = "Last Notification: \n";
        let span = document.createElement("span");
        span.innerText = request.data.transcript;
        span.style.color = request.data.color;
        lastMessages.appendChild(span);
        setTimeout(function() {
          lastMessages.innerText = "";
        }, 30000);
    }
);
