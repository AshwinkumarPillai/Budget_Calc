let budgetController = (function(){
    
    let Expense = function(id,desc,val){
        this.id = id;
        this.desc = desc;
        this.val = val;
        this.percent = -1;
    };

    Expense.prototype.calcPercent = function(totalIncome){
        this.percent = (totalIncome > 0) ? Math.round((this.val / totalIncome) * 100) : -1;
    };

    Expense.prototype.getPercent = function(){
        return  this.percent;
    };

    let Income = function(id,desc,val){
        this.id = id;
        this.desc = desc;
        this.val = val;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percent: -1
    }

    let calcTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(ele => {
            sum += ele.val;
        });
        data.totals[type] = sum;
    }

    return {
        addItem: function(type, desc, val){
            let newItem,id,n = data.allItems[type].length;
            id = (n == 0) ? 0 : data.allItems[type][n-1].id + 1;
            if(type == "inc"){
                newItem = new Income(id,desc,val);
            }else{
                newItem = new Expense(id,desc,val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id){
            let ids = data.allItems[type].map(ele => {
                return ele.id;
            });
            let index = ids.indexOf(id);
            if(index != -1) data.allItems[type].splice(index,1);
            
        },
        calculateBudget: function(){
            calcTotal("exp");
            calcTotal("inc");
            data.budget = data.totals.inc - data.totals.exp;
            data.percent = (data.totals.inc > 0) ? Math.round((data.totals.exp / data.totals.inc) * 100) : -1;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalexp: data.totals.exp,
                percent: data.percent
            }
        },
        calcPercent: function(){
            data.allItems.exp.forEach(ele => {
                ele.calcPercent(data.totals.inc);
            });
        },
        getPercent: function(){
            let allPercent = data.allItems.exp.map(ele => {
                return ele.getPercent();
            });
            return allPercent;
        }
    };

})();

let UIController = (function(){
    let DOMClassesAndIds = {
        addType: '.add__type',
        addDesc: '.add__description',
        addVal: '.add__value',
        addBtn:'.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercent: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    
    let formatNumber =  function(num, type){
        num = Math.abs(num);
        num = num.toFixed(2);
        let numSplit = num.split('.');
        let int = numSplit[0];
        let dec = numSplit[1];
        if(int.length > 3){
            int  = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
        }
        return ((type == 'exp') ? '-' : '+') +' '+ int + '.' + dec;           
    }

    let nodeListForeach = function(list,callback){
        for(let i=0;i<list.length;i++){
            callback(list[i],i);
        }
    }

    return {
        getUserInput: function(){
            return {
                type: document.querySelector(DOMClassesAndIds.addType).value,
                desc: document.querySelector(DOMClassesAndIds.addDesc).value,
                val: parseFloat(document.querySelector(DOMClassesAndIds.addVal).value)
            }
        },
        addListItem: function(obj,type){
            let html,placeHolder,element;
            if(type == 'inc'){
                element = DOMClassesAndIds.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type == 'exp'){
                element = DOMClassesAndIds.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            placeHolder = html.replace('%id%',obj.id);
            placeHolder = placeHolder.replace('%desc%',obj.desc);
            placeHolder = placeHolder.replace('%val%',formatNumber(obj.val,type));
            document.querySelector(element).insertAdjacentHTML('beforeend',placeHolder);
        },
        deleteListItem: function(selectorId){
            let ele = document.getElementById(selectorId)
            ele.parentNode.removeChild(ele);

        },
        clearFields: function(){
            let fields = document.querySelectorAll(DOMClassesAndIds.addDesc + ', ' + DOMClassesAndIds.addVal);
            let fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(ele => {
                ele.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            let type = (obj.budget >= 0) ? 'inc' : 'exp';
            document.querySelector(DOMClassesAndIds.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMClassesAndIds.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMClassesAndIds.expensesLabel).textContent = formatNumber(obj.totalexp, 'exp');
            document.querySelector(DOMClassesAndIds.percentLabel).textContent = (obj.percent > 0) ? (obj.percent + '%'): '---';
        },
        displayPercent: function(percentages){
            let fields = document.querySelectorAll(DOMClassesAndIds.expensesPercent);
            
            nodeListForeach(fields,function(element, index){
                element.textContent = (percentages[index] > 0) ? (percentages[index] + '%') : '---';
            });
        },
        displayMonth: function(){
            let now = new Date();
            let year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', ' July', 'August', 'September', 'October', 'November', 'December'];
            let month = now.getMonth();
            document.querySelector(DOMClassesAndIds.dateLabel).textContent = months[month] + ' ' + year;

        },
        changedType: function(){
            let fields = document.querySelectorAll(DOMClassesAndIds.addType + ',' + DOMClassesAndIds.addDesc + ',' + DOMClassesAndIds.addVal);
            nodeListForeach(fields, function(node){
                node.classList.toggle('red-focus');
            })
            document.querySelector(DOMClassesAndIds.addBtn).classList.toggle('red');
        },
        getDOMClassesAndIds: function(){
            return DOMClassesAndIds;
        }
    };  
})();

let controller  = (function(budgetCtrl, UICtrl){
    
    let setUpEventListener = function(){
        let DOMStrings = UICtrl.getDOMClassesAndIds();
        
        document.querySelector(DOMStrings.addBtn).addEventListener('click',ctrlAddItem);
        
        document.addEventListener('keypress',function(e){
            if(e.key == "Enter" || e.which == 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOMStrings.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOMStrings.addType).addEventListener('change',UICtrl.changedType);
    }

    let updateBudget = function(){
        budgetCtrl.calculateBudget();
        let budget = budgetCtrl.getBudget();
        UIController.displayBudget(budget);
    }

    let ctrlAddItem = function(){
        let userinp,newItem;
        userinp = UIController.getUserInput();
        if(userinp.desc !== "" && !isNaN(userinp.val) && userinp.val > 0){
            newItem = budgetCtrl.addItem(userinp.type,userinp.desc,userinp.val);
            UICtrl.addListItem(newItem,userinp.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercent();

        }
    }

    let ctrlDeleteItem = function(e){
        let itemId =  e.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            let splitId = itemId.split('-');
            let type = splitId[0];
            let id = parseInt(splitId[1]);
            budgetCtrl.deleteItem(type,id);
            UICtrl.deleteListItem(itemId);
            updateBudget();
            updatePercent();
        }
    }

    let updatePercent = function(){
        budgetCtrl.calcPercent();
        let percent = budgetCtrl.getPercent();
        UICtrl.displayPercent(percent);
    }

    return {
        init: function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({budget: 0, totalInc: 0, totalexp: 0, percent: 0});
            setUpEventListener();
        }
    }
})(budgetController,UIController);

controller.init();