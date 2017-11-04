exports.en = {
  follow: {
    title: function(user) {
      return `[[${user._id}]] started following you`;
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
      return `${user.firstName} ${user.lastName} قام${user.gender === 'male' ? '' : 'ت'} بمتابعتك`;
    },
    body: function(user) {
      return '';
    }  
  },
  accept: {
    title: function(user) {
      return `${user.firstName} ${user.lastName} قام${user.gender === 'male' ? '' : 'ت'} بالموافقة على طلب المتابعة`;
    },
    body: function(user) {
      return '';
    }
  }
};