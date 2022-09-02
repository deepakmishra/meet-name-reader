chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.notifications.create(
          "name_called",
          {
            type: "basic",
            iconUrl: "icon_128.png",
            title: request.data.priority + " ALERT : Name called in Meet",
            message: request.data.transcript
          }
        );
        setTimeout(function() {
          chrome.notifications.clear("name_called");
        }, 5000);
    }
);
