// module.exports = (fn) =>{
//     return (req,res,next) => {
//         fn(req,res,next).catch(next);
//     }
// }

module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (res.headersSent) return next(err); // ✅ don’t render error page again
    next(err);
  });
};
