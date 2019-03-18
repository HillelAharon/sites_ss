import initActions from './action'
import initHot from './hot'

const HOT_ATTR_TO_STR = ['_id','name','address','type','serialNumber','phone','qrCode'];
  
let displayedData = [], onChangeAttrArr = [], consoleOn = false;

window.onload = () => {
  const actionFuncs = [updateSites, deleteSites, loadAllSites, loadSitesById, clearSites, downloadCsv];
  initActions(actionFuncs);
  // initConsole();
  const hot = initHot();

  // hot.onChange .... updatechangedvalues
  // hot.

}

function updateSites(){
  swalConfirm('You are about to change the database')
  .then((willUpdate) => {
    if (willUpdate) {
      fetch(`/sites/multi_update`,{
        method:'PUT', 
        body: JSON.stringify(onChangeAttrArr),
        credentials: 'include'
      })
      .then((res) => {
        if (!res.ok)
          throw res;
        return res.json();
      })
      .then(respData => {// <---- decide what to do!
        console.log('do something with respData');
      });
    } else {
      swal("data update aborted");
    }    
  });
}

function deleteSites(){
  const sitesOnDelete = getOnDeleteFromHot();
  if(sitesOnDelete.length > 0) {
    const warningStr = getOnDeleteWarning(sitesOnDelete);
    swalConfirm(warningStr)
    .then(( willDelete ) => {
      if ( willDelete ) {
        fetch('/sites/multi_update', {
          method: 'PUT',
          body: JSON.stringify(sitesOnDelete),
          credentials: 'include'
        })
        .then((res) => {
          if (!res.ok)
            throw res;
          return res.json();
        })
        .then(idsNotFound => {
          idsNotFound.length === 0 ? consoleMsg('data updated','msg') : consoleMsg(`error: Ids ${idsNotFound} not found`,'err');
        });
      } else {
        swal("deletion aborted");
        restoreDataFromDisplayedData();
      }
    })
  } else {
    consoleMsg('please choose values to delete first','help');
  }
}

function loadAllSites(){
  fetch('/sites', {
    method:'GET',
    credentials: 'include'
  })
  .then((res) => {
    if (!res.ok) 
        throw res;
    return res.json();
  })
  .then( sites => {
    loadDataToHotAndConsole(sites, 'data loaded');
  });
}

function loadSitesById(){
  const sitesIdToLoad = getIdDifferenceDisplayedAndHot();
  if( validateIdInitBeforeLoad() ){
    if( sitesIdToLoad.length > 0 ) {
      const queryStr = `/sites?ids=[${sitesIdToLoad}]`;
      fetch(queryStr, {
        method: 'GET',
        credentials: 'include'
      })
      .then((res) => {
        if (!res.ok)
          throw res;
        return res.json();
      })
      .then( data => {
        pushNewDataToHotAndConsole(data.sites, data.idsNotFound)// <-- needs to update server response, add idsFound?
      });                               
    } else {
      restoreDataFromDisplayedData();
      consoleMsg(`error: all searched ids apear on table`,'err');
    }
  } 
}

function clearSites() {
  if( isTableEmpty() ) {
    consoleMsg('no data on table amigo','help');
  } else {
    swalConfirm('changes will not be saved\nwould you like to continue?')
    .then((willClear) => {
      if (willClear) {
        loadDataToHotAndConsole([],'data cleared')
      }       
    });
  }
}

function downloadCsv(){
  hot.getPlugin('exportFile').downloadFile('csv', {
    bom: false,
    columnDelimiter: ',',
    columnHeaders: false,
    exportHiddenColumns: true,
    exportHiddenRows: true,
    fileExtension: 'csv',
    filename: 'Handsontable-CSV-file_[YYYY]-[MM]-[DD]',
    mimeType: 'text/csv',
    rowDelimiter: '\r\n',
    rowHeaders: true
  });
}

function addToOnChangeArr(_id, _attr, oldVal, newVal){
  if(_attr !== '_id' && newVal !== '' && !isNaN(_id)){
    const i = onChangeAttrArr.findIndex(obj => obj.id === parseInt(_id));   
    if( i !== -1 ){
      onChangeAttrArr[i].attr[_attr] = newVal;
    } else {
      let attrOnChange = {};
      attrOnChange[_attr] = newVal;
      onChangeAttrArr.push({id: parseInt(_id) , attr : attrOnChange });
    }
  }
}

function getOnDeleteFromHot(){
  const selected = hot.getSelected();
  let onDelete = [];
  
  for (let index = 0; index < selected.length; index++) {
    const item = selected[index];
    const startRow = Math.min(item[0], item[2]);
    const endRow = Math.max(item[0], item[2]);
    const startCol = Math.min(item[1], item[3]);
    const endCol = Math.max(item[1], item[3]);

    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
      for (let columnIndex = startCol; columnIndex <= endCol; columnIndex++) {
        let rowId = parseInt(hot.getSourceDataAtCell(rowIndex, 0));

        if(rowId >= 0) {
          if(HOT_ATTR_TO_STR[columnIndex] !== 'name') { 
            hot.setDataAtCell(rowIndex, columnIndex, '');
            const i = onDelete.findIndex(obj => obj.id === rowId);   
            if( i !== -1 ) {
              onDelete[i].attr[HOT_ATTR_TO_STR[columnIndex]] = "";
            } else {
              let attrOnDelete = {};
              attrOnDelete[HOT_ATTR_TO_STR[columnIndex]] = "";
              onDelete.push({id: rowId , attr : attrOnDelete });
            }
          } else {
            consoleMsg('error: `Name` is required if added','err');
          }
        } 
      }
    }
    return onDelete;
  }
}

function loadDataToHotAndConsole(sites,msg){
  hot.loadData(sites);
  displayedData = copy(sites);
  onChangeAttrArr = [];
  if( sites.length > 0 ) displayedData.pop(); // <--- y comes back with undefined?
  consoleMsg(msg, 'msg');
}

function getIdDifferenceDisplayedAndHot() {
  let _difference = new Set(hot.getDataAtCol(0).slice(0,-1).map(id => parseInt(id)));
  for (let elem of displayedData.map(site => site._id)) 
      _difference.delete(elem);
  return copy(Array.from(_difference));
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
    icon: "warning",
    buttons: true,
    dangerMode: true,
  });
}

function pushNewDataToHotAndConsole(sitesArr, idsNotFound) {
  displayedData.push(sitesArr);
  hot.loadData(copy(displayedData));
  if( idsNotFound.length === 0 ) consoleMsg('data updated','msg');
  else if( idsNotFound.length === 1 ) consoleMsg(`error: site id ${idsNotFound} not found`,'err');
  else consoleMsg( `error: sites ids' ${idsNotFound} not found`,'err' );
}

function restoreDataFromDisplayed(){ hot.loadData(copy(displayedData)); }

function validateIdInitBeforeLoad() {
  if (hot.getData().filter(site => site[0] !== null).length !== 0){
    consoleMsg('please insert id first','help');
    return false;
  }
  return true;
}

function isTableEmpty(){ return hot.getData().length === 1 && hot.getData()[0].filter(attr => attr !== null).length === 0; }
