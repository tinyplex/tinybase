# Error Codes

To keep the library small, errors created by TinyBase use the compact format
`tinybase:<code>`, optionally followed by diagnostic details. Errors passed
through from platforms or third-party libraries retain their original format.

| Code | Meaning                                                          |
| ---- | ---------------------------------------------------------------- |
| 0    | The Store type is not supported by the Persister.                |
| 1    | Persisted content is not an array.                               |
| 2    | A chart series was used outside a CartesianChart.                |
| 3    | A Synchronizer request timed out.                                |
| 4    | A multiplexed WebSocket control request timed out.               |
| 5    | A multiplexed WebSocket closed.                                  |
| 6    | A multiplexed WebSocket channel Id is invalid.                   |
| 7    | A multiplexed WebSocket channel Id is already in use.            |
| 8    | A multiplexed WebSocket was destroyed.                           |
| 9    | Multiplexing was requested on a legacy WebSocket.                |
| 10   | Legacy synchronization was requested on a multiplexed WebSocket. |
| 11   | An IndexedDB object store operation failed.                      |
| 12   | An IndexedDB database could not be opened.                       |
| 13   | A MergeableStore could not create a later HLC.                   |
