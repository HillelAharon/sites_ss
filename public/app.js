import initActions from './action.js';
import initHot from './hot.js';
import initConsole from './console.js';
import { getDifference, getOnDeleteWarning, copy, swalConfirm, validateIdInitBeforeLoad, isTableEmpty } from './util.js'

const HOT_ATTR_TO_STR = ['_id','name','address','type','serialNumber','phone','qrCode'];
  
let displayedData = [], onChangeAttrArr = [], hot, consoleOn = false, consoleMsg;

window.onload = () => {
  const actionFuncs = [updateSites, deleteSites, loadAllSites, loadSitesById, clearSites, downloadCsv];
  initActions(actionFuncs);
  hot = initHot(addToOnChangeArr);
  consoleMsg = initConsole(consoleOn);
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
        restoreFromDisplayedData();
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
  .then( sites => loadDataToHotAndConsole(sites, 'data loaded'));
}

function loadSitesById(){
  const hotIdArr = hot.getDataAtCol(0).slice(0,-1).map(id => parseInt(id));
  const displayedDataIdArr = displayedData.map(site => site._id);
  const sitesIdToLoad = getDifference(hotIdArr,displayedDataIdArr);
  
  if( validateIdInitBeforeLoad(hot.getData()) ){
  
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
      .then( data => {// expected: data = { sites: [], idsFound: [], idsNotFound: [] }
        pushNewDataToHotAndConsole(data.sites, data.idsNotFound)
      });                               
    } else {
      restoreFromDisplayedData();
      consoleMsg(`error: all searched ids apear on table`,'err');
    }
  } 
}

function clearSites() {
  if( isTableEmpty(hot.getData()) ) {
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

function addToOnChangeArr(changes){
  if (changes) {
    changes.forEach(([row, prop, oldVal, newVal]) => {
      
      const onChangeSiteId = parseInt(prop === 'id' ?  oldVal : hot.getData()[row][0]);
      
      if(prop !== '_id' && newVal !== '' && !isNaN(onChangeSiteId)) {
        
        const i = onChangeAttrArr.findIndex(obj => obj.id === onChangeSiteId);   
        
        if( i !== -1 ){
          onChangeAttrArr[i].attr[prop] = newVal;
        } else {
          let attrOnChange = {};
          attrOnChange[prop] = newVal;
          onChangeAttrArr.push({ id: onChangeSiteId , attr : attrOnChange });
        }
      }   
    });
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

function pushNewDataToHotAndConsole(sitesArr, idsNotFound) {
  displayedData.push(...sitesArr);
  hot.loadData(copy(displayedData));
  if( idsNotFound.length === 0 ) consoleMsg('data updated','msg');
  else if( idsNotFound.length === 1 ) consoleMsg(`error: site id ${idsNotFound} not found`,'err');
  else consoleMsg( `error: sites ids' ${idsNotFound} not found`,'err' );
}

function restoreFromDisplayedData(){ 
  hot.loadData(copy(displayedData)); 
}

//-------------------------------util

// function getDifference(arr1,arr2) {
//   let difference = new Set(arr1);
//   for (elem of arr2) 
//       difference.delete(elem);
//   return copy(Array.from(difference));
// }

// function getOnDeleteWarning(onDeleteArr){
//   let confirmStr = 'you are about to delete:\n';
//   for(let i = 0; i < onDeleteArr.length; i++)
//     confirmStr = confirmStr.concat(`site id: ${onDeleteArr[i].id}-> attributes: ${Object.keys(onDeleteArr[i].attr).map(a => a + ' ')}\n`); 
//   return confirmStr;
// }

// function copy(o) {
//     var output, v, key;
//     output = Array.isArray(o) ? [] : {};
//     for (key in o) {
//         v = o[key];
//         output[key] = (typeof v === "object") ? copy(v) : v;
//     }
//     return output;
// }

// function swalConfirm(txt){
//   return swal({
//     title: "Are you sure?",
//     text: txt,
//     icon: "warning",
//     buttons: true,
//     dangerMode: true,
//   });
// }

// function validateIdInitBeforeLoad(table) {
//   if (table.filter(site => site[0] !== null).length > 0) {
//     return true;  
//   }
//   consoleMsg('please insert id first','help');
//   return false;
// }

// function isTableEmpty(table) { 
//   return table.length === 1 && table[0].filter(attr => attr !== null).length === 0; 
// }
