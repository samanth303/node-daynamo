const express = require("express");
const { v4 = uuid_v4 } = require('uuid');
const router = express.Router();
const AWS = require("aws-sdk");
const { response } = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
AWS.config.update({
    region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
// const QueryCommand = new AWS.QueryCommand();
const tableName = 'Event-oi2k73gcyff25pfxahg5qttbjm-staging'
// const eventtableName = 'Event-oi2k73gcyff25pfxahg5qttbjm-staging'
const movieTable = 'MoviesAndActors'
// console.log(v4())
const adminGSI = {
    ScanIndexForward: false,
    IndexName: 'GSIPK-Admin',
    KeyConditionExpression: '#GSIPK = :GSIPK',
    ExpressionAttributeValues: {
    },
    ExpressionAttributeNames: {
      '#GSIPK': 'GSIPK',
    },
  };
router.post('/create', async (req,res)=>{
    let pk = 'BIZ'
    let GSIPK = 'ADMIN-'
    let body = req.body;
    body.id = v4();
    body.pk = pk + body.id;
    body.GSIPK = GSIPK + pk;
    body.GSISK = GSIPK + pk + body.id;
    body.business_name;
    // console.log(body, 'body');
    const params = {
        TableName: tableName,
        IndexName:adminGSI,
        Item: body
    }
    console.log(params.IndexName)
    await dynamodb.put(params).promise().then(()=>{
        const result = {
            Operation: 'SAVE',
            Message: 'Success',
            Item: body
        }
        res.json({data:result})
    },error=>{
        console.error(error)
        res.status(500).send(error)
    }
    )
})


router.get('/all', async (req,res)=>{
    const params = {
        TableName:tableName,
        KeyConditionExpression:'pk = :pk',
        ExpressionAttributeValues:{
        ':pk':'EVE-AD'
        }
        }
        // console.log(params)
        try {
            const result = await dynamodb.query(params).promise()
                // console.log(result.Items)
                return res.json({data:result.Items})
            
        } catch (error) {
             res.send(error)
        }
    })

router.get('/allitems', async (req,res)=>{
    const params = {
        TableName: tableName,
        IndexName:adminGSI.IndexName,
        KeyConditionExpression:'GSIPK = :pk',
        ExpressionAttributeValues:{
        ':pk':'ADMIN-BIZ'
        },
        ProjectionExpression: '#id, #business_name',
        ExpressionAttributeNames: {
        '#id': 'id',
        '#business_name':'business_name'
      },
        }
        // console.log(params.ExpressionAttributeValues,'ExpressionAttributeValues')
        // console.log(params.KeyConditionExpression,'KeyConditionExpression')
        try {
            const result = await dynamodb.query(params).promise()
                // console.log(result.Items)
                return res.json({data:result.Items})
            
        } catch (error) {
             res.send(error)
        }
    })
router.patch('/',async (req,res)=>{
    const params={
        TableName:tableName,
        Key:{
            'id':req.body.infoid
        },
        UpdateExpression:`set ${req.body.updateKey} = :value`,
        ExpressionAttributeValues:{
            ':value':req.body.updateValue
        },
        ReturnValues:'UPDATED_NEW'
    }
    await dynamodb.update(params).promise().then(response=>{
        console.log(response)
        const body = {
            Operation: 'UPDATE',
            Message: 'SUCCESS',
            UpdatedAttributes: response
        }
        res.json(body)
    },error=>{
        console.error(error)
        res.status(500).send(error)
    })

} )

router.delete('/', async(req,res)=>{
    const params = {
        TableName: tableName,
        Key:{
            'id':req.query.infoid
        },
        ReturnValues: 'ALL_OLD'

    }
    await dynamodb.delete(params).promise().then(response=>{
        const body = {
            Operation:"DELETE",
            Message:"Success",
            Item:response
        }
        res.json({data:body})

    },error=>{
        console.error(error)
        res.status(500).send(error)
    })

})

router.get('/', async (req,res)=>{
const params = {
    TableName: tableName,
    Key:{
        'id':req.query.infoid
    }
}
// console.log(params, 'params');
await dynamodb.get(params).promise().then(response=>{
    res.json(response.Item)
},error=>{
    res.status(500).send(error)
})

})



module.exports = router;