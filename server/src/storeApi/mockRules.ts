import {
    DTYPE_SIMPLE_DISCOUNT_PRECENTAGE, PTYPE_COMPLEX, PTYPE_SIMPLE_MAX_PRODUCT,
    PTYPE_SIMPLE_MIN_PRODUCT
} from "../consts";
const uuidv4 = require('uuid/v4');

export const  mockSaleRules = [{
    name:"sale1",
    id:'1123',
    condition:{
        id:'11',
        type:PTYPE_SIMPLE_MAX_PRODUCT,
        productId:'123',
        amount:5,
        displayText:'At most 5 cucambers'
    },
    discounts:[
        {
            id:'21332bgg1',
            type: DTYPE_SIMPLE_DISCOUNT_PRECENTAGE,
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
        type:PTYPE_SIMPLE_MAX_PRODUCT,
        productId:'gfdg123',
        amount:5,
        displayText:'At most 5 cucambers'
    },
    discounts:[
        {
            id:'21fdg33fdsfsdf21',
            type: DTYPE_SIMPLE_DISCOUNT_PRECENTAGE,
            percentage:10,
            products:[{id:'213123',name:'tomato'},{id:'312313',name:'cucamber'},{id:'2131fdfs23',name:'pizza'}],
            displayText:'on the following products 10% discount.'
        }
    ]
}
];

export const mockSimpleSaleRule = function (productId, productName) {
    const result = {
        name:"sale1",
        id:'1123',
        condition:{
            id:'11',
            type:PTYPE_SIMPLE_MIN_PRODUCT,
            productId:productId,
            amount:5,
            displayText:'At most 5 cucambers'
        },
        discounts:[
            {
                id:'21332bgg1',
                type: DTYPE_SIMPLE_DISCOUNT_PRECENTAGE,
                percentage:15,
                products:[{id:productId,name:productName}],
                displayText:'on the following products 15% discount.'
            }
        ]
    };

    return result;
};

export const mockSimplePurchaseRule = function (prodId) {
    const result = {
        name:"pRule1",
        id:'1',
        condition:{
            id:'11',
            type:PTYPE_SIMPLE_MIN_PRODUCT,
            productId:prodId,
            amount:2,
            displayText:'At LEAST 2 from prod'
        }
    };

    return result;
};

export const mockComplexPurchaseRules = function (prodId1, prodId2) {
    const result = [{
        name:"rule1",
        id:'1',
        condition:{
            id:'11',
            type:PTYPE_SIMPLE_MIN_PRODUCT,
            productId:prodId1,
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
                    type:PTYPE_COMPLEX,
                    bin_op:'and',
                    op1:{
                        parentId:'2321321313',
                        id:'2321332132',
                        type:PTYPE_SIMPLE_MIN_PRODUCT,
                        productId:prodId1,
                        amount:5,
                        displayText:'At most 5 tomatos'
                    },
                    op2:{
                        parentId:'2321321313',
                        id:'23213213',
                        type:PTYPE_SIMPLE_MIN_PRODUCT,
                        productId:prodId2,
                        amount:5,
                        displayText:'At most 5 tomatos'
                    },
                    displayText:'At least one'
                }
        }]

    return result;
};

export const mockPurchaseRules = [{
    name:"rule1",
    id:'1',
    condition:{
        id:'11',
        type:PTYPE_SIMPLE_MAX_PRODUCT,
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
        type:PTYPE_COMPLEX,
        bin_op:'or',
        op1:{
            parentId:'2321321313',
            id:'2321332132',
            type:PTYPE_SIMPLE_MAX_PRODUCT,
            productId:'12321334',
            amount:5,
            displayText:'At most 5 tomatos'
            },
        op2:{
            parentId:'2321321313',
            id:'23213213',
            type:PTYPE_SIMPLE_MAX_PRODUCT,
            productId:'13213234',
            amount:5,
            displayText:'At most 5 tomatos'
            },
        displayText:'At least one'
        }
}];

export const updateSaleIds = (rule) => {
    rule.id = uuidv4();
    updateCondIds(rule.condition);
    updateDiscounts(rule.discounts);
}
export const updateDiscounts = (discounts) => {
    discounts.forEach(disc => disc.id = uuidv4());
}

export const updateCondIds = (condition) => {
    condition.id = uuidv4();
    if(condition.type === PTYPE_COMPLEX){
        updateCondIds(condition.op1);
        updateCondIds(condition.op2);
    }
};



export const findSaleRelevantProduct = (productId) => {
    return mockSaleRules.filter(isSaleRelevant(productId));
}

const isSaleRelevant = (productId) => (sale) => {
    return sale.discounts.some(discount=>
        discount.products.some(product => product.id === productId)
    )
}

export const findRuleRelevantProduct = (productId) => {
    return mockPurchaseRules.filter(isRuleRelevant(productId));
}
const isRuleRelevant = (productId) => (rule) => {
    return isCondRelevant(rule.condition,productId);
}

const isCondRelevant = (cond,productId) => {
    if(cond.type === PTYPE_COMPLEX)
        return isCondRelevant(cond.op1,productId) || isCondRelevant(cond.op2,productId);
    else{
        return cond.product && cond.product === productId;
    }
}