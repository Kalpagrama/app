// // export function someApi ([from, limit, direction]) {
// //     const pagination = { from, limit, direction }

// //     return {
// //         query: gql`mutation($param: Int!) {
// //         }`,
// //         variables: {
// //             param: 0
// //         }
// //     }
// // }

// export function uploadContentUrlApi ([type, url]) {
//     return {
//         query: gql`mutation($type: ObjectTypeEnum!, $url: String!){
//             impersonate(login: "a.chernenkoit@gmail.com")
//             uploadContentUrl(type:$type, url : $url){
//                 oid
//                 type
//                 thumbUrl(preferWidth:200, preferHeight:100)
//                 name
//             }
//         }`,
//         variables: {
//             type,
//             url
//         }
//     }
// }

// export function uploadContentFileApi ([file]) {
//     return {
//         query: gql`mutation ($file: Upload!, $preferWidth: Int!, $preferHeight: Int!) {
//             uploadContentFile(file: $file) {
//               oid
//               type
//               thumbUrl(preferWidth: $preferWidth, preferHeight: $preferHeight)
//               name
//             }
//           }`,
//         variables: {
//             file,
//             preferWidth,
//             preferHeight
//         }
//     }
// }