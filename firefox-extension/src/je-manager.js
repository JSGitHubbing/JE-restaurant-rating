console.log("Start je-manager");

var modalURL = browser.runtime.getURL("src/modal/modal.html");

var icons = {};
icons.stock = browser.runtime.getURL("icons/stock.png");
icons.bad = browser.runtime.getURL("icons/badplace.png");
icons.good = browser.runtime.getURL("icons/goodplace.png");
icons.late = browser.runtime.getURL("icons/latedelivery.png");
icons.badfood = browser.runtime.getURL("icons/badfood.png");

var currentRestaurantId;

var debugging = true;

function log(msg) {
	if(debugging) {
		console.log(msg);
	}
}

function modalHTML() {
	return `
	<div id="je-modal" class="modal">
	  <div class="modal-content">
		<span class="close-je-modal">&times;</span>
		<h1 id="je-modal-title" class="je-modal-title">Rating</h1>
		<div class="je-modal-content">
			<input type='image' id="je-good-valoration" src='` + icons.good + `'">
			<input type='image' id="je-bad-valoration" src='` + icons.bad + `'">
		</div>
	  </div>
	</div>
	`;
}

function modal2HTML() {
	return `
	<div id="je-modal-2" class="modal">
	  <div class="modal-content">
		<h1 id="je-modal-2-title" class="je-modal-title">Reason</h1>
		<div class="je-modal-content">
			<input type='image' id="je-bad-reason-1" src='` + icons.bad + `'>Bad place</span>
			<input type='image' id="je-bad-reason-2" src='` + icons.late + `'>Late delivery</span>
			<input type='image' id="je-bad-reason-3" src='` + icons.badfood + `'>Bad food</span>
		</div>
			<span id="je-bad-reason-0">Skip</span>
		</div>
	  </div>
	</div>
	`;
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
	log("Obtaining: " + restaurantEntry);
	restaurantEntry.style.border = "3px solid " + resData.color;
	document.getElementById("je-manager-button-" +resData.id).setAttribute("src", getIconForReason(resData.reason));	
	restaurantEntry.style.opacity = (resData.color == "red") ? 0.6 : 1;
}

function saveRestaurantConfiguration(id, color, reason) {
	var loadedData = [];
	chrome.storage.local.get(null, (res) => {
			if(res) {
				res.resdata.forEach(o => {
					var newEntry = Object.assign({}, o);
					if(newEntry.id != id) {
						loadedData.push(newEntry);
					}
				});
			}
		});
		
		var myResData = {};
		myResData.id = id;
		myResData.color = color;
		myResData.reason = reason;
		
		loadedData.push(myResData);
		
		log("liked " + id);
		chrome.storage.local.set({
			resdata: loadedData
		  }, function() {
			updateRestaurantWithData(myResData);
		  });
}

function saveRestaurantAndCloseModal(id, color, reason, modal) {
	saveRestaurantConfiguration(id, color, reason);
	modal.style.display = "none";
}

function loadModalWindows() {
	log("Load modal windows...");
	document.querySelector("body").innerHTML += modalHTML() + modal2HTML();
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
	chrome.storage.local.get(null, (res) => {
		
		log("\tLoading restaurant data");
		if (res.resdata) {
			res.resdata.forEach(r => {
				updateRestaurantWithData(r);
			});
		} else {
			var data = [];
			chrome.storage.local.set({
				resdata: data
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
	log(
	`🇱​​​​​🇴​​​​​🇦​​​​​🇩​​​​​🇮​​​​​🇳​​​​​🇬​​​​​ 🇪​​​​​🇽​​​​​🇹​​​​​🇪​​​​​🇳​​​​​🇸​​​​​🇮​​​​​🇴​​​​​🇳​​​​​
🇹​​​​​🇭​​​​​🇦​​​​​🇳​​​​​🇰​​​​​🇸​​​​​ 🇫​​​​​🇴​​​​​🇷​​​​​ 🇺​​​​​🇸​​​​​🇮​​​​​🇳​​​​​🇬​​​​​ 🇮​​​​​🇹​​​​​
`);
	loadModalWindows();
	loadIcons();
}

mainExtensionFunction();