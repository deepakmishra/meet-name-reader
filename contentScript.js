chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type === "isActive")
			status = status;
		else if (request.type === "activate") {
			status = "active";
			checkParticipants();
		} else if (request.type === "deactivate") {
			status = "inactive";
			cancelMonitorTranscriptSection();
		}
		sendResponse({status: status});
	}
);

var getParticipants = function () {	
	participantDivs = document.querySelector('[aria-label="Participants"]').querySelectorAll('[role="listitem"]');

	let yourNames = null;
	let otherParticipants = [];
	let duplicatePartsOfName = [];

	let othersNames = new Set();

	for (let i = 0; i < participantDivs.length; i++) {
		let spans = participantDivs[i].querySelectorAll("span")
		let participant = spans[0].innerText.trim();
		let nameSplit = participant.split(" ");

		if (!yourNames && spans[1].innerText.trim() == "(You)") {
			yourNames = nameSplit;
		} else {
			nameSplit.forEach(function(item) {
				othersNames.add(item);
			});
			otherParticipants.push(participant);
		}
	}

	yourNames = yourNames.filter(function(item, pos, self) {
    	return self.indexOf(item) == pos;
	});

	yourNames.forEach(function(item) {
		if(othersNames.has(item) && !duplicatePartsOfName.includes(item)) {
			duplicatePartsOfName.push(item);
		}
	});

	return [yourNames, otherParticipants, duplicatePartsOfName];
}

function checkParticipants () {
    var participantsTimer = setInterval (participantsTimerFinish, 1000);

    function participantsTimerFinish () {
        if (document.querySelector('[aria-label="Participants"]')) {
            clearInterval (participantsTimer);
            [yourNames, otherParticipants, duplicatePartsOfName] = getParticipants();
            let turnCaptionsOn = document.querySelector('[aria-label="Turn on captions (c)"]');
            if (turnCaptionsOn)
            	turnCaptionsOn.click();
            checkTranscriptSection();
        } else if (document.querySelector('[aria-label="Show everyone"]')) {
			document.querySelector('[aria-label="Show everyone"]').click();
			document.querySelector('[aria-label="Show everyone"]').click();
		}
    }
}

function checkTranscriptSection () {
    var transcriptSectionTimer = setInterval (transcriptSectionTimerFinish, 1000);

    function transcriptSectionTimerFinish () {
        for (let i = 0; i < otherParticipants.length; i++) {
        	let xPathResultNode = document.evaluate("//c-wiz//div[not(*)][contains(., '" + otherParticipants[i] + "')]/following-sibling::div//span/../../../../..", document, null, XPathResult.ANY_TYPE, null ).iterateNext();
	        if (xPathResultNode) {
	        	transcriptSection = xPathResultNode;
	        	clearInterval (transcriptSectionTimer);
	        	monitorTranscriptSection();
	        	return;
	        }
        }
    }
}

function readTranscriptSection() {
	if (!transcriptSection)
		return;
	let transcript = transcriptSection.innerText;
	let transcriptLowerCase = transcript.toLowerCase();
	let nameCalled = uniqueNameCalled = false;
	for (let i = 0; i < yourNames.length; i++) {
		if (transcriptLowerCase.indexOf(yourNames[i].toLowerCase()) != -1) {
			nameCalled = true;
			if (!duplicatePartsOfName.includes(yourNames[i])) {
				uniqueNameCalled = true;
			}
		}
	}
	if (nameCalled) {
		let priority = uniqueNameCalled ? "RED": "AMBER";
		let color = uniqueNameCalled ? "RED": "DARKORANGE";
		chrome.runtime.sendMessage({
		    type: "name_called", 
		    data: {
		    	priority: priority,
		        color: color,
		        transcript: transcript
		    }
		});
	}
}

function monitorTranscriptSection() {
	cancelMonitorTranscriptSection();
	monitorTranscriptSectionTimer = setInterval (readTranscriptSection, 1000);
}

function cancelMonitorTranscriptSection() {
	if (monitorTranscriptSectionTimer) {
		clearInterval(monitorTranscriptSectionTimer);
	}
}

let status = "inactive";

let [yourNames, otherParticipants, duplicatePartsOfName] = [null, null, null];

let transcriptSection = null;

let monitorTranscriptSectionTimer = null;
