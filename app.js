// Budget Controller (Module) - M: Model
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) this.percentage = Math.round((this.value / totalIncome) * 100);
        else this.percentage = -1;
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, desc, val) {
            var ID = (data.allItems[type].length > 0) ?
                data.allItems[type][data.allItems[type].length - 1].id + 1 :
                0;
            var newItem = (type === 'inc') ? new Income(ID, desc, val) : new Expense(ID, desc, val);

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (curent) { // return new array
                return curent.id;
            });

            index = ids.indexOf(id);
            // slice: create a copy
            // splice: delete element
            if (index !== -1) data.allItems[type].splice(index, 1);
        },

        calculateBudget: function () {
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else data.percentage = -1;
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calculatePercentage(data.totals.inc);
            });
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        getPercentages: function () {
            return data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
        }
    };
})();


// UI Controller - V: View
var UIController = (function () {

    var domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (type, number) {
        var numberSplit, int, dec;
        number = Math.abs(number).toFixed(2);

        numberSplit = number.split('.');
        int = numberSplit[0];
        dec = numberSplit[1];

        if (int.length > 3) int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);

        return ((type === 'inc') ? '+' : '-') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) callback(list[i], i);
    };

    // Public methods
    return {
        getInput: function () {
            return {
                type: document.querySelector(domStrings.inputType).value, // 'inc' or 'exp'
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var element, htmlTemplate, htmlRow;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = domStrings.incomeContainer;
                htmlTemplate = '<div class="item clearfix" id="inc-%id%"> <div class = "item__description"> %description%</div> <div class = "right clearfix"> <div class = "item__value">%value%</div> <div class = "item__delete"> <button class = "item__delete--btn"> <i class = "ion-ios-close-outline"> </i></button> </div> </div> </div>';
            } else {
                element = domStrings.expensesContainer;
                htmlTemplate = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class = "right clearfix"> <div class = "item__value">%value%</div> <div class="item__percentage">21 </div> <div class = "item__delete"> <button class = "item__delete--btn"> <i class = "ion-ios-close-outline"> </i></button> </div></div> </div>';
            }

            // Replace the placeholder text with thr actual data
            htmlRow = htmlTemplate.replace('%id%', obj.id);
            htmlRow = htmlRow.replace('%description%', obj.description);
            htmlRow = htmlRow.replace('%value%', formatNumber(type, obj.value));

            // Insert thr HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', htmlRow);
        },

        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
            var fieldsArray = Array.prototype.slice.call(fields); // Convert list to array
            fieldsArray.forEach(function (current) {
                current.value = '';
            });

            // Set the focus to the 1st element of the array
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget > 0 ? 'inc' : 'exp', obj.budget);
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber('inc', obj.totalInc);
            document.querySelector(domStrings.expensesLabel).textContent = formatNumber('exp', obj.totalExp);
            if (obj.percentage > 0) document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            else document.querySelector(domStrings.percentageLabel).textContent = '---';
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(domStrings.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {
                current.textContent = percentages[index] + '%';
                if (percentages[index] >= 0) current.textContent = percentages[index] + '%';
                else current.textContent = '---';
            });
        },

        displayDate: function () {
            var now, months, year, month;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                domStrings.inputType + ', ' +
                domStrings.inputDescription + ', ' +
                domStrings.inputValue
            );

            nodeListForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(domStrings.inputBtn).classList.toggle('red');
        },

        getDomStrings: function () {
            return domStrings;
        }
    };
})();


// Global App Controller - C: controller
var controller = (function (budgetCtrl, UICtrl) {
    var DOM = UICtrl.getDomStrings();

    var setupEventListeners = function () {
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) // Return/Enter Key
                ctrlAddItem();
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        // Calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        var budget = budgetCtrl.getBudget();

        // Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        // Calculate the percentages
        budgetCtrl.calculatePercentages();

        // read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        // Update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // Get the field input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // Clear the fields
            UICtrl.clearFields();

            // Calculate and update budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // id is: inc-# or exp-#
        if (itemId) { // exists
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            // Delete the item from the data structure
            budgetCtrl.deleteItem(type, id);

            // Delete the item from the UI
            UICtrl.deleteListItem(itemId);

            // Update and show the new budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            setupEventListeners();
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };
})(budgetController, UIController);

// Start Application
controller.init();
