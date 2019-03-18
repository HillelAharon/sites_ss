
let container, ssconsole, loadSitesButton, updateButton, hot, deleteButton, loadIdButton, downloadButton, clearButton, exportPlugin1,
displayedData = [], onChangeAttrArr = [], consoleOn = false;

const ssAttrToStr = ['_id','name','address','type','serialNumber','phone','qrCode'];

function initApp() {
  container = document.querySelector('#root');
  ssConsole = document.getElementById('console');
  loadSitesButton = document.getElementById('load');
  updateButton = document.getElementById('update');
  deleteButton = document.getElementById('delete'); 
  loadIdButton = document.getElementById('load-id'); 
  downloadButton = document.getElementById('download-csv');
  clearButton = document.getElementById('clear'); 
  
  hot = new Handsontable(container, {
      data: [],
      dataSchema: {_id: null, name: null, address: null, type: null, serialNumber: null, phone: null, qrCode: null},
      startRow: 2,
      startCols: 7,
      colHeaders: ['ID', 'Name', 'Address', 'Type','SerialNumber', 'Phone', 'qrCode'],
      columns: [
        {data: '_id'},
        {data: 'name'},
        {data: 'address'},
        {data: 'type'},
        {data: 'serialNumber'},
        {data: 'phone'},
        {data: 'qrCode'}
      ],
      autoColumnSize: {
        samplingRatio: 23
      },
      stretchH: 'all',
      width: '100%',
      columnSorting: true,
      outsideClickDeselects: false,
      selectionMode: 'multiple',
      minSpareRows: 1,
      afterChange: (changes) => {
        if (changes) {
          changes.forEach(([row, prop, oldValue, newValue]) => {
            const onChangeId = prop === 'id' ?  oldValue : hot.getData()[row][0];
            addToOnChangeArr(onChangeId,prop, oldValue, newValue);
          });
        }
      }
  });

  exportPlugin1 = hot.getPlugin('exportFile');

  loadSitesButton.addEventListener('click', () => {
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
      hot.loadData(sites);
      displayedData= copy(sites);
      displayedData.pop();
      consoleMsg('data loaded', 'msg');
    });
  }); 
      
  updateButton.addEventListener('click', () => {
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
        .then(respData => {
          console.log('do something with respData');
        });
      } else {
        swal("data update aborted");
      }
    });
   
  });

  deleteButton.addEventListener('click', () => {
    const sitesOnDelete = getOnDeleteFromHot();
    
    if(sitesOnDelete.length > 0){
      swalConfirm(getOnDeleteWarning(sitesOnDelete))
      .then((willDelete) => {
        if(willDelete){
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
          hot.loadData(copy(displayedData));
        }
      })
    } else {
      consoleMsg('please choose values to delete first','help');
    }
  });

  loadIdButton.addEventListener('click', () => {
    const sitesIdToLoad = difference(hot.getDataAtCol(0));
    
    if(!validateIdInitBeforeLoad()){
      consoleMsg('please insert id first','help');
      return;
    }
    if( sitesIdToLoad.length > 0) {
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
      .then(data => {
        displayedData.push(...data.sites);
        hot.loadData(copy(displayedData));
        if(data.idsNotFound.length === 0) consoleMsg('data updated','msg');
        else if(data.idsNotFound.length === 1) consoleMsg(`error: site id ${data.idsNotFound} not found`,'err');
        else consoleMsg(`error: sites ids' ${data.idsNotFound} not found`,'err')
      });                               
    } else {
      hot.loadData(copy(displayedData));
      consoleMsg(`error: all searched ids apear on table`,'err');
    }
  });
  
  downloadButton.addEventListener('click', () => {
    exportPlugin1.downloadFile('csv', {
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
  });

  clearButton.addEventListener('click', () => {
    if(hot.getData().length === 1 && hot.getData()[0].filter(attr => attr !== null).length === 0){
      consoleMsg('no data on table amigo','help');
    } else {
      swalConfirm('changes will not be saved\nwould you like to continue?')
      .then((willClear) => {
        if (willClear) {
          hot.loadData([]);
          displayedData = [];
          onChangeAttrArr = [];
          consoleMsg('data cleared','msg');
        }       
      });
    }
  });
}


function consoleMsg(msg,type){
  if(!consoleOn) {
    consoleOn = true;
    const color = type === 'err' ?  'rgb(179, 58, 72)' : type === 'msg' ? 'rgb(72, 67, 172)' : 'gray';
    ssConsole.style.color = color;
    ssConsole.innerText = msg;
    setTimeout(() => { ssConsole.innerText = ''; consoleOn = false;}, 3000);
  }
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
          if(ssAttrToStr[columnIndex] !== 'name') { 
            hot.setDataAtCell(rowIndex, columnIndex, '');
            const i = onDelete.findIndex(obj => obj.id === rowId);   
            if( i !== -1 ) {
              onDelete[i].attr[ssAttrToStr[columnIndex]] = "";
            } else {
              let attrOnDelete = {};
              attrOnDelete[ssAttrToStr[columnIndex]] = "";
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

function getOnDeleteWarning(onDeleteArr){
  let confirmStr = 'you are about to delete:\n';
  for(let i = 0; i < onDeleteArr.length; i++)
   confirmStr = confirmStr.concat(`site id: ${onDeleteArr[i].id}-> attributes: ${Object.keys(onDeleteArr[i].attr).map(a => a + ' ')}\n`); 
  return confirmStr;
}

function difference(idArr) {
  let _difference = new Set(idArr.slice(0,-1).map(id => parseInt(id)));
  for (let elem of displayedData.map(site => site._id)) 
      _difference.delete(elem);
  return copy(Array.from(_difference));
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

function validateIdInitBeforeLoad(){ return hot.getData().filter(site => site[0] !== null).length !== 0; }


window.onload = () => {
  initApp();
}