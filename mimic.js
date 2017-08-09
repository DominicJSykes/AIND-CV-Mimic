// Mimic Me!
// Fun game where you need to express emojis being displayed

// --- Affectiva setup ---

// The affdex SDK Needs to create video and canvas elements in the DOM
var divRoot = $("#camera")[0];  // div node where we want to add these elements
var width = 640, height = 480;  // camera image size
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;  // face mode parameter

// Initialize an Affectiva CameraDetector object
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

// Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();

// --- Utility values and functions ---

// Unicode values for all emojis Affectiva can detect
var emojis = [ 128528, 9786, 128515, 128524, 128527, 128521, 128535, 128539, 128540, 128542, 128545, 128563, 128561 ];

// Update target emoji being displayed by supplying a unicode value
function setTargetEmoji(code) {
  $("#target").html("&#" + code + ";");
}

// Convert a special character to its unicode value (can be 1 or 2 units long)
function toUnicode(c) {
  if(c.length == 1)
    return c.charCodeAt(0);
  return ((((c.charCodeAt(0) - 0xD800) * 0x400) + (c.charCodeAt(1) - 0xDC00) + 0x10000));
}

// Update score being displayed
function setScore(correct, total) {
  $("#score").html("Score: " + correct + " / " + total);
}

// Display log messages and tracking results
function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

// --- Callback functions ---

// Start button
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");  // clear out previous log
    detector.start();  // start detector
  }
  log('#logs', "Start button pressed");
}

// Stop button
function onStop() {
  log('#logs', "Stop button pressed");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();  // stop detector
  }
};

// Reset button
function onReset(timestamp) {
  log('#logs', "Reset button pressed");
  if (detector && detector.isRunning) {
    detector.reset();
  }
  $('#results').html("");  // clear out results
  $("#logs").html("");  // clear out previous log

  // TODO(optional): You can restart the game as well
  // <your code here>
  gameReset(timestamp)
};

// Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

// Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

// Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
});

// Add a callback to notify when the detector is initialized and ready for running
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");

  // TODO(optional): Call a function to initialize the game, if needed
  // <your code here>
  initializeGame()
});

// Add a callback to receive the results from processing an image
// NOTE: The faces object contains a list of the faces detected in the image,
//   probabilities for different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  var canvas = $('#face_video_canvas')[0];
  if (!canvas)
    return;

  // Report how many faces were found
  $('#results').html("");
  log('#results', "Timestamp: " + timestamp.toFixed(2));
  log('#results', "Number of faces found: " + faces.length);
  if (faces.length > 0) {
    // Report desired metrics
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
    log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);

    // Call functions to draw feature points and dominant emoji (for the first face only)
    drawFeaturePoints(canvas, image, faces[0]);
    drawEmoji(canvas, image, faces[0]);

    // TODO: Call your function to run the game (define it first!)
    // <your code here>
    //updateGameFun(canvas,faces[0]);
    //updateGameTimer(canvas, faces[0], timestamp);
    updateGameTimeout(canvas, faces[0], timestamp);
    drawFeaturePoints(canvas, image, faces[1]);
    drawEmoji(canvas, image, faces[1]);
    //updateGameTwoPlayerTimer(faces[0], faces[1], timestamp);
    //updateGameActingPractice(score);
  }
});


// --- Custom functions ---

// Draw the detected facial feature points on the image
function drawFeaturePoints(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');

  // TODO: Set the stroke and/or fill style you want for each feature point marker
  // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Fill_and_stroke_styles
  // <your code here>
  ctx.fillStyle = 'rgb(200,0,0)';
  
  // Loop over each feature point in the face
  for (var id in face.featurePoints) {
    var featurePoint = face.featurePoints[id];

    // TODO: Draw feature point, e.g. as a circle using ctx.arc()
    // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
    // <your code here>
    ctx.beginPath();
    ctx.arc(featurePoint.x, featurePoint.y, 2, 0, 2 * Math.PI, true);
    ctx.fill();
  }
}

// Draw the dominant emoji on the image
function drawEmoji(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');

  // TODO: Set the font and style you want for the emoji
  // <your code here>
  var faceSize = (face.featurePoints[10].x - face.featurePoints[5].x)/2;
  ctx.font = faceSize + 'px sans-serif';
  ctx.fillStyle = 'rgb(255,255,255)';
  
  // TODO: Draw it using ctx.strokeText() or fillText()
  // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
  // TIP: Pick a particular feature point as an anchor so that the emoji sticks to your face
  // <your code here>
  anchor = face.featurePoints[5]
  ctx.fillText(face.emojis.dominantEmoji, anchor.x - 75, anchor.y);
}

// TODO: Define any variables and functions to implement the Mimic Me! game mechanics
 // [ 128528, 9786, 128515, 128524, 128527, 128521, 128535, 128539, 128540, 128542, 128545, 128563, 128561 ];
var gameEmojis = [ 128528,  9786, 128515, 128521];
var target;
var score;
var timer;
var scoreOne;
var scoreTwo;

// NOTE:
// - Remember to call your update function from the "onImageResultsSuccess" event handler above
// - You can use setTargetEmoji() and setScore() functions to update the respective elements
// - You will have to pass in emojis as unicode values, e.g. setTargetEmoji(128578) for a simple smiley
// - Unicode values for all emojis recognized by Affectiva are provided above in the list 'emojis'
// - To check for a match, you can convert the dominant emoji to unicode using the toUnicode() function

// Optional:
// - Define an initialization/reset function, and call it from the "onInitializeSuccess" event handler above
// - Define a game reset function (same as init?), and call it from the onReset() function above

// <your code here>

function initializeGame(){
  score = 0;
  setScore(score, "-");
  timer = 0;
  target = randomPhrase(gameEmojis);
  setTargetEmoji(target);
}

function gameReset(timestamp){
  score = 0;
  setScore(score, "-");
  timer = timestamp;
  target = randomPhrase(gameEmojis);
  setTargetEmoji(target);
}

function updateGameFun(canvas, face) {
  if (target == toUnicode(face.emojis.dominantEmoji) && score < 10){
    score ++;
    setScore(score, 10);

    feedback(canvas, "Success", 100, 100);

    target = randomPhrase(gameEmojis);
    setTargetEmoji(target);
  }
  if (score == 10){
    feedback(canvas, "Congratulations", 50, 50);
    feedback(canvas, "You completed the game!", 50, 100);
  }
}

function updateGameTimer(canvas, face, timestamp){
  if (target == toUnicode(face.emojis.dominantEmoji) && ((timestamp - timer) < 60 || score == 0)){
    if (score == 0){
      timer = timestamp
    }
    score ++;
    setScore(score, "-");    

    feedback(canvas, "Success", 100, 100);

    target = randomPhrase(gameEmojis);
    setTargetEmoji(target);
  }
  if ((timestamp - timer) > 60){
    feedback(canvas, "Game Over!", 50, 50);
    feedback(canvas, "You scored: " + score, 50, 100);
  }
}

function updateGameTimeout(canvas, face, timestamp){
  if (target == toUnicode(face.emojis.dominantEmoji) && ((timestamp - timer) < 10 || score == 0)){
    score ++;
    setScore(score, "-");    

    feedback(canvas, "Success", 100, 100);

    target = randomPhrase(gameEmojis);
    setTargetEmoji(target);
    timer = timestamp
  }
  if ((timestamp - timer) > 10 && score != 0){
    feedback(canvas, "Game Over!", 50, 50);
    feedback(canvas, "You scored: " + score, 50, 100);
  }
}

function updateGameTwoPlayerTimer(faceOne, faceTwo, timestamp){
  if (target == toUnicode(faceOne.emojis.dominantEmoji) && ((timestamp - timer) < 60 || (scoreOne == 0 && scoreTwo == 0))){
    if (scoreOne == 0 && scoreTwo == 0){
      timer = timestamp
    }
    scoreOne ++;

    feedback(canvas, "Player One Success", 100, 100);

    target = randomPhrase(gameEmojis);
    setTargetEmoji(target);
    setScore(scoreOne, scoreTwo);
  }
  if (target == toUnicode(faceTwo.emojis.dominantEmoji) && ((timestamp - timer) < 60 || (scoreOne == 0 && scoreTwo == 0))){
    if (scoreOne == 0 && scoreTwo == 0){
      timer = timestamp
    }
    scoreTwo ++;

    feedback(canvas, "Player Two Success", 100, 100);

    target = randomPhrase(gameEmojis);
    setTargetEmoji(target);
    setScore(scoreOne, scoreTwo);
  }
  if ((timestamp - timer) > 60 && scoreOne > scoreTwo){
    feedback(canvas, "Game Over! Player One Wins", 50, 50);
    feedback(canvas, scoreOne + "to " + scoreTwo, 50, 100);
  }
  if ((timestamp - timer) > 60 && scoreOne < scoreTwo){
    feedback(canvas, "Game Over! Player Two Wins", 50, 50);
    feedback(canvas, scoreOne + "to " + scoreTwo, 50, 100);
  }
}

function updateGameActingPractice(score){
  if (score == 0){
    feedback(canvas, "My dear Watson, must your time come so soon", 10, 100);
    target = 128527;
    score ++;
  }
  else if (target == toUnicode(face.emojis.dominantEmoji) && score == 1){
    score ++;

    feedback(canvas, "We could of made such a team", 10, 100);

    target = 128535;
    setTargetEmoji(target);
    setScore(score, 10);
  }
  else if (target == toUnicode(face.emojis.dominantEmoji) && score == 2){
    score ++;

    feedback(canvas, "But you threatened what is mine!", 10, 100);

    target = 128545;
    setTargetEmoji(target);
    setScore(score, 10);
  }  
  else if (target == toUnicode(face.emojis.dominantEmoji) && score == 3){
    score ++;

    feedback(canvas, "And now I have my revenge", 10, 100);

    target = 9786;
    setTargetEmoji(target);
    setScore(score, 10);
  }  
  else if (target == toUnicode(face.emojis.dominantEmoji) && score == 4){
    score ++;

    feedback(canvas, "Imagine all those who will miss you", 10, 100);
    feedback(canvas, "Do you think Sherlock will shed a tear", 10, 100);

    target = 128542;
    setTargetEmoji(target);
    setScore(score, 10);
  }  
  else if (target == toUnicode(face.emojis.dominantEmoji) && score == 5){
    score ++;

    feedback(canvas, "Although I dare say he wouldn't for any", 10, 100);
    feedback(canvas, "but for that Adler woman right", 10, 100);    

    target = 128521;
    setTargetEmoji(target);
    setScore(score, 10);
  }  
  else if (target == toUnicode(face.emojis.dominantEmoji) && score == 6){
    score ++;

    feedback(canvas, "Oh what fun we shall have", 10, 100);    

    target = 128515;
    setTargetEmoji(target);
    setScore(score, 10);
  }  
  else if (target == toUnicode(face.emojis.dominantEmoji) && score == 7){
    score ++;

    feedback(canvas, "Why are you smiling Watson", 10, 100);    

    target = 128563;
    setTargetEmoji(target);
    setScore(score, 10);
  }    
  else if (target == toUnicode(face.emojis.dominantEmoji) && score == 8){
    score ++;

    feedback(canvas, "Don't you know there is no hope", 10, 100);     

    target = 128539;
    setTargetEmoji(target);
    setScore(score, 10);
  }  
  else if (target == toUnicode(face.emojis.dominantEmoji) && score == 9){
    score ++;

    feedback(canvas, "Oh no, he's behind me isn't he, Why Sherlock why!", 10, 100);

    target = 128561;
    setTargetEmoji(target);
    setScore(score, 10);
  }           
  else if (score == 10){
    feedback(canvas, "Congratulations, you completed acting practice", 10, 100);    
  } 
}

function randomPhrase(phraseArr) {
    // returns a random phrase
    // where phraseArr is an array of string phrases
    var i = 0;
    i = Math.floor(Math.random() * phraseArr.length);
    return (phraseArr[i]);
};

function feedback(canvas, text_to_output, x, y) {
    var ctx = canvas.getContext('2d');
    ctx.font = '48px sans-serif';
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillText(text_to_output, x, y);
}