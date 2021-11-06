const axios = require('axios')
const fs = require('fs')
require('dotenv').config()

console.log('SERVICES_URL=', process.env.SERVICES_URL_DEBUG)

axios.post(`${process.env.SERVICES_URL_DEBUG}`, {
   variables: {},
   query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `
}, { headers: { 'Content-Type': 'application/json' } }).then(response => response.data)
   .then(result => {
      const possibleTypes = {};

      result.data.__schema.types.forEach(supertype => {
         if (supertype.possibleTypes) {
            possibleTypes[supertype.name] =
               supertype.possibleTypes.map(subtype => subtype.name);
         }
      });

      fs.writeFile('public/scripts/possibleTypes.json', JSON.stringify(possibleTypes), err => {
         if (err) {
            console.error('Error writing possibleTypes.json', err);
         } else {
            console.log('Fragment types successfully extracted!');
         }
      });
   });
