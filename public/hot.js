function initHot(addToOnChangeArr) {
  const hot = new Handsontable(document.querySelector('#root'), {
      data: [],
      dataSchema: {_id: null, name: null, address: null, type: null, serialNumber: null, phone: null, qrCode: null},
      startRow: 2,
      startCols: 7,
      colHeaders: ['ID', 'Name', 'Address', 'Type','SerialNumber', 'Phone', 'qrCode'],
      columns: [
        {data: '_id' },
        {data: 'name'},
        {data: 'address'},
        {data: 'type'},
        {data: 'serialNumber'},
        {data: 'phone'},
        {data: 'qrCode'}
      ],
      stretchH: 'all',
      width: '100%',
      columnSorting: true,
      outsideClickDeselects: false,
      selectionMode: 'multiple',
      minSpareRows: 1,
      afterChange: (changes) => { addToOnChangeArr(changes); }
  });
  hot.updateSettings({
    cells: function (row, col, prop) {
      var cellProperties = {};
      if (hot.getDataAtRowProp(row, prop) !== null && col === 0) {
        cellProperties.editor = false;
      } else {
        cellProperties.editor = 'text';
      }
      return cellProperties;
    }
  })
  return hot;
}
export default initHot;