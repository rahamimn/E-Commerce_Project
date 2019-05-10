
export const  mockSaleRules = [{
    name:"sale1",
    id:'1123',
    condition:{
        id:'11',
        type:'simple-max-amount-product',
        productId:'123',
        amount:5,
        displayText:'At most 5 cucambers'
    },
    discounts:[
        {
            id:'21332bgg1',
            type: 'discountPercentage',
            percentage:15,
            products:[{id:'2131435f23',name:'tomato'},{id:'3145352313',name:'cucamber'}],
            displayText:'on the following products 15% discount.'
        }
    ]
},
{
    name:"sale2",
    id:'112gdfg3',
    condition:{
        id:'1dasda1',
        type:'simple-max-amount-product',
        productId:'gfdg123',
        amount:5,
        displayText:'At most 5 cucambers'
    },
    discounts:[
        {
            id:'21fdg33fdsfsdf21',
            type: 'discountPercentage',
            percentage:10,
            products:[{id:'213123',name:'tomato'},{id:'312313',name:'cucamber'},{id:'2131fdfs23',name:'pizza'}],
            displayText:'on the following products 10% discount.'
        }
    ]
}
];

export const mockPurchaseRules = [{
    name:"rule1",
    id:'1',
    condition:{
        id:'11',
        type:'simple-max-amount-product',
        productId:'123',
        amount:5,
        displayText:'At most 5 cucambers'
        }
    },
    {
    name:"rule2",
    id:'2342222s',
    condition:
        {
        id:'2321321313',
        type:'complex',
        bin_op:'or',
        op1:{
            parentId:'2321321313',
            id:'2321332132',
            type:'simple-max-amount-product',
            productId:'12321334',
            amount:5,
            displayText:'At most 5 tomatos'
            },
        op2:{
            parentId:'2321321313',
            id:'23213213',
            type:'simple-max-amount-product',
            productId:'13213234',
            amount:5,
            displayText:'At most 5 tomatos'
            },
        displayText:'At least one'
        }
}];

export let id = 900;
export const updateIds = (rule) => {
    rule.id =`aaa${id++}`;
    updateCondIds(rule.condition);

}

export const updateCondIds = (condition) => {
    condition.id =`aaa${id++}`;
    if(condition.type === 'complex'){
        updateIds(condition.op1);
        updateIds(condition.op2);
    }
}

export const deletePurchaseRuleMock = (id) => {
    for(let i = 0 ; i <mockPurchaseRules.length ; i++ ){
        if(mockPurchaseRules[i].id === id){
            mockPurchaseRules.splice(i,1);
            break;
        }
    }
}