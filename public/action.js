function initActions([onUpdateClick, onDeleteClick, onLoadClick, onLoadByIdClick, onClearClick,onFilterClick,onDownLoadCsvClick ]){
  const
  updateButton = document.getElementById('update'),
  deleteButton = document.getElementById('delete'), 
  loadSitesButton = document.getElementById('load'),
  loadIdButton = document.getElementById('load-id'), 
  downloadButton = document.getElementById('download-csv'),
  clearButton = document.getElementById('clear'); 
  filterButton = document.getElementById('filter');
        
  updateButton.addEventListener('click', onUpdateClick);

  deleteButton.addEventListener('click', onDeleteClick);

  loadIdButton.addEventListener('click', onLoadByIdClick);

  loadSitesButton.addEventListener('click', onLoadClick);
  
  clearButton.addEventListener('click', onClearClick);

  filterButton.addEventListener('click', onFilterClick);

  downloadButton.addEventListener('click', onDownLoadCsvClick);
}

export default initActions;