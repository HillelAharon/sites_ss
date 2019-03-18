function initHot() {
  return new Handsontable(document.querySelector('#root'), {
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
}
export default initHot;