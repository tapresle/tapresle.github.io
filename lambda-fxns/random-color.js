exports.handler = function(event, context, callback) {
  var color = '#' + (Math.random().toString(16) + '000000').slice(2, 8);
  callback(null, {
    statusCode: 200,
    contentType: 'text/html',
    body: '<html><head><style>html { background-color: ' + color + ';text-align: center;font-family: sans-serif;} h1 {margin: 50vh 0 0 0;transform: translateY(-50%);text-shadow: #333 2px 2px 2px;color: white;font-size: 48px;} button {padding: 12px;border-radius: 6px;background-color: #fff;font-size: 24px;}</style></head><body><h1>Your random color is: ' + color + '</h1><br/><button onclick="location.reload()">Want another? Click here</button></body></html>'
  });
}