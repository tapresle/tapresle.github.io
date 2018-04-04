exports.handler = function(event, context, callback) {
    // your server-side functionality
  callback(null, {
    200,
    "",
    body: event
  });
}

/* 

Notes


event = {
    "path": "Path parameter",
    "httpMethod": "Incoming request's method name"
    "headers": {Incoming request headers}
    "queryStringParameters": {query string parameters }
    "body": "A JSON string of the request payload."
    "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encode"
}




*/