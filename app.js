const express = require('express');
const axios = require('axios');
var bodyParser = require('body-parser');
const tinyurl = require('tinyurl');
const app = express();
const port = 3000;
const username = 'e0cc7a8f-3b38-4c61-a138-b0b4a6b6948d'
const password = '84m4vFy9mo4QLcnSWB1xDtFOYeSah9fZ'
var urlencodedParser = bodyParser.urlencoded({ extended: true});
var accountId;
var workflowId;
var d;

const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');

// your callback gets executed automatically once the data is received
var callback = (data, error) => {
    // consume data
    if (error) {
        console.error(error);
    }
    //if(typeof data != undefined){
        d = data
        console.log(d.data);
    //}
};

function request(retries, callback) {
     axios.get("https://retrieval.amer-1.jumio.ai/api/v1/accounts/"+accountId+"/workflow-executions/"+workflowId, {
        headers: {
            'Authorization': `Basic ${token}`
        }
    })
    .then(response => {
        // request successful

        if(typeof response.data != 'undefined') {
            // server done, deliver data to script to consume
            //console.log('request success ' + callback(response));
            callback(response)
         }
        else {
            // server not done yet
            // retry, if any retries left
            if (retries > 0) {
                request(--retries, callback);
            }
            else {
                // no retries left, calling callback with error
                callback([], "out of retries");
            }
        }
    }).catch(error => {
        // ajax error occurred
        // would be better to not retry on 404, 500 and other unrecoverable HTTP errors
        // retry, if any retries left
        if (retries > 0) {
            request(--retries, callback);
        }
        else {
            // no retries left, calling callback with error
            callback([], error);
        }
    });
}

app.use('/review', (req, res, next) => {
    res.send(JSON.stringify(d));
    next();
});

app.get('/review', (req, res) => {
    //res.sendFile(__dirname + '/views/review.html');

        request(20, callback);
    
    //res.send(request(1000, callback));
    
    // const response = await axios.get(
    //     "https://retrieval.amer-1.jumio.ai/api/v1/accounts/"+accountId+"/workflow-executions/"+workflowId, {
    //         headers: {
    //         'Authorization': `Basic ${token}`
    //     }
    // })
    // .then(function(response){
    //     if(response.data.decision.type=='PASSED'){
    //         const data = {
    //             'accountId:': accountId,
    //             'workflowExecutionId': workflowId,
    //             'firstName': response.data.capabilities.extraction[0].data.firstName,
    //             'lastName': response.data.capabilities.extraction[0].data.lastName,
    //             'address': response.data.capabilities.extraction[0].data.address.line1,
    //         }    
    //     } else {
    //         const data = 'ID was REJECTED'
    //     }
    
    //     res.send(data);
    // });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/register.html');
});

app.post('/', urlencodedParser, async(req, ress) => {
    // const docData = {
    //     'merchantScanReference': "EY-DOC",
    //     'customerId': 'Duncan',
    //     'type': 'BS',
    //     'country': 'USA',
    //     'success':'/review'
    // }

    // const response = await axios.post(
    //     "https://upload.netverify.com/api/netverify/v2/acquisitions", docData, {
    //         headers: {
    //             'Authorization': `Basic ${token}`
    //         }
    //     }
    // )
    // .then(function (response) {
    //     var tinyDocUrl;
    //     var datax = {
    //         "customerInternalReference": "EY-ID",
    //         "workflowDefinition": {
    //           "key": 10031
    //         },
    //         "web": {
    //             "successUrl": tinyDocUrl
    //         }
    //     }
    //     tinyurl.shorten(response.data.clientRedirectUrl, async function(res, err){
    //         datax.web.successUrl = res
    //         const response = await axios.post(
    //             "https://account.amer-1.jumio.ai/api/v1/accounts", datax, {
    //                 headers: {
    //                 'Authorization': `Basic ${token}`
    //             }
    //         });

    //         accountId = response.data.account.id;
    //         workflowId = response.data.workflowExecution.id;

    //         const logger = `<script>function receiveMessage(event) {
    //             var data = window.JSON.parse(event.data);
    //             console.log('Netverify Web was loaded in an iframe.');
    //             console.log('auth token:', data.authorizationToken);
    //             console.log('transaction reference:', data.transactionReference);
    //             console.log('customer internal reference:', data.customerInternalReference);
    //             console.log('event type:', data.eventType);
    //             console.log('date-time:', data.dateTime);
    //             console.log('event value:', data.payload.value);
    //             console.log('event metainfo:', data.payload.metainfo);
    //             if((data.customerInternalReference == 'EY-DOC')&&(data.payload.value == 'success')){
    //                 window.parent.location.href = '/review';
    //             }
    //         }
    //         window.addEventListener("message", receiveMessage, false);</script>`;
    //         ress.send(logger + "<iframe src='"+response.data.web.href+"' width='50%' height='90%' allow='camera;fullscreen;accelerometer;gyroscope;magnetometer' allowfullscreen></iframe>")        
    //     })   
    // })


    var datax = {
        "customerInternalReference": "EY-ID",
        "workflowDefinition": {
          "key": 10031
        }
    }
    const response = await axios.post(
        "https://account.amer-1.jumio.ai/api/v1/accounts", datax, {
            headers: {
            'Authorization': `Basic ${token}`
        }
    });

    accountId = response.data.account.id;
    workflowId = response.data.workflowExecution.id;

    const logger = `<script>function receiveMessage(event) {
        var data = window.JSON.parse(event.data);
        console.log('Netverify Web was loaded in an iframe.');
        console.log('auth token:', data.authorizationToken);
        console.log('transaction reference:', data.transactionReference);
        console.log('customer internal reference:', data.customerInternalReference);
        console.log('event type:', data.eventType);
        console.log('date-time:', data.dateTime);
        console.log('event value:', data.payload.value);
        console.log('event metainfo:', data.payload.metainfo);
        if((data.customerInternalReference == 'EY-ID')&&(data.payload.value == 'success')){
            window.parent.location.href = '/review';
        }
    }
    window.addEventListener("message", receiveMessage, false);</script>`;
    ress.send(logger + "<iframe src='"+response.data.web.href+"' width='50%' height='90%' allow='camera;fullscreen;accelerometer;gyroscope;magnetometer' allowfullscreen></iframe>")        
});   



    // const response = await axios.post(
    //     "https://account.amer-1.jumio.ai/api/v1/accounts", datax, {
    //         headers: {
    //         'Authorization': `Basic ${token}`
    //     }
    // });
    // ress.send("<iframe src='"+response.data.web.href+"' width=500 height=600></iframe>")        
//})


// app.get("/test", async (req, res) => {
//     try {

//         const response = await axios.post("https://account.amer-1.jumio.ai/api/v1/accounts", datax, {
//         //const response = await axios.post("https://account.amer-1.jumio.ai/api/v1/accounts", req.body, {
//                 headers: {
//                 'Authorization': `Basic ${token}`
//             }
//         });
//         res.send("<iframe src='"+response.data.web.href+"' width=500 height=500></iframe>")
//     }
//     catch (err) {
//         console.log(err);
//     }
// })

// app.post('*', (req, res) => {
//     res.status(500).json({ message: "error "})
// })

//https://account.amer-1.jumio.ai/api/v1/accounts
// app.post('/getAPIResponse', function (req, res) {
//     var data = req.body;
//     api_helper.make_API_call('https://jsonplaceholder.typicode.com/todos/1')
//     .then(response => {
//         res.json(response)
//     })
//     .catch(error => {
//         res.send(error)
//     })
// });

app.listen(port, () => console.log(`App listening on port ${port}!`));