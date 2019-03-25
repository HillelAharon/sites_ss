function initActions({ onUpdateClick, onDeleteClick, onLoadByCityIdClick, onLoadBySiteIdClick, onClearClick, onDownLoadCsvClick ,onFilterColumnsClick ,onSubmitCityIdClick}){
  const
  updateButton = document.getElementById('update'),
  deleteButton = document.getElementById('delete'), 
  loadByCityIdButton = document.getElementById('load-cityId'),
  submitCityIdButton = document.getElementById('submit-cityId'),
  loadBySiteIdButton = document.getElementById('load-id'), 
  downloadButton = document.getElementById('download-csv'),
  clearButton = document.getElementById('clear'),
  filterButton = document.getElementById('filter-columns');
        
  updateButton.addEventListener('click', onUpdateClick);

  deleteButton.addEventListener('click', onDeleteClick);

  loadBySiteIdButton.addEventListener('click', onLoadBySiteIdClick);

  loadByCityIdButton.addEventListener('click', onLoadByCityIdClick);
  
  clearButton.addEventListener('click', onClearClick);

  downloadButton.addEventListener('click', onDownLoadCsvClick);

  filterButton.addEventListener('click', onFilterColumnsClick); 

  submitCityIdButton.addEventListener('click', onSubmitCityIdClick);
}

export default initActions;