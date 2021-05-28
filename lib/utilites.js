function wordCleaner(word){
    try{
        if (word == '') {
            throw new Error('Empty string')
        }
        return word.toString().toLowerCase().replace(/ /g,'')
    } catch (err) {
        console.log("Please, enter word")
    }
    
}



function getQueryResult(result){
    return Object.values(result[1][0])[0]
}

function deepArrayScan(array, search = 'RowDataPacket', result = []){
    
    if (Array.isArray(array)){
        console.log('I am try')
        
        array.forEach(row => {
            if (row.constructor.name == search) {
                result.push(Object.values(row));
            } 
            if (row.constructor.name == 'Array') deepArrayScan(row, search, result)
        });
    
        return result;
    } else {
        return array
    }
}


module.exports = {wordCleaner, getQueryResult, deepArrayScan};