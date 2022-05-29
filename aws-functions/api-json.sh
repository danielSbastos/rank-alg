curl -X POST https://6bbt8vjusc.execute-api.us-east-2.amazonaws.com/json -H "content-type: application/json" -d '{ "scales": { "2": { "min": 0, "max": 1 }, "3": { "min": 0, "max": 2 }, "4": { "min": 0, "max": 3 } }, "objects": [ { "data": [1, 2, 2], "scales": [2, 2, 3], "merits": [1, 1, 1] }, { "data": [1, 2, 3], "scales": [2, 2, 3], "merits": [1, 1, 1] }, { "data": [1, 1, 1], "scales": [2, 2, 3], "merits": [1, 1, 1] }  ] }'  -H "x-api-key: <>"

curl -X POST https://6bbt8vjusc.execute-api.us-east-2.amazonaws.com/json/csv -F "data=@data-categorical.dat" -H "x-api-key: <>" -H "content-type: text/csv" | jq .body.data | xargs -0 printf "%b"

