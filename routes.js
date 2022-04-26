const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const { Route53Resolver } = require("aws-sdk");
const { response } = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");

AWS.config.update({
    region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = 'info-movie'


router.post('/create', async (req,res)=>{
    const params = {
        TableName: tableName,
        Item: req.body
    }
    await dynamodb.put(params).promise().then(()=>{
        const body = {
            Operation: 'SAVE',
            Message: 'Success',
            Item: req.body
        }
        res.json({data:body})
    },error=>{
        console.error(error)
        res.status(500).send(error)
    }
    )
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
router.get('/all', async (req,res)=>{
    const params = {
        TableName: tableName
    }
    try {
        const allInfo = await scanDynamoDBRecords(params, [])
        const body = {
            info:allInfo
        } 
        res.json({data:body})
    } catch (error) {
        console.error('Error', error)
        res.status(500).send(error)
    }
})

const scanDynamoDBRecords = async (scanParams, itemArray)=>{

    try {
        const DynamoDBdata = await dynamodb.scan(scanParams).promise(); 
        itemArray = itemArray.concat(DynamoDBdata.Items)
        if (DynamoDBdata.LastEvaluatedKey) {
            scanParams.ExclusiveStartKey = DynamoDBdata.LastEvaluatedKey;
            return await scanDynamoDBRecords(scanParams,itemArray)
        }
        return itemArray;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = router;