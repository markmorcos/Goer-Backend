exports.en = {
  request: {
    title: function(user) {
      return `[[${user._id}]] requested to follow you`;
    },
    body: function(user) {
      return '';
    }
  },
  accept: {
    title: function(user) {
    return `[[${user._id}]] accepted your follow request`;
    },
    body: function(user) {
      return '';
    }
  }
};

exports.in = {
  follow: {
    title: function(user) {
      return '';
    },
    body: function(user) {
      return '';
    }  
  },
  accept: {
    title: function(user) {
      return '';
    },
    body: function(user) {
      return '';
    }
  }
};