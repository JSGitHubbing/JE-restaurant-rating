var modalURL = browser.runtime.getURL("src/modal.html");
var restaurantList = document.querySelectorAll("section[data-test-id='restaurant'");
var buttonImageURL = browser.runtime.getURL("icons/stock.png");

function modalConfiguration() {
	console.log( "Loading config modal..." );
	//Load modal html from outside
	document.querySelector("body").innerHTML += "<div id='je-modal' class='modal'><div class='modal-content'><span class='close-je-modal'>&times;</span><p>Some text in the Modal..</p></div></div>";
	
	// Get the modal
	var modal = document.getElementById("je-modal");

	// Get the button that opens the modal
	var jeButtons = document.querySelectorAll("input[id='je-manager-button']");

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close-je-modal")[0];

	// When the user clicks the button, open the modal 
	jeButtons.forEach(b => 
		b.onclick = function() {
			modal.style.display = "block";
		}
	);

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	  modal.style.display = "none";
	}
	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	  if (event.target == modal) {
		modal.style.display = "none";
	  }
	}
	console.log( "... config modal loaded!" );
}

function loadIcons() {
	console.log( "Loading icons..." );
	chrome.storage.local.get(null, (res) => {
  var color = "blue";
  if (res.color) {
    color = res.color;
  }
  restaurantList.forEach(restaurant =>  { 
	//restaurant.style.border = "5px solid " + color;
	
    //var imageURL = browser.runtime.getURL("icons/badplace.png");
	//restaurant.innerHTML += "<img src='"+imageURL+"' width='32' height='32' style='position:absolute; right:5px; top:5px'>";
	restaurant.innerHTML += "<input id='je-manager-button' type='image' src='"+buttonImageURL+"' width='32' height='32' style='position:absolute; right:5px; top:5px'>";
	
  }); 
  console.log( "... Icons loaded!" );
  modalConfiguration();
  
});
}

/*
	START
*/

function mainExtensionFunction() {
	loadIcons();
}

mainExtensionFunction();



//var test1 = restaurantList[0].getAttribute("data-restaurant-id");

/*chrome.storage.local.get(null, (res) => {
  var resdata;
  if (res.resdata) {
    resdata = res.resdata;
  }
  var restaurantList = document.querySelectorAll("section[data-restaurant-id='"+resdata+"']");
  restaurantList.forEach(restaurant => restaurant.style.border = "5px solid green");
});
*/

