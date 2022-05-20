const express = require('express');
const axios = require('axios');
var bodyParser = require('body-parser');
const tinyurl = require('tinyurl');
const app = express();
const port = 3000;
const username = '9a027270-de91-4b96-a694-f8abe60ee937';
const password = 'yHGnFpj8Rr0YRUabzDOasBWvVoaprDkR';
const platform = 'amer-1.jumio.ai';
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

app.use(express.static(__dirname + '/public'));

app.use('/review', (req, res, next) => {
    res.send(JSON.stringify(d));
    next();
});


app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
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
    res.sendFile(__dirname + '/views/start.html');
});

 function delWF(accID, wfID) {
    var done = false;
    var response;

    //do{
         response =   axios.delete(`https://retrieval.amer-1.jumio.ai/api/v1/accounts/${accID}/workflow-executions/${wfID}`,{
            headers: {
                'Authorization': `Basic ${token}`,
                'Accept': 'application/json',
                'User-Agent': 'Jumio JPMCShowcase/v1.0',
           }        
        });
    //     if(typeof(response.data) != 'undefined'){
    //         if(response.data.status != 412){
    //             done = true
    //         }

    //     }
    // }while(!done)
}


app.get('/complete', async (req, res) => {
    const accID = req.query.accountId;
    const wfID = req.query.workflowExecutionId;

    //    delWF(accID, wfID)

    res.sendFile(__dirname + '/views/success.html')
   
});

app.post('/', urlencodedParser, async(req, ress) => {

    var datax = {
        "customerInternalReference": "JPMC",
        "workflowDefinition": {
          "key": 10011
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

    ress.redirect(response.data.web.href);        
});   


app.listen(port, () => console.log(`App listening on port ${port}!`));