export const FILE_TYPES = [
  { type: 'PDF', extension: '.pdf' },
  { type: 'Word Document', extension: '.docx' },
  { type: 'Excel Spreadsheet', extension: '.xlsx' },
  { type: 'Text File', extension: '.txt' },
  { type: 'Image', extension: '.png' }
];

export const generateRandomFileType = () => {
  return FILE_TYPES[Math.floor(Math.random() * FILE_TYPES.length)];
};