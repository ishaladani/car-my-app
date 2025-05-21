// module.exports = {
//   webpack: {
//     configure: {
//       module: {
//         rules: [
//           {
//             test: /\.m?js$/,
//             resolve: {
//               fullySpecified: false
//             }
//           }
//         ]
//       }
//     }
//   }
// };
// craco.config.js
module.exports = {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false
            }
          }
        ]
      }
    }
  }
};