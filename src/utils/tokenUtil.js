var tokenUtil = {
  getUserId: function(token) {
    if (token === undefined || null)
      throw new Error("Cannot pass null or undefined token"); 

    if (token.user_id === undefined)
      throw new Error("User Id is null");

    return token.user_id; 
  }
};

module.exports = tokenUtil;