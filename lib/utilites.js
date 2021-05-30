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

function dashToUnderscore(dashedEntity){
   let splited = dashedEntity.split('-')
   if (splited.length > 1){
       let underscored = splited.join('_')
       return underscored
   }
   return dashedEntity
}

function lastPathSegment(url){
    url = url.match(/\/([^\/]+)[\/]?$/)
    url = dashToUnderscore(url[1])
    return url
}

function deepArrayScan(array, search = 'RowDataPacket', result = []){
    
    if (Array.isArray(array)){ 
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

module.exports = {wordCleaner, lastPathSegment, deepArrayScan, dashToUnderscore};