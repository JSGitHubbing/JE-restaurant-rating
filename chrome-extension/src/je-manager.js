console.log("Start je-manager");

var modalURL = chrome.extension.getURL('src/modal/modal.html');

var icons = {};
icons.stock = chrome.extension.getURL("icons/stock.png");
icons.bad = chrome.extension.getURL("icons/badplace.png");
icons.good = chrome.extension.getURL("icons/goodplace.png");
icons.late = chrome.extension.getURL("icons/latedelivery.png");
icons.badfood = chrome.extension.getURL("icons/badfood.png");

var currentRestaurantId;

var debugging = true;

function log(msg) {
	if(debugging) {
		console.log(msg);
	}
}

function checkUrl() {
	var url =  window.location.href;
	var urlFilter = "https:\/\/www.just-eat\..*\/area.*";
	return url.match(urlFilter) != null;
}

function modalHTML() {

	var closeX = document.createTextNode("X");
	var close = document.createElement("span");
	close.setAttribute("class", "close-je-modal");
	close.appendChild(closeX);	

	var titleText = document.createTextNode("Rating");
	var title = document.createElement("h1");
	title.setAttribute("id","je-modal-title");
	title.setAttribute("class", "je-modal-title");
	title.appendChild(titleText);

	var goodValoration = document.createElement("input");
	goodValoration.setAttribute("id", "je-good-valoration");
	goodValoration.setAttribute("type", "image");
	goodValoration.setAttribute("src", icons.good);

	var badValoration = document.createElement("input");
	badValoration.setAttribute("id", "je-bad-valoration");
	badValoration.setAttribute("type", "image");
	badValoration.setAttribute("src", icons.bad);

	var modalbuttons = document.createElement("div");
	modalbuttons.setAttribute("class", "je-modal-content");

	modalbuttons.appendChild(goodValoration);
	modalbuttons.appendChild(badValoration);

	var modal = document.createElement("div");
	modal.setAttribute("class", "modal-content");
	modal.appendChild(close);
	modal.appendChild(title);
	modal.appendChild(modalbuttons);

	var jeModal = document.createElement("div");
	jeModal.setAttribute("id","je-modal");
	jeModal.setAttribute("class", "modal");

	jeModal.append(modal);

	return jeModal;
}

function modal2HTML() {

	var skipText = document.createTextNode("Skip");
	var skip = document.createElement("span");
	skip.setAttribute("id", "je-bad-reason-0");
	skip.appendChild(skipText);	

	var titleText = document.createTextNode("Reason");
	var title = document.createElement("h1");
	title.setAttribute("id","je-modal-2-title");
	title.setAttribute("class", "je-modal-title");
	title.appendChild(titleText);

	// Bad place
	var badPlace = document.createElement("input");
	badPlace.setAttribute("id", "je-bad-reason-1");
	badPlace.setAttribute("type", "image");
	badPlace.setAttribute("src", icons.bad);
	badPlace.setAttribute("value", "Bad place");

	// Late delivery
	var lateDelivery = document.createElement("input");
	lateDelivery.setAttribute("id", "je-bad-reason-2");
	lateDelivery.setAttribute("type", "image");
	lateDelivery.setAttribute("src", icons.late);

	// Bad food
	var badFood = document.createElement("input");
	badFood.setAttribute("id", "je-bad-reason-3");
	badFood.setAttribute("type", "image");
	badFood.setAttribute("src", icons.badfood);

	

	var modalbuttons = document.createElement("div");
	modalbuttons.setAttribute("class", "je-modal-content");

	modalbuttons.appendChild(badPlace);
	modalbuttons.appendChild(lateDelivery);
	modalbuttons.appendChild(badFood);

	var modal = document.createElement("div");
	modal.setAttribute("class", "modal-content");
	modal.appendChild(title);
	modal.appendChild(modalbuttons);
	modal.appendChild(skip);

	var jeModal2 = document.createElement("div");
	jeModal2.setAttribute("id","je-modal-2");
	jeModal2.setAttribute("class", "modal");

	jeModal2.append(modal);

	return jeModal2;
}

function getIconForReason(reason) {
	log("Image for reason " + reason);
	var iconUrl = icons.stock;
	switch(reason) {
		case 0: 
			iconUrl = icons.stock; 
			break;
		case 1:
			iconUrl = icons.bad;
			break;
		case 2:
			iconUrl = icons.late;
			break;
		case 3: 
			iconUrl = icons.badfood;
			break;
		default:
			iconUrl = icons.stock; 

	}
	log("is " + iconUrl);
	return iconUrl;
}

function updateRestaurantWithData(resData) {
	log("Res data:\nId: " + resData.id + "\ncolor " + resData.color);
	var restaurantEntry = document.querySelector("section[data-restaurant-id='"+resData.id+"']");
	restaurantEntry.style.border = "3px solid " + resData.color;
	document.getElementById("je-manager-button-" +resData.id).setAttribute("src", getIconForReason(resData.reason));	
	restaurantEntry.style.opacity = (resData.color == "red") ? 0.6 : 1;
}

function saveRestaurantConfiguration(id, color, reason) {
	var loadedData = [];
	chrome.storage.sync.get(null , (res) => {
			if(res) {
				log("Current status of res.resdata is: ");
				res.resdata.forEach(d => printResData(d));
				
				res.resdata.forEach(o => {
					var newEntry = Object.assign({}, o);
					if(newEntry.id != id) {
						log("loading data... " + newEntry.id);
						loadedData.push(newEntry);
					}
				});
			} else {
				console.error("ERROR: No stored data found");
			}
			
			var myResData = {};
			myResData.id = id;
			myResData.color = color;
			myResData.reason = reason;
			
			
			log("******\n\nCurrent status of res.resdata outside function is: ");
			loadedData.forEach(d => printResData(d));
			log("Want to add: ");
			printResData(myResData);
			
			loadedData.push(myResData);
			log("Current saving data is: ");
			loadedData.forEach(d => printResData(d));
			log("\n\n\n");
			
			log("liked " + id);
			chrome.storage.sync.set({
				"resdata": loadedData
			  }, function() {
				if (chrome.runtime.error) {
					console.log("Runtime error.");
				} else {
					updateRestaurantWithData(myResData)
				};
			  });
		});
		
	
}

// TODO remove this
function printResData(data) {
	log("id: " + data.id + ", color: " + data.color + ", reason:" + data.reason);
}

function saveRestaurantAndCloseModal(id, color, reason, modal) {
	saveRestaurantConfiguration(id, color, reason);
	modal.style.display = "none";
}

function loadModalWindows() {
	log("Load modal windows...");
	document.querySelector("body").appendChild(modalHTML());
	document.querySelector("body").appendChild(modal2HTML());
	log("...modal windows loaded!");
}

function modalConfiguration() {
	log( "Loading config modal..." );
	var modal = document.getElementById("je-modal");
	var modal2 = document.getElementById("je-modal-2");
	
	log("\tAdding first modal button functions");
	// START - Button onclick functions
	var likeButton = document.getElementById("je-good-valoration");
	likeButton.addEventListener("click", function(){
		saveRestaurantConfiguration(currentRestaurantId, "green", 0);
		modal.style.display = "none";
	});
	
	var dislikeButton = document.getElementById("je-bad-valoration");
	dislikeButton.addEventListener("click", function(){
		modal.style.display = "none";
		modal2.style.display = "block";
	});
	// END - Button on click functions

	log("\tAdding second modal button functions");
	// MODAL 2 Buttons
	var reason0 = document.getElementById("je-bad-reason-0");
	reason0.addEventListener("click", function(){saveRestaurantAndCloseModal(currentRestaurantId, "red", 0, modal2)});
	var reason1 = document.getElementById("je-bad-reason-1");
	reason1.addEventListener("click", function(){saveRestaurantAndCloseModal(currentRestaurantId, "red", 1, modal2)});
	var reason2 = document.getElementById("je-bad-reason-2");
	reason2.addEventListener("click", function(){saveRestaurantAndCloseModal(currentRestaurantId, "red", 2, modal2)});
	var reason3 = document.getElementById("je-bad-reason-3");
	reason3.addEventListener("click", function(){saveRestaurantAndCloseModal(currentRestaurantId, "red", 3, modal2)});

	log("\tAdding opening modal functions");
	// START - OPEN MODAL
	var jeButtons = document.querySelectorAll("input[id^='je-manager-button-']");
	jeButtons.forEach(b => 
		b.onclick = function() {
			log("Opening modal");
			modal.style.display = "block";
			currentRestaurantId = b.getAttribute("restaurant-id");
		}
	);	
	// END - OPEN MODAL

	log("\tAdding close modal button functions");
	// START - CLOSE MODAL
	var span = document.getElementsByClassName("close-je-modal")[0];
	span.onclick = function() {
	  modal.style.display = "none";
	}

	window.onclick = function(event) {
	  if (event.target == modal) {
		modal.style.display = "none";
	  }

	  if (event.target == modal2) {
		modal2.style.display = "none";
	  }
	}
	// END - CLOSE MODAL
	log( "... config modal loaded!" );
}

function loadStyles() {
	log( "Loading styles..." );
	chrome.storage.sync.get(null, (res) => {
		
		log("\tLoading restaurant data");
		if (res.resdata) {
			res.resdata.forEach(r => {
				updateRestaurantWithData(r);
			});
		} else {
			var data = [];
			chrome.storage.sync.set({
				"resdata": data
			  }, function() {
				log("Restaurant data not found, creating empty values");
			});	
		}
		
		log( "... styles loaded!" );
		modalConfiguration();

	});
}

function loadIcons() {
	log( "Loading icons..." );
	var restaurantList = document.querySelectorAll("section[data-test-id='restaurant'");
	restaurantList.forEach(restaurant =>  { 
		var editButton = document.createElement("input");
		var resId =  restaurant.getAttribute("data-restaurant-id");

		editButton.setAttribute("id", "je-manager-button-" + resId);
		editButton.setAttribute("type", "image");
		editButton.setAttribute("restaurant-id", resId);
		editButton.setAttribute("src", icons.stock);
		editButton.setAttribute("class", "je-manager-button");
		
		restaurant.appendChild(editButton);

	}); 
	log( "... Icons loaded!" );
	loadStyles();
}

/*
	START
*/

function mainExtensionFunction() {
	loadModalWindows();
	loadIcons();
}
mainExtensionFunction();
