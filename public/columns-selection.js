
function initColumnsSelection(onColumnChange) {
  const el = document.getElementById('columns');
  const columns = el.getElementsByTagName('input');
 
  for (let i = 0 ; i < columns.length ; i++)  {
    columns[i].addEventListener('click', function(e) {
      const columnIndex = parseInt(this.value);
      onColumnChange(columnIndex, this.checked)
    });
  }
}

export default initColumnsSelection;
