import initActions from './actions.js';
import initHot from './hot.js';
import initConsole from './console.js';
import { getDifference, getOnDeleteWarning, copy, swalConfirm, validateIdInitBeforeLoad, isTableEmpty } from './util.js';
import initColumnsSelection from './columns-selection.js';

const HOT_ATTR_TO_STR = ['_id','name','address','type','serialNumber','phone','qrCode'];

let validDataRep = [], onChangeAttrArr = [], hot, consoleMsg, safeDelete = false;

window.onload = () => {
  onChangeAttrArr = [];
  initActions({
    onUpdateClick, 
    onDeleteClick, 
    onLoadByCityIdClick, 
    onLoadBySiteIdClick, 
    onClearClick, 
    onDownLoadCsvClick,
    onFilterColumnsClick,
    onSubmitCityIdClick
  });
  hot = initHot(addToOnChangeArr);
  consoleMsg = initConsole();
  initColumnsSelection(onColumnChange);
}

function onUpdateClick(){
  if(onChangeAttrArr.length === 0){
    consoleMsg('nothing to update', 'help');
    return;
  }
  console.log(onChangeAttrArr);
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
      .then(errors => consoleErrorsAndCheckIdsNotFound(errors));
    } else {
      swal("data update aborted");
    }    
  });
}

function onDeleteClick(){
  const sitesOnDelete = getOnDeleteFromHot();
  console.log(sitesOnDelete);
  
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
        .then(errors => consoleErrorsAndCheckIdsNotFound(errors));
      } else {
        swal("deletion aborted");
        restoreFromValidDataRep();
      }
    })
  } else {
    consoleMsg('please choose values to delete first','help');
  }
}

function onLoadByCityIdClick(){
  const cityIdContainer = document.getElementById("cityId-input-container");
  const cityId = document.getElementById("cityId-input")
  
  if(cityIdContainer.classList.contains('hidden')){
    cityIdContainer.style.display = 'flex';
    cityIdContainer.classList.remove('hidden');
  } else {
    cityIdContainer.style.display = 'none';
    cityIdContainer.classList.add('hidden');
  }
  cityId.value = "";
}

function onSubmitCityIdClick(){
  const cityIdInput = document.getElementById("cityId-input");
  const queryStr = '/sites?cityId='+cityIdInput.value;

  console.log(cityIdInput.value);
  fetch(queryStr, {
    method:'GET',
    credentials: 'include'
  })
  .then((res) => {
    if (!res.ok) 
        throw res;
    return res.json();
  })
  .then( sites => {// expected: sites = []
    if(sites.length > 0){
      loadDataToHot(sites);
      consoleMsg('sites loaded', 'msg');
      onLoadByCityIdClick();
    } else {
      consoleMsg('no sites matched `'+ cityIdInput.value + '`', 'err');
      cityIdInput.value = "";
    }
  }); 
}

function onLoadBySiteIdClick(){
  const sitesIdToLoad = getHotAndValidDataDifference();
  if( validateIdInitBeforeLoad(hot.getData()) ){
  
    if( sitesIdToLoad.length > 0 ) {

      const queryStr = `/sites?_id=[${sitesIdToLoad}]`;
      fetch(queryStr, {
        method: 'GET',
        credentials: 'include'
      })
      .then((res) => {
        if (!res.ok)
          throw res;
        return res.json();
      })
      .then( sites => {// expected: sites = []
        const idsNotFound = getDifference(sitesIdToLoad, sites.map(site => site._id));
        validDataRep.push(...sites);
        hot.loadData(copy(validDataRep));
        if( idsNotFound.length === 0 ) consoleMsg('data updated','msg');
        else if( idsNotFound.length === 1 ) consoleMsg(`site id ${idsNotFound} not found`,'err');
        else consoleMsg( `sites ids ${idsNotFound} not found`,'err' );
      });
    } else {
      restoreFromValidDataRep();
      consoleMsg(`all searched ids apear on table`,'err');
    }
  } 
}

function onClearClick() {
  if( isTableEmpty(hot.getData()) ) {
    consoleMsg('no data on table amigo','help');
  } else {
    swalConfirm('changes will not be saved\nwould you like to continue?')
    .then((willClear) => {
      if (willClear) {
        loadDataToHot([]);
        consoleMsg('data cleared', 'msg');
      }       
    });
  }
}

function onDownLoadCsvClick(){
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

function onFilterColumnsClick() {
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

function addToOnChangeArr(changes) {
  if (changes) {
    let manualDeleteTryErr = false;
    changes.forEach(([row, prop, oldVal, newVal]) => {
      const onChangeSiteId = prop === 'id' ?  oldVal : hot.getData()[row][0];
      if(prop !== '_id' && !(oldVal !== '' && newVal === '')){ 
        if (newVal !== '' && onChangeSiteId) {
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
      if (oldVal !== '' && newVal === '' && !safeDelete){
        manualDeleteTryErr = true;
      }
    });
    if(manualDeleteTryErr) 
      consoleMsg('attributes deleted manually will not be updated', 'err');
  }
}

function getOnDeleteFromHot(){
  safeDelete = true;
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
        let rowId = hot.getSourceDataAtCell(rowIndex, 0);

        if(rowId) {
          if(HOT_ATTR_TO_STR[columnIndex] !== 'name' && HOT_ATTR_TO_STR[columnIndex] !== '_id') { 
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
            if(HOT_ATTR_TO_STR[columnIndex] === 'name')
              consoleMsg('`Name` is require if added','err');
            else
              consoleMsg('`Id` attribute is immutable','err');
          }
        } 
      }
    }
    safeDelete = false;
    return onDelete;
  }
}

function loadDataToHot(sites){
    hot.loadData(sites);
    validDataRep = copy(sites);
    onChangeAttrArr = [];
    if( sites.length > 0 ) validDataRep.pop(); // <--- y comes back with undefined?
}

function restoreFromValidDataRep(){ 
  hot.loadData(copy(validDataRep)); 
}

function consoleErrorsAndCheckIdsNotFound(errors){
  const idsNotFound = getHotAndValidDataDifference();
  idsNotFound.length === 0 ? consoleMsg('data updated','msg') : consoleMsg(`Ids ${data.idsNotFound} not found`,'err');
  for ( let err of errors ) consoleMsg(err,'err');
}

function getHotAndValidDataDifference(){
  const hotIdArr = hot.getDataAtCol(0).slice(0,-1);
  const validDataRepIdArr = validDataRep.map(site => site._id);
  return getDifference(hotIdArr,validDataRepIdArr);
}

function onColumnChange(columnIndex, checked){  
  const hiddenColumnsPlugin = hot.getPlugin('hiddenColumns');
  checked ? hiddenColumnsPlugin.showColumn(columnIndex) : hiddenColumnsPlugin.hideColumn(columnIndex);
  hot.render();
}