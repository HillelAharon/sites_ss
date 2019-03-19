import initActions from './action.js';
import initHot from './hot.js';
import initConsole from './console.js';
import { getDifference, getOnDeleteWarning, copy, swalConfirm, validateIdInitBeforeLoad, isTableEmpty } from './util.js';
//import { displayFilter, initCheckBox } from './filterCheckbox.js';

const HOT_ATTR_TO_STR = ['_id','name','address','type','serialNumber','phone','qrCode'];

let displayedData = [], onChangeAttrArr = [], hot, consoleOn = false, consoleMsg;

window.onload = () => {
  const actionFuncs = [updateSites, deleteSites, loadAllSites, loadSitesById, clearSites, downloadCsv, displayFilter];
  initActions(actionFuncs);
  hot = initHot(addToOnChangeArr);
  consoleMsg = initConsole(consoleOn);
  initCheckBox(); 
}

function updateSites(){
  if(onChangeAttrArr.length === 0){
    consoleMsg('nothing to update', 'help');
    return;
  }
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
      .then(data => {// expected: data = { idsUpdated: [], idsNotFound: [], attrErr: [] }
        data.idsNotFound.length === 0 ? consoleMsg('data updated','msg') : consoleMsg(`Ids ${data.idsNotFound} not found`,'err');
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
        .then(data => { // expected: data = { idsUpdated: [], idsNotFound: [], attrErr: [] }
          data.idsNotFound.length === 0 ? consoleMsg('data updated','msg') : consoleMsg(`Ids ${data.idsNotFound} not found`,'err');
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
 // filterColumns();
  fetch('/sites', {
    method:'GET',
    credentials: 'include'
  })
  .then((res) => {
    if (!res.ok) 
        throw res;
    return res.json();
  })
  .then( sites => loadDataToHotAndConsole(sites, 'data loaded')); // expected: sites = []
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
      consoleMsg(`all searched ids apear on table`,'err');
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

function addToOnChangeArr(changes) {
  if (changes) {
    let consoleErr = false;
    changes.forEach(([row, prop, oldVal, newVal]) => {
      const onChangeSiteId = parseInt(prop === 'id' ?  oldVal : hot.getData()[row][0]);
      
      if(prop !== '_id' && !(oldVal !== '' && newVal === '')){ 
        if (newVal !== '' && !isNaN(onChangeSiteId)) {
          const i = onChangeAttrArr.findIndex(obj => obj.id === onChangeSiteId);   
          
          if( i !== -1 ){
            onChangeAttrArr[i].attr[prop] = newVal;
          } else {
            let attrOnChange = {};
            attrOnChange[prop] = newVal;
            onChangeAttrArr.push({ id: onChangeSiteId , attr : attrOnChange });
          }
        }
      } else if (prop === '_id' && newVal === ''){
        hot.setDataAtCell(row, 0, oldVal);
      }
      if (oldVal !== '' && newVal === ''){
        consoleErr = true;
      }
    });
    if(consoleErr) consoleMsg('attribute deleted manually will not be updated', 'err');
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
            consoleMsg('`Name` is required if added','err');
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
  else if( idsNotFound.length === 1 ) consoleMsg(`site id ${idsNotFound} not found`,'err');
  else consoleMsg( `sites ids' ${idsNotFound} not found`,'err' );
}

function restoreFromDisplayedData(){ 
  hot.loadData(copy(displayedData)); 
}


//--->checkbox

function initCheckBox() {
  const el = document.getElementById('columns'), 
    columns = el.getElementsByTagName('input');
  
  for (let i = 0 ; i < columns.length ; i++) 
      columns[i].addEventListener('click', toggleColumn);
}

function displayFilter() {
  const filtersContainer = document.getElementById("filter-container");
  const filterButton = document.getElementById('filter-columns');
 
  if(filtersContainer.classList.contains('hidden')){
    filtersContainer.style.display = 'flex';
    filtersContainer.classList.remove('hidden');
    filterButton.innerHTML = 'hide filters';
  } else {
    filtersContainer.style.display = 'none';
    filtersContainer.classList.add('hidden');
    filterButton.innerHTML = 'show filters';
  }
}

function toggleColumn(){
  const columnIndex = parseInt(this.value);
  const hiddenColumnsPlugin = hot.getPlugin('hiddenColumns');
  this.checked ? hiddenColumnsPlugin.showColumn(columnIndex) : hiddenColumnsPlugin.hideColumn(columnIndex);
  hot.render();
}