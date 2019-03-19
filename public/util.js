
function getDifference(arr1,arr2) {
  let difference = new Set(arr1);
  for (let elem of arr2) 
      difference.delete(elem);
  return copy(Array.from(difference));
}

function getOnDeleteWarning(onDeleteArr){
  let confirmStr = 'you are about to delete:\n';
  for(let i = 0; i < onDeleteArr.length; i++)
    confirmStr = confirmStr.concat(`site id: ${onDeleteArr[i].id}-> attributes: ${Object.keys(onDeleteArr[i].attr).map(a => a + ' ')}\n`); 
  return confirmStr;
}

function copy(o) {
    var output, v, key;
    output = Array.isArray(o) ? [] : {};
    for (key in o) {
        v = o[key];
        output[key] = (typeof v === "object") ? copy(v) : v;
    }
    return output;
}

function swalConfirm(txt){
  return swal({
    title: "Are you sure?",
    text: txt,
    //icon: "warning",
    buttons: true,
    dangerMode: true,
  });
}

function validateIdInitBeforeLoad(table) {
  if (table.filter(site => site[0] !== null).length > 0) {
    return true;  
  }
  consoleMsg('please insert id first','help');
  return false;
}

function isTableEmpty(table) { 
  return table.length === 1 && table[0].filter(attr => attr !== null).length === 0; 
}

export { getDifference, getOnDeleteWarning, copy, swalConfirm, validateIdInitBeforeLoad, isTableEmpty }