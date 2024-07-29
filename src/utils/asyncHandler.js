const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolver(requestHandler(req, res, next)).catch((err) => next(err))
    }

}
export { asyncHandler };

// const asyncHandler = () => { };
// const asyncHandler = (fun) => () => { };
// const asyncHandler = (fun) => async () => { };

// Try catch type function
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)

//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             mesasge: error.mesasge || ""
//         })
//     }

// }