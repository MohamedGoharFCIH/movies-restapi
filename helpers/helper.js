const mongoose = require('mongoose')


exports.objId = (id) => {
   if ((typeof id === 'string' || id instanceof String)) {
      if (id.length == 12 || id.length == 24)
         return mongoose.Types.ObjectId(id)
   }
   else{
      return id
   }

}

