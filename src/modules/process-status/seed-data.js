module.exports = [
  { key: 'ACTIVE', value: 'Active', description : 'Running process instance'},
  { key: 'COMPLETED', value: 'Completed', description : 'Completed through normal end event' },
  { key: 'INTERNALLY_TERMINATED', value: 'Terminated (Internally)', description : 'Terminated internally, for instance by terminating boundary event' },
  { key: 'EXTERNALLY_TERMINATED', value: 'Terminated (Externally)', description : 'Terminated externally, for instance through REST API' },
  { key: 'SUSPENDED', value: 'Suspended', description : 'Suspended process instances'}
];