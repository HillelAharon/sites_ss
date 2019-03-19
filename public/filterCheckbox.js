
// function initCheckBox(hot) {
//   const el = document.getElementById('columns'), 
//     columns = el.getElementsByTagName('input');
  
//   for (let i = 0 ; i < columns.length ; i++) 
//       columns[i].addEventListener('click', toggleColumn(hot));
// }


// function displayFilter() {
//   const filtersContainer = document.getElementById("filter-container");
//   const filterButton = document.getElementById('filter-columns');
 
//   if(filtersContainer.classList.contains('hidden')){
//     filtersContainer.style.display = 'flex';
//     filtersContainer.classList.remove('hidden');
//     filterButton.innerHTML = 'hide filters';
//   } else {
//     filtersContainer.style.display = 'none';
//     filtersContainer.classList.add('hidden');
//     filterButton.innerHTML = 'show filters';
//   }
// }

// function toggleColumn(hot){
//   const columnIndex = parseInt(this.value);
//   const hiddenColumnsPlugin = hot.getPlugin('hiddenColumns');
//   this.checked ? hiddenColumnsPlugin.showColumn(columnIndex) : hiddenColumnsPlugin.hideColumn(columnIndex);
//   hot.render();
// }



export { displayFilter, initCheckBox }