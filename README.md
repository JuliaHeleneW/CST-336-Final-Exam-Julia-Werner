Part 1: CST 336, Final Exam, Julia Werner

##### Question #1: What is the difference between the slice and splice method of JavaScript’s Arrays? Please give an example.

The function slice and splice both aim to get a fraction of an array, but they function differently:

The function `slice` doesn't change the original array the function is called on. The fractional part of the array will start at the point indicated by the start index. It takes in 2 input arguments:
* start (optional): the starting index for slicing the array. This will determine where to start the fractional part of the array. If no start is given, this will be 0.
* end (optional): the index where the slicing should end. Note that the ending index is not included.

Example:
``` javascript
var array=[2,3,4,5,6,7];
console.log(array.slice()); //this will print [2,3,4,5,6,7]
console.log(array.slice(2,4)); //this will print [4,5]
console.log(array.slice(2)); //this will print [4,5,6,7]
console.log(array); //this will print [2,3,4,5,6,7]
```

In contrast to slice, the function `splice` does change the original array the function is called on, and it can also add to the array, which slice can't. While slice starts its fraction at the start index, splice starts removing or adding at the start index. It takes in 1 to N input arguments:
* start (required): the starting index at which to start adding or removing items
* howmany (optional): the number of items to be removed, starting at start. If howmany is 0, no items are removed.
* item1...itemN (optional): Items to be added to the array at index start. If howmany is not 0, the value removal will happen before the items are added.

Example:
``` javascript
var array = ["Carrot","Tomato","Cucumber","Broccoli"];
array.splice(3); //array will be ["Carrot","Tomato","Cucumber"]
array.splice(2,1); //array will be ["Carrot","Tomato"]
array.splice(1,0); //array will be ["Carrot","Tomato"], since no items are removed
array.splice(1,0,"Bell Peppers"); //array will be ["Carrot","Bell Peppers","Tomato"]
array.splice(1,1,"Cauliflower"); //array will be ["Carrot","Cauliflower","Tomato"]
console.log(array); //this will print ["Carrot","Cauliflower","Tomato"]
```

##### Question #2:
##### a. Explain 3 states of a Promise.

* **Pending:** pending is the initial state of a promise that it starts with. The state of the promise is pending until it is either successful or unsuccessful(resolve or reject). Example: waiting for the result of an API call.
* **Resolve:** resolve is the state of a promise, when an operation is successful. When the state of a promise is resolve, whatever the goal of the promise was has been accomplished (e.g. successful API call).
* **Reject:** reject is the state of a promise, when an operation was unsuccessful. When the state of the promise is reject, it means that whatever the goal of the promise was has not been accomplished (e.g. API call failed).

##### b. What is Promise Chaining? Please give an example.
 Promise chaining means that the results of a promise are used as input for multiple .then() handlers. The way it works is that the original promise is resolved in the call to the promise itself and the outcome is passed to the first .then() handler. The output of this .then() handler is passed to the next .then() handler and so one. Note that all the .then() handler have to actually be chained to one and the same promise call and can't be part of multiple promise calls.
 
Example:
 
``` javascript
let promise = function(){
    return new Promise(function(resolve,reject){
       resolve(1);
    });
}

promise() //res is 1, so 1 is passed into first then handler
.then(function(res){console.log(res);return res*4;})//4
.then(function(res){console.log(res);return res*4;})//16
.then(function(res){console.log(res);return res*4;})//64  
```


##### Question #3:
##### What is CRUD? Please list all its functionalities, corresponding Express methods and SQL statements.

CRUD stands for the four basic functions that operate on a Database management system: create, read, update and delete. Each of them have their own functionalities:

**Create:** The functionality of create is to insert new data into the database.\
Express method: `app.post`\
SQL statement: \
`INSERT INTO tableName (field1, field2, …, fieldN) VALUES (value1, value2, …, valueN)`

**Read:** The functionality of read is to retrieve existing data, often to display them. There are lots of ways to display data, includincombining tables with common elements or conditions (the where part of a select statement).\
Express method: `app.get` \
SQL statement: \
`SELECT * FROM tableName [WHERE conditions]`

**Update:** The functionality of update is to update specific existing data, usually with a where condition for a specific ID or other where conditions. \
Express method: `app.put`\
SQL statement: \
`UPDATE tableName SET field1=value1, field2=value2, …, fieldN=valueN [WHERE conditions]`

**Delete:** The functionality of delete is to delete specific existing data based on where conditions, often an ID.\
Express method: `app.delete`\
SQL statement: \
`DELETE FROM tableName [WHERE conditions]`

##### Part 2 tasks attempted:
1,2,3,4,7,8,9,10,11,12,13,14
