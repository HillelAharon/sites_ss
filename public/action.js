function initActions([onUpdateClick, onDeleteClick, onLoadClick, onLoadByIdClick, onClearClick,onDownLoadCsvClick ]){
  const
  updateButton = document.getElementById('update'),
  deleteButton = document.getElementById('delete'), 
  loadSitesButton = document.getElementById('load'),
  loadIdButton = document.getElementById('load-id'), 
  downloadButton = document.getElementById('download-csv'),
  clearButton = document.getElementById('clear'); 
        
  updateButton.addEventListener('click', onUpdateClick);

  deleteButton.addEventListener('click', onDeleteClick);

  loadIdButton.addEventListener('click', onLoadByIdClick);

  loadSitesButton.addEventListener('click', onLoadClick);
  
  clearButton.addEventListener('click', onClearClick);

  downloadButton.addEventListener('click', onDownLoadCsvClick);
}

export default initActions;